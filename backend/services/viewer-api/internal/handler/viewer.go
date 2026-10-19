package handler

import (
	"encoding/json"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	amqp "github.com/rabbitmq/amqp091-go"
	"backend/pkg/storage"
	"backend/services/viewer-api/internal/repository"
)

type ViewerHandler struct {
	repo   *repository.ViewerRepository
	minio  *storage.MinioClient
	rabbit *amqp.Connection
}

func NewViewerHandler(repo *repository.ViewerRepository, minio *storage.MinioClient, rabbit *amqp.Connection) *ViewerHandler {
	return &ViewerHandler{
		repo:   repo,
		minio:  minio,
		rabbit: rabbit,
	}
}

type UploadIntentRequest struct {
	Filename string `json:"filename"`
}

type UploadIntentResponse struct {
	JobID        uuid.UUID `json:"job_id"`
	PresignedURL string    `json:"presigned_url"`
}

func requiresConversion(ext string) bool {
	// Matrix from extension.pdf
	conversionMap := map[string]bool{
		".docx": true, ".xlsx": true, ".pptx": true,
		".odt": true, ".ods": true, ".odp": true,
	}
	return conversionMap[ext]
}

func getRenderer(ext string) string {
	ext = strings.ToLower(ext)
	switch ext {
	// PDF.js
	case ".pdf", ".docx", ".xlsx", ".pptx", ".odt", ".ods", ".odp":
		return "PDF.js"
	// Monaco
	case ".py", ".js", ".jsx", ".ts", ".tsx", ".cpp", ".hpp", ".c", ".h", ".java":
		return "Monaco"
	// Markdown
	case ".md":
		return "Markdown"
	// LaTeX
	case ".tex":
		return "LaTeX"
	// Notebooks
	case ".ipynb":
		return "Jupyter"
	// Images
	case ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg":
		return "Image"
	// Archives
	case ".zip", ".rar", ".7z", ".tar", ".gz":
		return "Archive"
	default:
		return "Unknown"
	}
}

func (h *ViewerHandler) HandleUploadIntent(w http.ResponseWriter, r *http.Request) {
	var req UploadIntentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	userIDStr := r.Header.Get("X-User-Id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		userID = uuid.Nil // For testing without KrakenD
	}

	jobID := uuid.New()
	ext := filepath.Ext(req.Filename)
	objectKey := jobID.String() + ext

	url, err := h.minio.GeneratePresignedUploadURL(r.Context(), "tarang-docs-raw", objectKey, 15*time.Minute)
	if err != nil {
		http.Error(w, "Failed to generate presigned URL", http.StatusInternalServerError)
		return
	}

	job := &repository.DocumentJob{
		ID:                 jobID,
		UserID:             userID,
		OriginalFilename:   req.Filename,
		Extension:          ext,
		RequiresConversion: requiresConversion(ext),
		RawMinioKey:        objectKey,
	}

	if err := h.repo.CreateJob(r.Context(), job); err != nil {
		http.Error(w, "Failed to save job to DB", http.StatusInternalServerError)
		return
	}

	resp := UploadIntentResponse{
		JobID:        job.ID,
		PresignedURL: url,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *ViewerHandler) HandleProcess(w http.ResponseWriter, r *http.Request) {
	jobIDStr := chi.URLParam(r, "job_id")
	jobID, err := uuid.Parse(jobIDStr)
	if err != nil {
		http.Error(w, "Invalid job ID", http.StatusBadRequest)
		return
	}

	job, err := h.repo.GetJobByID(r.Context(), jobID)
	if err != nil {
		http.Error(w, "Job not found", http.StatusNotFound)
		return
	}

	if job.Status != "PENDING" {
		http.Error(w, "Job is not in PENDING state", http.StatusBadRequest)
		return
	}

	if !job.RequiresConversion {
		// Native file, complete it immediately
		if err := h.repo.UpdateJobStatus(r.Context(), jobID, "COMPLETED", &job.RawMinioKey); err != nil {
			http.Error(w, "Failed to update job status", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"COMPLETED"}`))
		return
	}

	// Update status
	if err := h.repo.UpdateJobStatus(r.Context(), jobID, "PROCESSING", nil); err != nil {
		http.Error(w, "Failed to update job status", http.StatusInternalServerError)
		return
	}

	// Publish to RabbitMQ
	ch, err := h.rabbit.Channel()
	if err != nil {
		http.Error(w, "Failed to open RabbitMQ channel", http.StatusInternalServerError)
		return
	}
	defer ch.Close()

	body, _ := json.Marshal(map[string]interface{}{
		"job_id":        job.ID,
		"raw_minio_key": job.RawMinioKey,
	})

	err = ch.PublishWithContext(r.Context(),
		"",                       // exchange
		"document.convert.queue", // routing key
		false,                    // mandatory
		false,                    // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})

	if err != nil {
		http.Error(w, "Failed to publish message", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusAccepted)
	w.Write([]byte(`{"status":"PROCESSING"}`))
}

func (h *ViewerHandler) HandleGetMetadata(w http.ResponseWriter, r *http.Request) {
	jobIDStr := chi.URLParam(r, "job_id")
	jobID, err := uuid.Parse(jobIDStr)
	if err != nil {
		http.Error(w, "Invalid job ID", http.StatusBadRequest)
		return
	}

	job, err := h.repo.GetJobByID(r.Context(), jobID)
	if err != nil {
		http.Error(w, "Job not found", http.StatusNotFound)
		return
	}

	resp := map[string]interface{}{
		"job_id":   job.ID,
		"status":   job.Status,
		"renderer": getRenderer(job.Extension),
		"filename": job.OriginalFilename,
	}

	if job.Status == "COMPLETED" {
		if job.RequiresConversion {
			resp["original_download_url"] = "/api/v1/viewer/download/" + job.ID.String() + "?type=raw"
			resp["pdf_download_url"] = "/api/v1/viewer/download/" + job.ID.String() + "?type=processed"
		} else {
			resp["original_download_url"] = "/api/v1/viewer/download/" + job.ID.String() + "?type=raw"
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *ViewerHandler) HandleDownload(w http.ResponseWriter, r *http.Request) {
	jobIDStr := chi.URLParam(r, "job_id")
	jobID, err := uuid.Parse(jobIDStr)
	if err != nil {
		http.Error(w, "Invalid job ID", http.StatusBadRequest)
		return
	}

	job, err := h.repo.GetJobByID(r.Context(), jobID)
	if err != nil {
		http.Error(w, "Job not found", http.StatusNotFound)
		return
	}

	downloadType := r.URL.Query().Get("type")
	
	var bucket string
	var objectKey string

	if downloadType == "processed" {
		if !job.RequiresConversion || job.ProcessedMinioKey == nil {
			http.Error(w, "Processed file not available", http.StatusNotFound)
			return
		}
		bucket = "tarang-docs-processed"
		objectKey = *job.ProcessedMinioKey
	} else {
		// Default to raw
		bucket = "tarang-docs-raw"
		objectKey = job.RawMinioKey
	}

	url, err := h.minio.GeneratePresignedDownloadURL(r.Context(), bucket, objectKey, 15*time.Minute)
	if err != nil {
		http.Error(w, "Failed to generate download URL", http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}
