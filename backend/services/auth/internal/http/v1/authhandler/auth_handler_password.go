package authhandler

import (
	"encoding/json"
	"net/http"

	"backend/shared/errors"

)

func (h *AuthHandler) forgotPassword(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Target string `json:"target"` // email or phone
	}

	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidPayload)
		return
	}

	if in.Target == "" {
		respondError(w, http.StatusBadRequest, errors.ErrEmailOrPhoneRequired)
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
		respondError(w, http.StatusBadRequest, errors.ErrInvalidPayload)
		return
	}

	if in.Target == "" || in.Code == "" || in.Password == "" {
		respondError(w, http.StatusBadRequest, errors.ErrMissingFields)
		return
	}

	if len(in.Password) < 8 {
		respondError(w, http.StatusBadRequest, errors.ErrPasswordTooShort)
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
