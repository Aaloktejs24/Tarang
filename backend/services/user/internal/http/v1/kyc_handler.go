package v1

import (
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"

	"backend/services/user/internal/user"
	"backend/shared/kyc"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type KycHandler struct {
	svc     *user.Service
	sandbox *kyc.SandboxProvider
}

func NewKycHandler(s *user.Service, sandbox *kyc.SandboxProvider) *KycHandler {
	return &KycHandler{
		svc:     s,
		sandbox: sandbox,
	}
}

func (h *KycHandler) RegisterRoutes(r chi.Router) {
	r.Post("/aadhaar/otp/start", h.aadhaarOtpStart)
	r.Post("/aadhaar/otp/verify", h.aadhaarOtpVerify)
	r.Get("/digilocker/start", h.digilockerStart)
	r.Get("/digilocker/callback", h.digilockerCallback)
}

func (h *KycHandler) aadhaarOtpStart(w http.ResponseWriter, r *http.Request) {
	var in struct {
		UserID  string `json:"user_id"`
		Aadhaar string `json:"aadhaar"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	token, err := h.sandbox.GetToken()
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to auth with kyc provider")
		return
	}

	refID, err := h.sandbox.RequestAadhaarOTP(token, in.Aadhaar)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message":      "aadhaar otp sent",
		"reference_id": refID,
	})
}

func (h *KycHandler) aadhaarOtpVerify(w http.ResponseWriter, r *http.Request) {
	var in struct {
		UserID      string `json:"user_id"`
		Aadhaar     string `json:"aadhaar"`
		ReferenceID string `json:"reference_id"`
		OTP         string `json:"otp"`
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

	token, err := h.sandbox.GetToken()
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to auth with kyc provider")
		return
	}

	res, err := h.sandbox.VerifyAadhaarOTP(token, in.ReferenceID, in.OTP)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	hash := h.sandbox.HashAadhaar(in.Aadhaar)
	err = h.svc.MarkKYCVerified(r.Context(), uid, in.ReferenceID, hash, res.Name, res.DOB, res.Gender)
	if err != nil {
		fmt.Printf("Error marking KYC verified: %v\n", err)
		http.Error(w, `{"error":"failed to update kyc status"}`, http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"message": "kyc verified successfully",
		"name":    res.Name,
	})
}

func (h *KycHandler) digilockerStart(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		respondError(w, http.StatusBadRequest, "user_id query param is required")
		return
	}

	token, err := h.sandbox.GetToken()
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to init kyc provider")
		return
	}

	originalURL := h.sandbox.RedirectURL
	h.sandbox.RedirectURL = originalURL + "?user_id=" + userID

	sessionID, authURL, err := h.sandbox.InitDigilockerSession(token)

	h.sandbox.RedirectURL = originalURL

	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	re := regexp.MustCompile(`&consent_valid_till=\d+`)
	authURL = re.ReplaceAllString(authURL, "")

	respondJSON(w, http.StatusOK, map[string]string{
		"authorization_url": authURL,
		"session_id":        sessionID,
	})
}

func (h *KycHandler) digilockerCallback(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("Received callback with query params: %v\n", r.URL.Query())

	sessionID := r.URL.Query().Get("session_id")
	userID := r.URL.Query().Get("user_id")

	if sessionID == "" || userID == "" {
		http.Error(w, "missing session_id or user_id", http.StatusBadRequest)
		return
	}

	uid, err := uuid.Parse(userID)
	if err != nil {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}

	token, err := h.sandbox.GetToken()
	if err != nil {
		http.Error(w, "failed to auth with kyc provider", http.StatusInternalServerError)
		return
	}

	res, err := h.sandbox.GetDigilockerAadhaarData(token, sessionID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	pseudoHash := h.sandbox.HashAadhaar(res.Name + res.DOB)

	err = h.svc.MarkKYCVerified(
		r.Context(),
		uid,
		sessionID,
		pseudoHash,
		res.Name,
		res.DOB,
		res.Gender,
	)
	if err != nil {
		fmt.Printf("DEBUG: MarkKYCVerified failed for user %s: %v\n", userID, err)
		http.Error(w, "failed to update kyc status", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/html")
	// #nosec G705
	_, _ = w.Write([]byte(`
		<div style="font-family: Arial, sans-serif; border: 2px solid #007bff; padding: 25px; width: 350px; border-radius: 12px; text-align: center; margin: 80px auto; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
			<div style="font-size: 48px; color: #28a745; margin-bottom: 10px;">✓</div>
			<h2 style="color: #007bff; margin-bottom: 5px; font-weight: 600;">Verification Successful</h2>
			<p style="font-size: 13px; color: #666; margin-bottom: 20px;">Your identity has been verified via DigiLocker.</p>
			
			<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: left; margin-bottom: 25px; border: 1px solid #eee;">
				<p style="margin: 5px 0; font-size: 14px;"><strong>Name:</strong> ` + res.Name + `</p>
				<p style="margin: 5px 0; font-size: 14px;"><strong>DOB:</strong> ` + res.DOB + `</p>
			</div>
			
			<button id="closeBtn" style="width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 15px; transition: background 0.2s;">Return to Dashboard</button>
			
			<script>
				// Notify the main window that verification is complete
				if (window.opener) {
					window.opener.postMessage({ type: 'KYC_VERIFIED', status: 'success' }, '*');
				}
				
				document.getElementById('closeBtn').addEventListener('click', () => {
					window.close();
					// Fallback if window.close() is blocked
					setTimeout(() => {
						window.location.href = '/dashboard/home/profile';
					}, 500);
				});

				// Auto-close after 3 seconds
				// setTimeout(() => window.close(), 3000);
			</script>
		</div>`))
}
