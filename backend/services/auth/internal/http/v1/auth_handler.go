package v1

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"backend/services/auth/internal/auth"

	"github.com/alexedwards/argon2id"
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

	// Admin Token & Super Admin Routes
	r.Post("/admin-token/validate", h.validateAdminToken)

	r.Get("/super-admin/token", h.getSuperAdminToken)
	r.Post("/super-admin/send-email", h.sendSuperAdminEmail)


	h.registerAdminWebAuthnRoutes(r)

	// Auth APIs
	r.Post("/login", h.login)
}

////////////////////////////////////////////////////////
//// REGISTRATION SESSIONS
////////////////////////////////////////////////////////

func (h *AuthHandler) registerStart(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Email string `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	if in.Email == "" {
		respondError(w, http.StatusBadRequest, "email required")
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
		respondError(w, http.StatusBadRequest, "invalid session id")
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
		respondError(w, http.StatusBadRequest, "invalid session id")
		return
	}

	var in struct {
		OTP string `json:"otp"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
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
		respondError(w, http.StatusBadRequest, "invalid session id")
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
		respondError(w, http.StatusBadRequest, "invalid session id")
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
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	if in.FullName == "" {
		respondError(w, http.StatusBadRequest, "full name required")
		return
	}

	if in.Role == "" {
		respondError(w, http.StatusBadRequest, "role required")
		return
	}

	if len(in.Password) < 8 {
		respondError(w, http.StatusBadRequest, "password must be at least 8 characters")
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
		respondError(w, http.StatusInternalServerError, "registration succeeded but token generation failed")
		return
	}

	ttl := getRefreshTTLByRole(in.Role)
	refreshRaw, _, err := h.svc.GenerateRefreshToken(ctx, acc.ID, ttl)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "registration succeeded but token generation failed")
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
		respondError(w, http.StatusBadRequest, "username required")
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
		respondError(w, http.StatusBadRequest, "email required")
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

////////////////////////////////////////////////////////
//// RESEND OTP
////////////////////////////////////////////////////////

