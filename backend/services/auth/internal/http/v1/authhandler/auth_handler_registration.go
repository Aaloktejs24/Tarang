package authhandler

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"backend/services/auth/internal/auth"
	"backend/shared/errors"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (h *AuthHandler) registerStart(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Email string `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidPayload)
		return
	}

	if in.Email == "" {
		respondError(w, http.StatusBadRequest, errors.ErrEmailRequired)
		return
	}

	session, err := h.svc.RegisterStart(r.Context(), in.Email)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"session_id":   session.ID.String(),
		"message":      "OTP sent to email",
		"masked_email": maskEmail(session.Email),
	})
}
func (h *AuthHandler) sendRegistrationEmailOtp(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	sessionID, err := uuid.Parse(idStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidSessionID)
		return
	}

	err = h.svc.SendRegistrationOTP(r.Context(), sessionID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "OTP sent via email"})
}
func (h *AuthHandler) verifyRegistrationEmailOtp(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	sessionID, err := uuid.Parse(idStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidSessionID)
		return
	}

	var in struct {
		OTP string `json:"otp"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidPayload)
		return
	}

	if err := h.svc.VerifyRegistrationOTP(r.Context(), sessionID, in.OTP); err != nil {
		respondError(w, http.StatusUnauthorized, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Email verified successfully"})
}
func (h *AuthHandler) registrationTotpSetup(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	sessionID, err := uuid.Parse(idStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidSessionID)
		return
	}

	secret, url, err := h.svc.SetupRegistrationTOTP(r.Context(), sessionID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"secret": secret,
		"url":    url,
	})
}
func (h *AuthHandler) completeRegistrationSession(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	sessionID, err := uuid.Parse(idStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidSessionID)
		return
	}

	var in struct {
		Username string `json:"username"`
		Password string `json:"password"`
		FullName string `json:"full_name"`
		Role     string `json:"role"`
		Phone    string `json:"phone"`
		Dob      string `json:"dob"`
		Gender   string `json:"gender"`
		TotpCode string `json:"totp_code"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidPayload)
		return
	}

	if in.FullName == "" {
		respondError(w, http.StatusBadRequest, errors.ErrFullNameRequired)
		return
	}

	if in.Role == "" {
		respondError(w, http.StatusBadRequest, errors.ErrRoleRequired)
		return
	}

	if len(in.Password) < 8 {
		respondError(w, http.StatusBadRequest, errors.ErrPasswordTooShort)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	acc, err := h.svc.CompleteRegistrationSession(ctx, sessionID, in.Username, in.Password, in.FullName, in.Role, in.Phone, in.Dob, in.Gender, in.TotpCode)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Generate tokens
	access, err := h.svc.CreateAccessJWT(acc.ID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrRegSucceededTokenFailed)
		return
	}

	ttl := getRefreshTTLByRole(in.Role)
	refreshRaw, _, err := h.svc.GenerateRefreshToken(ctx, acc.ID, ttl)
	if err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrRegSucceededTokenFailed)
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

	data := map[string]any{
		"message":      "account created successfully",
		"access_token": access,
		"expires_in":   int(auth.AccessTTL.Seconds()),
		"user": map[string]any{
			"id":       acc.ID,
			"email":    acc.Email,
			"username": acc.Username,
		},
	}
	respondJSON(w, http.StatusCreated, data)
}
func (h *AuthHandler) checkUsername(w http.ResponseWriter, r *http.Request) {
	username := strings.TrimSpace(r.URL.Query().Get("username"))
	if username == "" {
		// Try path param
		username = chi.URLParam(r, "username")
	}

	if username == "" {
		respondError(w, http.StatusBadRequest, errors.ErrUsernameRequired)
		return
	}

	_, errAcc := h.svc.GetAccountByUsername(r.Context(), username)
	_, errUser := h.svc.GetUserByUsername(r.Context(), username)

	if errAcc == nil || errUser == nil {
		// Taken
		respondJSON(w, http.StatusOK, map[string]any{"available": false})
		return
	}

	respondJSON(w, http.StatusOK, map[string]any{"available": true})
}
func (h *AuthHandler) checkEmail(w http.ResponseWriter, r *http.Request) {
	email := strings.TrimSpace(r.URL.Query().Get("email"))
	if email == "" {
		email = chi.URLParam(r, "email")
	}

	if email == "" {
		respondError(w, http.StatusBadRequest, errors.ErrEmailRequired)
		return
	}

	// Normalize to lowercase
	email = strings.ToLower(strings.TrimSpace(email))

	_, err := h.svc.GetAccountByEmail(r.Context(), email)
	if err != nil {
		// Not found => available
		respondJSON(w, http.StatusOK, map[string]any{"available": true})
		return
	}
	respondJSON(w, http.StatusOK, map[string]any{"available": false})
}
func (h *AuthHandler) resendOTP(w http.ResponseWriter, r *http.Request) {

	var in struct {
		Target  string `json:"target"`
		Purpose string `json:"purpose"`
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidPayload)
		return
	}

	if in.Target == "" {
		respondError(w, http.StatusBadRequest, errors.ErrTargetRequired)
		return
	}

	// Default purpose to register for backward compatibility if needed,
	// but usually it should be provided.
	purpose := in.Purpose
	if purpose == "" {
		purpose = "register"
	}

	target, err := h.svc.ResendOTP(r.Context(), purpose, in.Target)
	if err != nil {
		if err.Error() == errors.ErrUserNotFound {
			// Generic message to avoid enumeration
			respondJSON(w, http.StatusOK, map[string]string{
				"message": "OTP sent",
			})
			return
		}
		if strings.Contains(err.Error(), "please wait") || strings.Contains(err.Error(), "maximum OTP") {
			respondError(w, http.StatusTooManyRequests, err.Error())
			return
		}
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message":      "OTP sent",
		"masked_email": maskEmail(target),
	})
}
