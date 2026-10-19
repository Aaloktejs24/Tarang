package authhandler

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"backend/shared/errors"

	"github.com/google/uuid"
)

func (h *AuthHandler) verifyPhoneStart(w http.ResponseWriter, r *http.Request) {
	var in struct {
		UserID string `json:"user_id"`
		Phone  string `json:"phone"`
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidPayload)
		return
	}

	uid, err := uuid.Parse(in.UserID)
	if err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidUserIdentifier)
		return
	}

	// Security Patch: Prevent verifying unlinked phone numbers
	user, err := h.svc.GetUserByID(r.Context(), uid)
	if err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrUserNotFound)
		return
	}

	if user.Phone == "" {
		respondError(w, http.StatusBadRequest, errors.ErrNoPhoneLinked)
		return
	}

	if user.Phone != in.Phone {
		respondError(w, http.StatusBadRequest, errors.ErrPhoneMismatch)
		return
	}

	_, err = h.svc.StartPhoneVerification(r.Context(), uid, in.Phone)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message": "OTP sent to phone",
	})
}
func (h *AuthHandler) verifyPhoneConfirm(w http.ResponseWriter, r *http.Request) {
	var in struct {
		UserID string `json:"user_id"`
		Phone  string `json:"phone"`
		Code   string `json:"otp"`
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidPayload)
		return
	}

	uid, err := uuid.Parse(in.UserID)
	if err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidUserIdentifier)
		return
	}

	err = h.svc.VerifyPhone(r.Context(), uid, in.Phone, in.Code)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message": "phone verified successfully",
	})
}
func (h *AuthHandler) totpSetup(w http.ResponseWriter, r *http.Request) {

	// TOTP setup typically happens AFTER login when requires_setup is true
	// We'll use session_id for setup as well if temp tokens are gone.
	// Wait, totpSetup was previously using extractUserID which reads the Bearer token (temp_token or access_token).
	// Let's modify totpSetup to check for session_id in body if it's during setup flow,
	// or fallback to extractUserID for authenticated users setting it up from settings.
	// Actually, settingsMFA and login flows are distinct. Let's adapt it to check session_id in payload for setup.

	var in struct {
		SessionID string `json:"session_id"`
	}

	var uid uuid.UUID
	// Try parsing body for session_id
	if err := json.NewDecoder(r.Body).Decode(&in); err == nil && in.SessionID != "" {
		sessionUUID, err := uuid.Parse(in.SessionID)
		if err != nil {
			respondError(w, http.StatusBadRequest, errors.ErrInvalidSessionID)
			return
		}
		session, err := h.svc.GetLoginSessionByID(r.Context(), sessionUUID)
		if err != nil || session.ExpiresAt.Before(time.Now()) {
			respondError(w, http.StatusUnauthorized, errors.ErrInvalidOrExpiredSession)
			return
		}
		uid = session.UserID
	} else {
		// Fallback to Bearer token for logged-in users
		var err error
		uid, _, err = h.extractUserID(r)
		if err != nil {
			respondError(w, http.StatusUnauthorized, errors.ErrUnauthorized)
			return
		}
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	user, err := h.svc.GetUserByID(ctx, uid)
	if err != nil {
		respondError(w, http.StatusNotFound, errors.ErrUserNotFound)
		return
	}

	secret, url, err := h.svc.GenerateTOTPSecret(user.Email)
	if err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrInternalServer)
		return
	}

	// Store the secret but don't enable yet
	err = h.svc.SetUserTOTPSecret(ctx, uid, secret)
	if err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrCouldNotSetupTOTP)
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"secret": secret,
		"url":    url,
	})
}
func (h *AuthHandler) totpVerify(w http.ResponseWriter, r *http.Request) {

	var in struct {
		SessionID string `json:"session_id"`
		Code      string `json:"code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidPayload)
		return
	}

	var uid uuid.UUID
	if in.SessionID != "" {
		sessionUUID, err := uuid.Parse(in.SessionID)
		if err != nil {
			respondError(w, http.StatusBadRequest, errors.ErrInvalidSessionID)
			return
		}
		session, err := h.svc.GetLoginSessionByID(r.Context(), sessionUUID)
		if err != nil || session.ExpiresAt.Before(time.Now()) {
			respondError(w, http.StatusUnauthorized, errors.ErrInvalidOrExpiredSession)
			return
		}
		uid = session.UserID
		// Delete session after successful verification happens below
		defer func() { _ = h.svc.DeleteLoginSession(r.Context(), sessionUUID) }()
	} else {
		var err error
		uid, _, err = h.extractUserID(r)
		if err != nil {
			respondError(w, http.StatusUnauthorized, errors.ErrUnauthorized)
			return
		}
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	acc, err := h.svc.GetAccountByID(ctx, uid)
	if err != nil {
		respondError(w, http.StatusNotFound, errors.ErrAccountNotFound)
		return
	}

	if acc.TOTPSecret == nil || *acc.TOTPSecret == "" {
		respondError(w, http.StatusUnauthorized, errors.ErrTOTPNotSetup)
		return
	}

	if !h.svc.ValidateTOTP(*acc.TOTPSecret, in.Code) {
		respondError(w, http.StatusUnauthorized, errors.ErrInvalidCode)
		return
	}

	// Verify and Enable
	err = h.svc.UpdateUserMFAPreference(ctx, uid, "totp")
	if err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrCouldNotEnableTOTP)
		return
	}

	// Issue full tokens now that TOTP is verified
	access, err := h.svc.CreateAccessJWT(acc.ID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrTokenGenerationFailed)
		return
	}

	user, err := h.svc.GetUserByID(ctx, uid)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "user profile not found")
		return
	}

	ttl := getRefreshTTLByRole(user.Role)
	refreshRaw, _, err := h.svc.GenerateRefreshToken(ctx, user.ID, ttl)
	if err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrTokenGenerationFailed)
		return
	}

	http.SetCookie(w, &http.Cookie{ // #nosec G124
		Name:     "refresh_token",
		Value:    refreshRaw,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(ttl.Seconds()),
	})

	respondJSON(w, http.StatusOK, map[string]any{
		"access_token":  access,
		"refresh_token": refreshRaw,
		"message":       "TOTP enabled successfully",
	})
}
func (h *AuthHandler) loginTOTP(w http.ResponseWriter, r *http.Request) {

	var in struct {
		SessionID string `json:"session_id"`
		Code      string `json:"code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidPayload)
		return
	}

	if in.SessionID == "" {
		respondError(w, http.StatusUnauthorized, errors.ErrSessionIDRequired)
		return
	}

	sessionUUID, err := uuid.Parse(in.SessionID)
	if err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidSessionID)
		return
	}

	session, err := h.svc.GetLoginSessionByID(r.Context(), sessionUUID)
	if err != nil || session.ExpiresAt.Before(time.Now()) {
		respondError(w, http.StatusUnauthorized, errors.ErrInvalidOrExpiredSession)
		return
	}

	if !session.RequiresTOTP {
		respondError(w, http.StatusBadRequest, errors.ErrTOTPVerificationNotReq)
		return
	}

	// Delete session after successful verification happens below
	defer func() { _ = h.svc.DeleteLoginSession(r.Context(), sessionUUID) }()
	uid := session.UserID

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	acc, err := h.svc.GetAccountByID(ctx, uid)
	if err != nil {
		respondError(w, http.StatusNotFound, errors.ErrAccountNotFound)
		return
	}

	if acc.MFAPreference != "totp" {
		respondError(w, http.StatusBadRequest, errors.ErrTOTPNotEnabledForUser)
		return
	}

	if acc.TOTPSecret == nil || !h.svc.ValidateTOTP(*acc.TOTPSecret, in.Code) {
		respondError(w, http.StatusUnauthorized, errors.ErrInvalidCode)
		return
	}

	user, err := h.svc.GetUserByID(ctx, uid)
	if err != nil {
		respondError(w, http.StatusNotFound, errors.ErrUserNotFound)
		return
	}

	// Success, issue full tokens
	access, err := h.svc.CreateAccessJWT(acc.ID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrTokenGenerationFailed)
		return
	}

	ttl := getRefreshTTLByRole(user.Role)
	refreshRaw, _, err := h.svc.GenerateRefreshToken(ctx, user.ID, ttl)
	if err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrTokenGenerationFailed)
		return
	}

	http.SetCookie(w, &http.Cookie{ // #nosec G124
		Name:     "refresh_token",
		Value:    refreshRaw,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(ttl.Seconds()),
	})

	respondJSON(w, http.StatusOK, map[string]any{
		"access_token":  access,
		"refresh_token": refreshRaw,
	})
}
func (h *AuthHandler) loginOTP(w http.ResponseWriter, r *http.Request) {

	var in struct {
		SessionID string `json:"session_id"`
		Code      string `json:"code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidPayload)
		return
	}

	if in.SessionID == "" {
		respondError(w, http.StatusUnauthorized, errors.ErrSessionIDRequired)
		return
	}

	sessionUUID, err := uuid.Parse(in.SessionID)
	if err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidSessionID)
		return
	}

	session, err := h.svc.GetLoginSessionByID(r.Context(), sessionUUID)
	if err != nil || session.ExpiresAt.Before(time.Now()) {
		respondError(w, http.StatusUnauthorized, errors.ErrInvalidOrExpiredSession)
		return
	}

	if !session.RequiresOTP {
		respondError(w, http.StatusBadRequest, errors.ErrOTPVerificationNotReq)
		return
	}

	// Delete session after successful verification happens below
	defer func() { _ = h.svc.DeleteLoginSession(r.Context(), sessionUUID) }()
	uid := session.UserID

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	acc, err := h.svc.GetAccountByID(ctx, uid)
	if err != nil {
		respondError(w, http.StatusNotFound, errors.ErrAccountNotFound)
		return
	}

	if acc.MFAPreference != "email" {
		respondError(w, http.StatusBadRequest, errors.ErrEmailOTPNotEnabled)
		return
	}

	ok, err := h.svc.VerifyOTP(ctx, "login", acc.Email, in.Code)
	if err != nil || !ok {
		respondError(w, http.StatusUnauthorized, errors.ErrInvalidOrExpiredOTP)
		return
	}

	user, err := h.svc.GetUserByID(ctx, uid)
	if err != nil {
		respondError(w, http.StatusNotFound, errors.ErrUserNotFound)
		return
	}

	// Success, issue full tokens
	access, err := h.svc.CreateAccessJWT(acc.ID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrTokenGenerationFailed)
		return
	}

	ttl := getRefreshTTLByRole(user.Role)
	refreshRaw, _, err := h.svc.GenerateRefreshToken(ctx, user.ID, ttl)
	if err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrTokenGenerationFailed)
		return
	}

	http.SetCookie(w, &http.Cookie{ // #nosec G124
		Name:     "refresh_token",
		Value:    refreshRaw,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(ttl.Seconds()),
	})

	respondJSON(w, http.StatusOK, map[string]any{
		"access_token":  access,
		"refresh_token": refreshRaw,
	})
}
func (h *AuthHandler) settingsMFA(w http.ResponseWriter, r *http.Request) {

	var in struct {
		Preference string `json:"preference"`
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidPayload)
		return
	}

	pref := strings.ToLower(in.Preference)
	if pref != "none" && pref != "totp" && pref != "email" {
		respondError(w, http.StatusBadRequest, "invalid preference. must be none, totp, or email")
		return
	}

	uid, _, err := h.extractUserID(r)
	if err != nil {
		respondError(w, http.StatusUnauthorized, errors.ErrUnauthorized)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	user, err := h.svc.GetUserByID(ctx, uid)
	if err != nil {
		respondError(w, http.StatusNotFound, errors.ErrUserNotFound)
		return
	}

	if user.Role == "admin" && pref == "none" {
		respondError(w, http.StatusForbidden, errors.ErrAdminsMustHaveMFA)
		return
	}

	if pref == "totp" && user.TOTPSecret == "" {
		respondError(w, http.StatusBadRequest, errors.ErrTOTPNotSetup)
		return
	}

	err = h.svc.UpdateUserMFAPreference(ctx, user.ID, pref)
	if err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrFailedToUpdatePreference)
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message": "mfa preference updated",
	})
}
