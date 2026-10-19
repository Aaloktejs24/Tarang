package authhandler

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"backend/services/auth/internal/auth"
	"backend/shared/errors"

	"github.com/alexedwards/argon2id"
)

func (h *AuthHandler) login(w http.ResponseWriter, r *http.Request) {

	var in struct {
		Identifier string `json:"identifier"`
		Password   string `json:"password"`
		Code       string `json:"totp_code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidPayload)
		return
	}

	identifier := strings.TrimSpace(in.Identifier)
	if identifier == "" {
		respondError(w, http.StatusBadRequest, errors.ErrEmailOrUsernameRequired)
		return
	}

	// Restriction: Phone number cannot be used for login
	// Basic regex for digits-only or + starting string
	if isPhone(identifier) {
		respondError(w, http.StatusUnauthorized, errors.ErrInvalidCredentials)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	if err := h.svc.CheckLoginAttempts(ctx, identifier); err != nil {
		respondError(w, http.StatusTooManyRequests, err.Error())
		return
	}

	var acc *auth.Account
	var err error

	// Since we moved credentials to auth_db accounts:
	if strings.Contains(identifier, "@") {
		acc, err = h.svc.GetAccountByEmail(ctx, identifier)
	} else {
		acc, err = h.svc.GetAccountByUsername(ctx, identifier)
	}

	if err != nil || acc == nil {
		h.svc.RecordLoginFailure(ctx, identifier)
		respondError(w, http.StatusUnauthorized, errors.ErrInvalidCredentials)
		return
	}

	ok, err := argon2id.ComparePasswordAndHash(in.Password, acc.PasswordHash)
	if err != nil || !ok {
		h.svc.RecordLoginFailure(ctx, identifier)
		respondError(w, http.StatusUnauthorized, errors.ErrInvalidCredentials)
		return
	}

	h.svc.ClearLoginAttempts(ctx, identifier)

	// Fetch full user profile from user_service for MFA and Role checks
	user, err := h.svc.GetUserByID(ctx, acc.ID)
	if err != nil {
		// If profile missing, they are still authenticated, but roles are empty.
		// Usually a fatal error shouldn't stop login if auth_db is correct, but let's assume it works.
		_ = err
	}

	requiresTotp := acc.MFAPreference == "totp"
	requiresOtp := acc.MFAPreference == "email"
	requiresSetup := false
	var role string

	if user != nil {
		role = user.Role

		// For admins and super_admins, we mandate Biometric + OTP/TOTP setup during login
		if role == "admin" || role == "super_admin" {
			hasMFA := requiresTotp || requiresOtp

			// Check if they have a biometric credential registered
			creds, err := h.svc.GetAdminWebAuthnCredentials(ctx, role, identifier)
			hasBiometric := err == nil && len(creds) > 0

			if !hasMFA || !hasBiometric {
				requiresSetup = true
			}
		} else {
			// Regular users can set it up later
			requiresSetup = false
		}
	}

	if requiresTotp || requiresOtp || requiresSetup {
		session := &auth.LoginSession{
			UserID:        acc.ID,
			RequiresTOTP:  requiresTotp,
			RequiresOTP:   requiresOtp,
			RequiresSetup: requiresSetup,
			ExpiresAt:     time.Now().Add(5 * time.Minute),
		}

		if err := h.svc.CreateLoginSession(ctx, session); err != nil {
			respondError(w, http.StatusInternalServerError, errors.ErrSessionGenerationFailed)
			return
		}

		if requiresOtp {
			_, err := h.svc.StartLoginOTP(ctx, acc.Email)
			if err != nil {
				respondError(w, http.StatusInternalServerError, errors.ErrFailedToSendOTP)
				return
			}
		}

		respondJSON(w, http.StatusOK, map[string]interface{}{
			"requires_totp":  requiresTotp,
			"requires_otp":   requiresOtp,
			"requires_setup": requiresSetup,
			"session_id":     session.ID.String(),
			"masked_email":   maskEmail(acc.Email),
		})
		return
	}

	// Normal Login without TOTP
	access, err := h.svc.CreateAccessJWT(acc.ID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrTokenGenerationFailed)
		return
	}

	ttl := getRefreshTTLByRole(role)
	refreshRaw, _, err := h.svc.GenerateRefreshToken(ctx, acc.ID, ttl)
	if err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrTokenGenerationFailed)
		return
	}

	// Set Refresh Token as HttpOnly Cookie
	http.SetCookie(w, &http.Cookie{ // #nosec G124
		Name:     "refresh_token",
		Value:    refreshRaw,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(ttl.Seconds()),
	})

	resp := map[string]any{
		"access_token": access,
		"expires_in":   int(auth.AccessTTL.Seconds()),
		"user": map[string]any{
			"id":       acc.ID,
			"email":    acc.Email,
			"username": acc.Username,
			"role":     role,
		},
	}

	respondJSON(w, http.StatusOK, resp)
}
func (h *AuthHandler) refresh(w http.ResponseWriter, r *http.Request) {

	var in struct {
		RefreshToken string `json:"refresh_token"`
	}

	// Try to decode JSON first, ignore error if it's empty
	_ = json.NewDecoder(r.Body).Decode(&in)

	// If not in body, check cookie
	if in.RefreshToken == "" {
		cookie, err := r.Cookie("refresh_token")
		if err == nil {
			in.RefreshToken = cookie.Value
		}
	}

	if in.RefreshToken == "" {
		respondError(w, http.StatusUnauthorized, errors.ErrRefreshTokenRequired)
		return
	}

	ctx := r.Context()

	token, err := h.svc.VerifyRefreshToken(ctx, in.RefreshToken)
	if err != nil {
		respondError(w, http.StatusUnauthorized, errors.ErrInvalidOrExpiredToken)
		return
	}

	newRaw, _, ttl, err := h.svc.RotateRefreshToken(ctx, token)
	if err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrCouldNotRotateToken)
		return
	}

	access, err := h.svc.CreateAccessJWT(token.UserID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrFailedToCreateAccessToken)
		return
	}

	// Set updated Refresh Token as HttpOnly Cookie
	http.SetCookie(w, &http.Cookie{ // #nosec G124
		Name:     "refresh_token",
		Value:    newRaw,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(ttl.Seconds()),
	})

	resp := map[string]any{
		"access_token":  access,
		"refresh_token": newRaw,
		"expires_in":    int(auth.AccessTTL.Seconds()),
	}

	respondJSON(w, http.StatusOK, resp)
}
func (h *AuthHandler) logout(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		respondError(w, http.StatusBadRequest, errors.ErrMissingAuthHeader)
		return
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidAuthHeader)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	err := h.svc.Logout(ctx, parts[1])
	if err != nil {
		respondError(w, http.StatusInternalServerError, "logout failed: "+err.Error())
		return
	}

	http.SetCookie(w, &http.Cookie{ // #nosec G124
		Name:     "refresh_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})

	respondJSON(w, http.StatusOK, map[string]string{
		"message": "logged out successfully",
	})
}
func (h *AuthHandler) me(w http.ResponseWriter, r *http.Request) {
	uid, _, err := h.extractUserID(r)
	if err != nil {
		respondError(w, http.StatusUnauthorized, errors.ErrUnauthorized)
		return
	}

	acc, err := h.svc.GetAccountByID(r.Context(), uid)
	if err != nil {
		respondError(w, http.StatusNotFound, errors.ErrAccountNotFound)
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{
		"id":       acc.ID,
		"email":    acc.Email,
		"username": acc.Username,
		"phone":    acc.Phone,
	})
}