func (h *AuthHandler) resendOTP(w http.ResponseWriter, r *http.Request) {

	var in struct {
		Target  string `json:"target"`
		Purpose string `json:"purpose"`
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	if in.Target == "" {
		respondError(w, http.StatusBadRequest, "target required")
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
		if err.Error() == "user not found" {
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

////////////////////////////////////////////////////////
//// LOGIN
////////////////////////////////////////////////////////

func (h *AuthHandler) login(w http.ResponseWriter, r *http.Request) {

	var in struct {
		Identifier string `json:"identifier"`
		Password   string `json:"password"`
		Code       string `json:"totp_code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	identifier := strings.TrimSpace(in.Identifier)
	if identifier == "" {
		respondError(w, http.StatusBadRequest, "email or username required")
		return
	}

	// Restriction: Phone number cannot be used for login
	// Basic regex for digits-only or + starting string
	if isPhone(identifier) {
		respondError(w, http.StatusUnauthorized, "invalid email/username or password")
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
		respondError(w, http.StatusUnauthorized, "invalid email/username or password")
		return
	}

	ok, err := argon2id.ComparePasswordAndHash(in.Password, acc.PasswordHash)
	if err != nil || !ok {
		h.svc.RecordLoginFailure(ctx, identifier)
		respondError(w, http.StatusUnauthorized, "invalid password")
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
			respondError(w, http.StatusInternalServerError, "session generation failed")
			return
		}

		if requiresOtp {
			_, err := h.svc.StartLoginOTP(ctx, acc.Email)
			if err != nil {
				respondError(w, http.StatusInternalServerError, "failed to send otp")
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
		respondError(w, http.StatusInternalServerError, "token generation failed")
		return
	}

	ttl := getRefreshTTLByRole(role)
	refreshRaw, _, err := h.svc.GenerateRefreshToken(ctx, acc.ID, ttl)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "token generation failed")
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

func (h *AuthHandler) extractUserID(r *http.Request) (uuid.UUID, bool, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		fmt.Printf("TOKEN_DEBUG: [EMPTY] No Authorization header found\n")
		return uuid.Nil, false, fmt.Errorf("missing authorization header")
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		fmt.Printf("TOKEN_DEBUG: [MALFORMED] Header: %s\n", authHeader)
		return uuid.Nil, false, fmt.Errorf("invalid authorization header format")
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

////////////////////////////////////////////////////////
//// PASSWORD RESET HANDLERS
////////////////////////////////////////////////////////

func (h *AuthHandler) forgotPassword(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Target string `json:"target"` // email or phone
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	if in.Target == "" {
		respondError(w, http.StatusBadRequest, "email or phone required")
		return
	}

	targetEmail, err := h.svc.StartPasswordReset(r.Context(), in.Target)
	if err != nil {
		// Generic message to avoid enumeration
		respondJSON(w, http.StatusOK, map[string]string{
			"message": "If the account exists, an OTP has been sent.",
		})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message":      "OTP sent",
		"masked_email": maskEmail(targetEmail),
	})
}

func (h *AuthHandler) resetPassword(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Target   string `json:"target"`
		Code     string `json:"otp"`
		Password string `json:"new_password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	if in.Target == "" || in.Code == "" || in.Password == "" {
		respondError(w, http.StatusBadRequest, "missing fields")
		return
	}

	if len(in.Password) < 8 {
		respondError(w, http.StatusBadRequest, "password too short")
		return
	}

	err := h.svc.ResetPassword(r.Context(), in.Target, in.Code, in.Password)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message": "password reset successfully",
	})
}

////////////////////////////////////////////////////////
//// PHONE VERIFICATION HANDLERS
////////////////////////////////////////////////////////

func (h *AuthHandler) verifyPhoneStart(w http.ResponseWriter, r *http.Request) {
	var in struct {
		UserID string `json:"user_id"`
		Phone  string `json:"phone"`
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	uid, err := uuid.Parse(in.UserID)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid user id")
		return
	}

	// Security Patch: Prevent verifying unlinked phone numbers
	user, err := h.svc.GetUserByID(r.Context(), uid)
	if err != nil {
		respondError(w, http.StatusBadRequest, "user not found")
		return
	}

	if user.Phone == "" {
		respondError(w, http.StatusBadRequest, "no phone number linked to this account")
		return
	}

	if user.Phone != in.Phone {
		respondError(w, http.StatusBadRequest, "phone number does not match linked account")
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
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	uid, err := uuid.Parse(in.UserID)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid user id")
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

////////////////////////////////////////////////////////
//// REFRESH
////////////////////////////////////////////////////////

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
		respondError(w, http.StatusUnauthorized, "refresh token required")
		return
	}

	ctx := r.Context()

	token, err := h.svc.VerifyRefreshToken(ctx, in.RefreshToken)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "invalid or expired token")
		return
	}

	newRaw, _, ttl, err := h.svc.RotateRefreshToken(ctx, token)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "could not rotate token")
		return
	}

	access, err := h.svc.CreateAccessJWT(token.UserID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create access token")
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

////////////////////////////////////////////////////////
//// TOTP SETUP
////////////////////////////////////////////////////////

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
			respondError(w, http.StatusBadRequest, "invalid session id")
			return
		}
		session, err := h.svc.GetLoginSessionByID(r.Context(), sessionUUID)
		if err != nil || session.ExpiresAt.Before(time.Now()) {
			respondError(w, http.StatusUnauthorized, "invalid or expired session")
			return
		}
		uid = session.UserID
	} else {
		// Fallback to Bearer token for logged-in users
		var err error
		uid, _, err = h.extractUserID(r)
		if err != nil {
			respondError(w, http.StatusUnauthorized, "unauthorized")
			return
		}
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	user, err := h.svc.GetUserByID(ctx, uid)
	if err != nil {
		respondError(w, http.StatusNotFound, "user not found")
		return
	}

	secret, url, err := h.svc.GenerateTOTPSecret(user.Email)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "server error")
		return
	}

	// Store the secret but don't enable yet
	err = h.svc.SetUserTOTPSecret(ctx, uid, secret)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "could not setup TOTP")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"secret": secret,
		"url":    url,
	})
}

////////////////////////////////////////////////////////
//// TOTP VERIFY (Activate Setup)
////////////////////////////////////////////////////////

