package authhandler

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"backend/services/auth/internal/auth"
	"backend/shared/errors"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type AuthHandler struct {
	svc *auth.Service
}
func NewAuthHandler(s *auth.Service) *AuthHandler {
	return &AuthHandler{svc: s}
}
func getRefreshTTLByRole(role string) time.Duration {
	if role == "admin" || role == "super_admin" {
		return auth.AdminRefreshTTL
	}
	return auth.RefreshTTL
}
func (h *AuthHandler) RegisterRoutes(r chi.Router) {

	r.Post("/registration-sessions", h.registerStart)
	r.Post("/registration-sessions/{id}/send-email-otp", h.sendRegistrationEmailOtp)
	r.Post("/registration-sessions/{id}/verify-email-otp", h.verifyRegistrationEmailOtp)
	r.Post("/registration-sessions/{id}/totp-setup", h.registrationTotpSetup)
	r.Post("/registration-sessions/{id}/complete", h.completeRegistrationSession)

	r.Get("/check-username", h.checkUsername)
	r.Get("/check-username/{username}", h.checkUsername)

	r.Get("/check-email", h.checkEmail)
	r.Get("/check-email/{email}", h.checkEmail)

	r.Post("/login", h.login)
	r.Post("/refresh", h.refresh)

	r.Post("/forgot-password", h.forgotPassword)
	r.Post("/reset-password", h.resetPassword)

	r.Post("/verify-phone/start", h.verifyPhoneStart)
	r.Post("/verify-phone/confirm", h.verifyPhoneConfirm)

	r.Post("/totp/setup", h.totpSetup)
	r.Post("/totp/verify", h.totpVerify)
	r.Post("/login/totp", h.loginTOTP)
	r.Post("/login/otp", h.loginOTP)
	r.Post("/settings/mfa", h.settingsMFA)
	r.Post("/register/resend", h.resendOTP)
	r.Post("/logout", h.logout)
	r.Get("/me", h.me)

	// Admin Token & Super Admin Routes
	r.Post("/admin-token/validate", h.validateAdminToken)

	r.Get("/super-admin/token", h.getSuperAdminToken)
	r.Post("/super-admin/send-email", h.sendSuperAdminEmail)

	h.registerAdminWebAuthnRoutes(r)

	// Auth APIs
	r.Post("/login", h.login)
}
func (h *AuthHandler) extractUserID(r *http.Request) (uuid.UUID, bool, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		fmt.Printf("TOKEN_DEBUG: [EMPTY] No Authorization header found\n")
		return uuid.Nil, false, fmt.Errorf(errors.ErrMissingAuthHeader)
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		fmt.Printf("TOKEN_DEBUG: [MALFORMED] Header: %s\n", authHeader)
		return uuid.Nil, false, fmt.Errorf(errors.ErrInvalidAuthHeader)
	}

	token := parts[1]
	uid, totpPending, err := h.svc.VerifyJWT(token)
	if err != nil {
		fmt.Printf("TOKEN_DEBUG: [VERIFY_FAILED] Error: %v, Token_Prefix: %s...\n", err, token[:10])
		return uuid.Nil, false, err
	}

	fmt.Printf("TOKEN_DEBUG: [SUCCESS] UID: %s, TOTP_Pending: %v\n", uid, totpPending)
	return uid, totpPending, nil
}
func isPhone(s string) bool {
	// Simple check: if it's mostly digits or starts with +
	if len(s) == 0 {
		return false
	}
	if s[0] == '+' {
		return true
	}
	// Check if numeric
	for _, c := range s {
		if c < '0' || c > '9' {
			return false
		}
	}
	return true
}
func maskEmail(email string) string {
	if !strings.Contains(email, "@") {
		return email // Not an email
	}
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return email
	}
	user := parts[0]
	domain := parts[1]

	if len(user) <= 1 {
		return user + "***@" + domain
	}
	if len(user) == 2 {
		return string(user[0]) + "***" + string(user[1]) + "@" + domain
	}

	return string(user[0]) + "***" + string(user[len(user)-1]) + "@" + domain
}
