package v1

import (
	"encoding/json"
	"net/http"
	"backend/proto/admissionpb"
	"backend/services/admission/internal/admission"
	"backend/services/admission/internal/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/redis/go-redis/v9"
)

type AdmissionHandler struct {
	service     admission.Service
	redisClient *redis.Client
}

func NewAdmissionHandler(service admission.Service, redisClient *redis.Client) *AdmissionHandler {
	return &AdmissionHandler{service: service, redisClient: redisClient}
}

func RegisterRoutes(r chi.Router, h *AdmissionHandler) {
	r.Route("/admissions", func(r chi.Router) {
		// Public routes
		r.Get("/institutes/{instituteID}/programs", h.GetProgramsByInstitute)
		r.Get("/programs/{id}", h.GetProgramByID)

		// Protected routes (Only Institutes should be able to create)
		r.Group(func(r chi.Router) {
			if h.redisClient != nil {
				r.Use(middleware.Idempotency(h.redisClient))
			}
			r.Post("/programs", h.CreateProgram)
			r.Put("/programs/{id}", h.UpdateProgram)
			r.Delete("/programs/{id}", h.DeleteProgram)

			// Drafts
			r.Post("/drafts", h.SaveDraft)
			r.Get("/drafts", h.GetDrafts)
			r.Delete("/drafts", h.DeleteDraft)
		})

		// Application tracking
		r.Post("/programs/{id}/apply", h.ApplyForProgram)
		r.Put("/applications/{id}/progress", h.UpdateApplicationProgress)
		r.Get("/applications/{id}", h.GetApplicationHistory) // History + App state
		r.Get("/users/{id}/applications", h.GetUserApplications)
		r.Get("/institutes/{username}/applications", h.GetInstituteApplications)
		r.Delete("/applications/{id}", h.DeleteApplication)
	})
}

func (h *AdmissionHandler) CreateProgram(w http.ResponseWriter, r *http.Request) {
	var req admissionpb.CreateProgramRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// In a real app, you'd extract the instituteID from the authenticated user token (r.Context().Value("user_id"))
	// For simplicity, we assume the frontend sends the correct institute_id in the payload, or we extract it here.

	res, err := h.service.CreateProgram(r.Context(), &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(res)
}

func (h *AdmissionHandler) UpdateProgram(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	
	var req admissionpb.UpdateProgramRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	req.Id = id

	res, err := h.service.UpdateProgram(r.Context(), &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(res)
}

func (h *AdmissionHandler) GetProgramsByInstitute(w http.ResponseWriter, r *http.Request) {
	instituteID := chi.URLParam(r, "instituteID")

	req := &admissionpb.InstituteIDRequest{InstituteId: instituteID}
	res, err := h.service.GetProgramsByInstitute(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(res)
}

func (h *AdmissionHandler) GetProgramByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	req := &admissionpb.ProgramIDRequest{Id: id}
	res, err := h.service.GetProgramByID(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(res)
}

func (h *AdmissionHandler) DeleteProgram(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	req := &admissionpb.DeleteProgramRequest{Id: id}
	_, err := h.service.DeleteProgram(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Draft Handlers
func (h *AdmissionHandler) SaveDraft(w http.ResponseWriter, r *http.Request) {
	var req admissionpb.SaveDraftRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Ensure institute_id is set (usually from auth token, but we trust frontend payload for now or expect it in request)
	// We'll enforce that the frontend sends institute_id.

	res, err := h.service.SaveDraft(r.Context(), &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(res)
}

func (h *AdmissionHandler) GetDrafts(w http.ResponseWriter, r *http.Request) {
	// Usually from auth token. Let's assume it's passed as a query param for simplicity in this PoC
	// since Get requests don't have body.
	instituteID := r.URL.Query().Get("institute_id")
	if instituteID == "" {
		http.Error(w, "institute_id is required", http.StatusBadRequest)
		return
	}

	req := &admissionpb.GetDraftsRequest{InstituteId: instituteID}
	res, err := h.service.GetDrafts(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(res)
}

func (h *AdmissionHandler) DeleteDraft(w http.ResponseWriter, r *http.Request) {
	instituteID := r.URL.Query().Get("institute_id")
	draftID := r.URL.Query().Get("draft_id")
	if instituteID == "" || draftID == "" {
		http.Error(w, "institute_id and draft_id are required", http.StatusBadRequest)
		return
	}

	req := &admissionpb.DeleteDraftRequest{InstituteId: instituteID, DraftId: draftID}
	_, err := h.service.DeleteDraft(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Applications & Progress Handlers
func (h *AdmissionHandler) ApplyForProgram(w http.ResponseWriter, r *http.Request) {
	programID := chi.URLParam(r, "id")
	
	var req admissionpb.ApplyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	req.ProgramId = programID

	res, err := h.service.ApplyForProgram(r.Context(), &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(res)
}

func (h *AdmissionHandler) UpdateApplicationProgress(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "id")
	
	var req admissionpb.UpdateProgressRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	req.ApplicationId = appID

	res, err := h.service.UpdateApplicationProgress(r.Context(), &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(res)
}

func (h *AdmissionHandler) GetApplicationHistory(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "id")
	req := &admissionpb.HistoryRequest{ApplicationId: appID}
	
	res, err := h.service.GetApplicationHistory(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(res)
}

func (h *AdmissionHandler) GetUserApplications(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "id")
	req := &admissionpb.UserApplicationsRequest{UserId: userID}
	
	res, err := h.service.GetUserApplications(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(res)
}

func (h *AdmissionHandler) GetInstituteApplications(w http.ResponseWriter, r *http.Request) {
	instituteID := chi.URLParam(r, "username")
	req := &admissionpb.InstituteApplicationsRequest{InstituteId: instituteID}
	
	res, err := h.service.GetInstituteApplications(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(res)
}

func (h *AdmissionHandler) DeleteApplication(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "id")
	
	err := h.service.DeleteApplication(r.Context(), appID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