func (h *AuthHandler) totpVerify(w http.ResponseWriter, r *http.Request) {

	var in struct {
		SessionID string `json:"session_id"`
		Code      string `json:"code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	var uid uuid.UUID
	if in.SessionID != "" {
		sessionUUID, err := uuid.Parse(in.SessionID)
		if err != nil {
			respondError(w, http.StatusBadRequest, "invalid session id")
			return
		}
		session, err := h.svc.GetLoginSessionByID(r.Context(), sessionUUID)
		if err != nil || session.ExpiresAt.Before(time.Now()) {
			respondError(w, http.StatusUnauthorized, "invalid or expired session")
			return
		}
		uid = session.UserID
		// Delete session after successful verification happens below
		defer func() { _ = h.svc.DeleteLoginSession(r.Context(), sessionUUID) }()
	} else {
		var err error
		uid, _, err = h.extractUserID(r)
		if err != nil {
			respondError(w, http.StatusUnauthorized, "unauthorized")
			return
		}
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	acc, err := h.svc.GetAccountByID(ctx, uid)
	if err != nil {
		respondError(w, http.StatusNotFound, "account not found")
		return
	}

	if acc.TOTPSecret == nil || *acc.TOTPSecret == "" {
		respondError(w, http.StatusUnauthorized, "TOTP not setup")
		return
	}

	if !h.svc.ValidateTOTP(*acc.TOTPSecret, in.Code) {
		respondError(w, http.StatusUnauthorized, "invalid code")
		return
	}

	// Verify and Enable
	err = h.svc.UpdateUserMFAPreference(ctx, uid, "totp")
	if err != nil {
		respondError(w, http.StatusInternalServerError, "could not enable TOTP")
		return
	}

	// Issue full tokens now that TOTP is verified
	access, err := h.svc.CreateAccessJWT(acc.ID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "token generation failed")
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
		respondError(w, http.StatusInternalServerError, "token generation failed")
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

////////////////////////////////////////////////////////
//// LOGIN TOTP (Standard 2FA Verification)
////////////////////////////////////////////////////////

func (h *AuthHandler) loginTOTP(w http.ResponseWriter, r *http.Request) {

	var in struct {
		SessionID string `json:"session_id"`
		Code      string `json:"code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	if in.SessionID == "" {
		respondError(w, http.StatusUnauthorized, "session_id required")
		return
	}

	sessionUUID, err := uuid.Parse(in.SessionID)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid session id")
		return
	}

	session, err := h.svc.GetLoginSessionByID(r.Context(), sessionUUID)
	if err != nil || session.ExpiresAt.Before(time.Now()) {
		respondError(w, http.StatusUnauthorized, "invalid or expired session")
		return
	}

	if !session.RequiresTOTP {
		respondError(w, http.StatusBadRequest, "totp verification not required")
		return
	}

	// Delete session after successful verification happens below
	defer func() { _ = h.svc.DeleteLoginSession(r.Context(), sessionUUID) }()
	uid := session.UserID

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	acc, err := h.svc.GetAccountByID(ctx, uid)
	if err != nil {
		respondError(w, http.StatusNotFound, "account not found")
		return
	}

	if acc.MFAPreference != "totp" {
		respondError(w, http.StatusBadRequest, "totp not enabled for user")
		return
	}

	if acc.TOTPSecret == nil || !h.svc.ValidateTOTP(*acc.TOTPSecret, in.Code) {
		respondError(w, http.StatusUnauthorized, "invalid code")
		return
	}

	user, err := h.svc.GetUserByID(ctx, uid)
	if err != nil {
		respondError(w, http.StatusNotFound, "user not found")
		return
	}

	// Success, issue full tokens
	access, err := h.svc.CreateAccessJWT(acc.ID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "token generation failed")
		return
	}

	ttl := getRefreshTTLByRole(user.Role)
	refreshRaw, _, err := h.svc.GenerateRefreshToken(ctx, user.ID, ttl)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "token generation failed")
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

////////////////////////////////////////////////////////
//// LOGIN EMAIL OTP
////////////////////////////////////////////////////////

