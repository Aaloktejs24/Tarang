package authhandler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func (h *AuthHandler) registerAdminWebAuthnRoutes(r chi.Router) {
	r.Post("/admin-webauthn/register/begin", h.adminWebAuthnRegisterBegin)
	r.Post("/admin-webauthn/register/finish", h.adminWebAuthnRegisterFinish)
	r.Post("/admin-webauthn/login/begin", h.adminWebAuthnLoginBegin)
	r.Post("/admin-webauthn/login/finish", h.adminWebAuthnLoginFinish)
}

func (h *AuthHandler) adminWebAuthnRegisterBegin(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Role       string `json:"role"`
		Identifier string `json:"identifier"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	options, sessionID, err := h.svc.BeginAdminWebAuthnRegistration(r.Context(), in.Role, in.Identifier)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"options":    options,
		"session_id": sessionID,
	})
}

func (h *AuthHandler) adminWebAuthnRegisterFinish(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("session_id")
	role := r.URL.Query().Get("role")
	identifier := r.URL.Query().Get("identifier")

	if err := h.svc.FinishAdminWebAuthnRegistration(r.Context(), role, identifier, sessionID, r); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "registration successful"})
}

func (h *AuthHandler) adminWebAuthnLoginBegin(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Role       string `json:"role"`
		Identifier string `json:"identifier"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	options, sessionID, err := h.svc.BeginAdminWebAuthnLogin(r.Context(), in.Role, in.Identifier)
	if err != nil {
		respondError(w, http.StatusUnauthorized, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"options":    options,
		"session_id": sessionID,
	})
}

func (h *AuthHandler) adminWebAuthnLoginFinish(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("session_id")
	role := r.URL.Query().Get("role")
	identifier := r.URL.Query().Get("identifier")

	token, err := h.svc.FinishAdminWebAuthnLogin(r.Context(), role, identifier, sessionID, r)
	if err != nil {
		respondError(w, http.StatusUnauthorized, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"access_token": token,
		"message":      "login successful",
	})
}
