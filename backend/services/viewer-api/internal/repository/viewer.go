package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DocumentJob struct {
	ID                 uuid.UUID `json:"id"`
	UserID             uuid.UUID `json:"user_id"`
	OriginalFilename   string    `json:"original_filename"`
	Extension          string    `json:"extension"`
	RequiresConversion bool      `json:"requires_conversion"`
	RawMinioKey        string    `json:"raw_minio_key"`
	ProcessedMinioKey  *string   `json:"processed_minio_key"`
	Status             string    `json:"status"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type ViewerRepository struct {
	db *pgxpool.Pool
}

func NewViewerRepository(db *pgxpool.Pool) *ViewerRepository {
	return &ViewerRepository{db: db}
}

func (r *ViewerRepository) CreateJob(ctx context.Context, job *DocumentJob) error {
	job.ID = uuid.New()
	if job.Status == "" {
		job.Status = "PENDING"
	}
	job.CreatedAt = time.Now()
	job.UpdatedAt = time.Now()

	query := `
		INSERT INTO document_jobs (id, user_id, original_filename, extension, requires_conversion, raw_minio_key, processed_minio_key, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.db.Exec(ctx, query, job.ID, job.UserID, job.OriginalFilename, job.Extension, job.RequiresConversion, job.RawMinioKey, job.ProcessedMinioKey, job.Status, job.CreatedAt, job.UpdatedAt)
	return err
}

func (r *ViewerRepository) UpdateJobStatus(ctx context.Context, id uuid.UUID, status string, processedKey *string) error {
	query := `
		UPDATE document_jobs
		SET status = $1, processed_minio_key = $2, updated_at = NOW()
		WHERE id = $3
	`
	_, err := r.db.Exec(ctx, query, status, processedKey, id)
	return err
}

func (r *ViewerRepository) GetJobByID(ctx context.Context, id uuid.UUID) (*DocumentJob, error) {
	query := `
		SELECT id, user_id, original_filename, extension, requires_conversion, raw_minio_key, processed_minio_key, status, created_at, updated_at
		FROM document_jobs
		WHERE id = $1
	`
	var job DocumentJob
	err := r.db.QueryRow(ctx, query, id).Scan(
		&job.ID, &job.UserID, &job.OriginalFilename, &job.Extension, &job.RequiresConversion,
		&job.RawMinioKey, &job.ProcessedMinioKey, &job.Status, &job.CreatedAt, &job.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &job, nil
}