func (h *AuthHandler) loginOTP(w http.ResponseWriter, r *http.Request) {

	var in struct {
		SessionID string `json:"session_id"`
		Code      string `json:"code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	if in.SessionID == "" {
		respondError(w, http.StatusUnauthorized, "session_id required")
		return
	}

	sessionUUID, err := uuid.Parse(in.SessionID)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid session id")
		return
	}

	session, err := h.svc.GetLoginSessionByID(r.Context(), sessionUUID)
	if err != nil || session.ExpiresAt.Before(time.Now()) {
		respondError(w, http.StatusUnauthorized, "invalid or expired session")
		return
	}

	if !session.RequiresOTP {
		respondError(w, http.StatusBadRequest, "otp verification not required")
		return
	}

	// Delete session after successful verification happens below
	defer func() { _ = h.svc.DeleteLoginSession(r.Context(), sessionUUID) }()
	uid := session.UserID

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	acc, err := h.svc.GetAccountByID(ctx, uid)
	if err != nil {
		respondError(w, http.StatusNotFound, "account not found")
		return
	}

	if acc.MFAPreference != "email" {
		respondError(w, http.StatusBadRequest, "email otp not enabled for user")
		return
	}

	ok, err := h.svc.VerifyOTP(ctx, "login", acc.Email, in.Code)
	if err != nil || !ok {
		respondError(w, http.StatusUnauthorized, "invalid or expired otp")
		return
	}

	user, err := h.svc.GetUserByID(ctx, uid)
	if err != nil {
		respondError(w, http.StatusNotFound, "user not found")
		return
	}

	// Success, issue full tokens
	access, err := h.svc.CreateAccessJWT(acc.ID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "token generation failed")
		return
	}

	ttl := getRefreshTTLByRole(user.Role)
	refreshRaw, _, err := h.svc.GenerateRefreshToken(ctx, user.ID, ttl)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "token generation failed")
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

////////////////////////////////////////////////////////
//// SETTINGS MFA
////////////////////////////////////////////////////////

func (h *AuthHandler) settingsMFA(w http.ResponseWriter, r *http.Request) {

	var in struct {
		Preference string `json:"preference"`
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	pref := strings.ToLower(in.Preference)
	if pref != "none" && pref != "totp" && pref != "email" {
		respondError(w, http.StatusBadRequest, "invalid preference. must be none, totp, or email")
		return
	}

	uid, _, err := h.extractUserID(r)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	user, err := h.svc.GetUserByID(ctx, uid)
	if err != nil {
		respondError(w, http.StatusNotFound, "user not found")
		return
	}

	if user.Role == "admin" && pref == "none" {
		respondError(w, http.StatusForbidden, "admins must have mfa enabled")
		return
	}

	if pref == "totp" && user.TOTPSecret == "" {
		respondError(w, http.StatusBadRequest, "totp not setup. please complete setup first")
		return
	}

	err = h.svc.UpdateUserMFAPreference(ctx, user.ID, pref)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update preference")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message": "mfa preference updated",
	})
}

func (h *AuthHandler) logout(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		respondError(w, http.StatusBadRequest, "missing authorization header")
		return
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		respondError(w, http.StatusBadRequest, "invalid authorization header format")
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

////////////////////////////////////////////////////////
//// ADMIN TOKENS & SUPER ADMIN
////////////////////////////////////////////////////////

func (h *AuthHandler) validateAdminToken(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Token string `json:"token"`
		Role  string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	role := in.Role
	if role == "" {
		role = "admin"
	}

	valid := h.svc.ValidateAdminToken(r.Context(), in.Token, role)
	if !valid {
		respondError(w, http.StatusUnauthorized, "invalid token")
		return
	}

	respondJSON(w, http.StatusOK, map[string]bool{"valid": true})
}



func (h *AuthHandler) getSuperAdminToken(w http.ResponseWriter, r *http.Request) {
	// In production this should require auth middleware; left open for now.
	adminToken, err := h.svc.GetActiveAdminToken(r.Context(), "admin")
	if err != nil {
		respondError(w, http.StatusInternalServerError, "no active admin token found")
		return
	}
	superAdminToken, err := h.svc.GetActiveAdminToken(r.Context(), "super_admin")
	if err != nil {
		respondError(w, http.StatusInternalServerError, "no active super admin token found")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{
		"token": adminToken,
		"super_admin_token": superAdminToken,
	})
}

func (h *AuthHandler) sendSuperAdminEmail(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	err := h.svc.SendAdminTokenEmail(r.Context(), in.Email)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to send email")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "email sent successfully"})
}
