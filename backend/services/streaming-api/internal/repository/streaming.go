package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type StreamingJob struct {
	ID               uuid.UUID `json:"id"`
	UserID           uuid.UUID `json:"user_id"`
	OriginalFilename string    `json:"original_filename"`
	RawMinioKey      string    `json:"raw_minio_key"`
	Status           string    `json:"status"`
	DashManifestUrl  *string   `json:"dash_manifest_url"`
	HlsManifestUrl   *string   `json:"hls_manifest_url"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type StreamingRepository struct {
	db *pgxpool.Pool
}

func NewStreamingRepository(db *pgxpool.Pool) *StreamingRepository {
	return &StreamingRepository{db: db}
}

func (r *StreamingRepository) CreateJob(ctx context.Context, job *StreamingJob) error {
	job.ID = uuid.New()
	job.Status = "PENDING"
	job.CreatedAt = time.Now()
	job.UpdatedAt = time.Now()

	query := `
		INSERT INTO streaming_jobs (id, user_id, original_filename, raw_minio_key, status, dash_manifest_url, hls_manifest_url, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err := r.db.Exec(ctx, query, job.ID, job.UserID, job.OriginalFilename, job.RawMinioKey, job.Status, job.DashManifestUrl, job.HlsManifestUrl, job.CreatedAt, job.UpdatedAt)
	return err
}

func (r *StreamingRepository) UpdateJobStatus(ctx context.Context, id uuid.UUID, status string, dashUrl *string, hlsUrl *string) error {
	query := `
		UPDATE streaming_jobs
		SET status = $1, dash_manifest_url = $2, hls_manifest_url = $3, updated_at = NOW()
		WHERE id = $4
	`
	_, err := r.db.Exec(ctx, query, status, dashUrl, hlsUrl, id)
	return err
}

func (r *StreamingRepository) GetJobByID(ctx context.Context, id uuid.UUID) (*StreamingJob, error) {
	query := `
		SELECT id, user_id, original_filename, raw_minio_key, status, dash_manifest_url, hls_manifest_url, created_at, updated_at
		FROM streaming_jobs
		WHERE id = $1
	`
	var job StreamingJob
	err := r.db.QueryRow(ctx, query, id).Scan(
		&job.ID, &job.UserID, &job.OriginalFilename, &job.RawMinioKey,
		&job.Status, &job.DashManifestUrl, &job.HlsManifestUrl, &job.CreatedAt, &job.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &job, nil
}
