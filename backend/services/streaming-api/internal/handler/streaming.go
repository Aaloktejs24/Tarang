package handler

import (
	"crypto/md5"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	amqp "github.com/rabbitmq/amqp091-go"
	"backend/services/streaming-api/internal/repository"
	"backend/pkg/storage"
)

type StreamingHandler struct {
	repo   *repository.StreamingRepository
	minio  *storage.MinioClient
	rabbit *amqp.Connection
}

func NewStreamingHandler(repo *repository.StreamingRepository, minio *storage.MinioClient, rabbit *amqp.Connection) *StreamingHandler {
	return &StreamingHandler{
		repo:   repo,
		minio:  minio,
		rabbit: rabbit,
	}
}

type UploadIntentRequest struct {
	OriginalFilename string `json:"original_filename"`
	FileSize         int64  `json:"file_size"`
}

type UploadIntentResponse struct {
	JobID      string   `json:"job_id"`
	UploadID   string   `json:"upload_id"`
	UploadURLs []string `json:"upload_urls"`
	ChunkSize  int64    `json:"chunk_size"`
}

func (h *StreamingHandler) HandleUploadIntent(w http.ResponseWriter, r *http.Request) {
	var req UploadIntentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	jobID := uuid.New()
	minioKey := fmt.Sprintf("%s/%s", jobID.String(), req.OriginalFilename)

	uploadID, err := h.minio.CreateMultipartUpload(r.Context(), "tarang-media-raw", minioKey)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to create multipart upload: %v", err), http.StatusInternalServerError)
		return
	}

	// Calculate parts (5MB chunk size)
	chunkSize := int64(5 * 1024 * 1024)
	numParts := int32((req.FileSize + chunkSize - 1) / chunkSize)
	if numParts == 0 {
		numParts = 1 // At least one part for empty/small files
	}

	// Generate URLs
	urls, err := h.minio.GeneratePresignedPartURLs(r.Context(), "tarang-media-raw", minioKey, uploadID, numParts, 24*time.Hour)
	if err != nil {
		http.Error(w, "Failed to generate presigned part URLs", http.StatusInternalServerError)
		return
	}

	// Create DB Record
	job := &repository.StreamingJob{
		ID:               jobID,
		UserID:           uuid.New(), // TODO: Get from auth token
		OriginalFilename: req.OriginalFilename,
		RawMinioKey:      minioKey,
	}

	if err := h.repo.CreateJob(r.Context(), job); err != nil {
		http.Error(w, fmt.Sprintf("Failed to create job in database: %v", err), http.StatusInternalServerError)
		return
	}

	resp := UploadIntentResponse{
		JobID:      job.ID.String(),
		UploadID:   uploadID,
		UploadURLs: urls,
		ChunkSize:  chunkSize,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}


func (h *StreamingHandler) HandleGetJob(w http.ResponseWriter, r *http.Request) {
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(job)
}

type ClearKeyLicenseRequest struct {
	Kids []string `json:"kids"`
	Type string   `json:"type"`
}

type ClearKeyLicenseResponse struct {
	Keys []ClearKey `json:"keys"`
	Type string     `json:"type"`
}

type ClearKey struct {
	Kty string `json:"kty"`
	K   string `json:"k"`
	Kid string `json:"kid"`
}

func (h *StreamingHandler) HandleLicense(w http.ResponseWriter, r *http.Request) {
	jobIDStr := chi.URLParam(r, "job_id")
	jobID, err := uuid.Parse(jobIDStr)
	if err != nil {
		http.Error(w, "Invalid job ID", http.StatusBadRequest)
		return
	}

	// In a real app, verify user owns the job or has rights to view it here

	var req ClearKeyLicenseRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	// Recalculate the deterministic key
	// Same logic as ffmpeg.go
	kidHex := strings.ReplaceAll(jobID.String(), "-", "")
	
	keyHex := fmt.Sprintf("%x", md5.Sum([]byte(jobID.String() + "TARANG_SECRET")))[0:32]

	// Convert hex to bytes, then base64url encode without padding
	kidBytes, _ := hex.DecodeString(kidHex)
	keyBytes, _ := hex.DecodeString(keyHex)

	kidB64 := base64.RawURLEncoding.EncodeToString(kidBytes)
	keyB64 := base64.RawURLEncoding.EncodeToString(keyBytes)

	resp := ClearKeyLicenseResponse{
		Type: "temporary",
		Keys: []ClearKey{
			{
				Kty: "oct",
				K:   keyB64,
				Kid: kidB64,
			},
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

type UploadCompleteRequest struct {
	UploadID string                   `json:"upload_id"`
	Parts    []map[string]interface{} `json:"parts"` // Contains PartNumber and ETag
}

func (h *StreamingHandler) HandleUploadComplete(w http.ResponseWriter, r *http.Request) {
	jobIDStr := chi.URLParam(r, "job_id")
	jobID, err := uuid.Parse(jobIDStr)
	if err != nil {
		http.Error(w, "Invalid job ID", http.StatusBadRequest)
		return
	}

	var req UploadCompleteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	job, err := h.repo.GetJobByID(r.Context(), jobID)
	if err != nil {
		http.Error(w, "Job not found", http.StatusNotFound)
		return
	}

	// Tell MinIO to stitch the chunks together
	if err := h.minio.CompleteMultipartUpload(r.Context(), "tarang-media-raw", job.RawMinioKey, req.UploadID, req.Parts); err != nil {
		http.Error(w, "Failed to complete multipart upload", http.StatusInternalServerError)
		return
	}

	// Trigger RabbitMQ processing
	payload := map[string]interface{}{
		"job_id": jobID,
		"raw_minio_key": job.RawMinioKey,
	}
	body, _ := json.Marshal(payload)

	// Open a channel to publish
	ch, err := h.rabbit.Channel()
	if err != nil {
		http.Error(w, "Failed to open RabbitMQ channel", http.StatusInternalServerError)
		return
	}
	defer ch.Close()

	err = ch.PublishWithContext(r.Context(),
		"",               // exchange
		"video.transcode.queue", // routing key matches worker
		false,            // mandatory
		false,            // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})

	if err != nil {
		http.Error(w, "Failed to publish transcode job", http.StatusInternalServerError)
		return
	}

	// Update Status
	h.repo.UpdateJobStatus(r.Context(), jobID, "PROCESSING", nil, nil)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "processing_started"}`))
}
