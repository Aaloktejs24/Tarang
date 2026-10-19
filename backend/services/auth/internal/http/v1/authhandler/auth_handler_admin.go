package authhandler

import (
	"encoding/json"
	"net/http"

	"backend/shared/errors"

)

func (h *AuthHandler) validateAdminToken(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Token string `json:"token"`
		Role  string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidPayload)
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
		respondError(w, http.StatusInternalServerError, errors.ErrNoActiveAdminToken)
		return
	}
	superAdminToken, err := h.svc.GetActiveAdminToken(r.Context(), "super_admin")
	if err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrNoActiveSuperAdminToken)
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{
		"token":             adminToken,
		"super_admin_token": superAdminToken,
	})
}
func (h *AuthHandler) sendSuperAdminEmail(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidPayload)
		return
	}

	err := h.svc.SendAdminTokenEmail(r.Context(), in.Email)
	if err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrFailedToSendEmail)
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "email sent successfully"})
}
