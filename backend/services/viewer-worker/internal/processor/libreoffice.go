package processor

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	amqp "github.com/rabbitmq/amqp091-go"
	"backend/pkg/storage"
)

type ConvertMessage struct {
	JobID       uuid.UUID `json:"job_id"`
	RawMinioKey string    `json:"raw_minio_key"`
}

type ConvertWorker struct {
	db    *pgxpool.Pool
	minio *storage.MinioClient
}

func NewConvertWorker(db *pgxpool.Pool, minio *storage.MinioClient) *ConvertWorker {
	return &ConvertWorker{
		db:    db,
		minio: minio,
	}
}

func (w *ConvertWorker) ProcessMessage(ctx context.Context, msg amqp.Delivery) error {
	var payload ConvertMessage
	if err := json.Unmarshal(msg.Body, &payload); err != nil {
		log.Printf("Failed to unmarshal message: %v", err)
		return err
	}

	log.Printf("Processing document conversion job: %s, file: %s", payload.JobID, payload.RawMinioKey)

	// 1. Download from Minio
	localInputPath := filepath.Join("/tmp", payload.RawMinioKey)
	if err := w.downloadFile(ctx, "tarang-docs-raw", payload.RawMinioKey, localInputPath); err != nil {
		w.updateStatus(ctx, payload.JobID, "FAILED", nil)
		return fmt.Errorf("failed to download file: %v", err)
	}
	defer os.Remove(localInputPath)

	// 2. Run LibreOffice
	outputDir := "/tmp"
	cmd := exec.CommandContext(ctx, "libreoffice",
		"--headless",
		"--convert-to", "pdf",
		"--outdir", outputDir,
		localInputPath,
	)
	
	log.Printf("Running LibreOffice for job %s...", payload.JobID)
	if out, err := cmd.CombinedOutput(); err != nil {
		w.updateStatus(ctx, payload.JobID, "FAILED", nil)
		log.Printf("LibreOffice failed: %v\nOutput: %s", err, string(out))
		return fmt.Errorf("libreoffice failed: %v", err)
	}

	// Calculate expected output filename
	base := strings.TrimSuffix(payload.RawMinioKey, filepath.Ext(payload.RawMinioKey))
	outputFilename := base + ".pdf"
	localOutputPath := filepath.Join(outputDir, outputFilename)
	defer os.Remove(localOutputPath)

	// 3. Upload PDF to Minio
	log.Printf("Uploading PDF to MinIO for job %s...", payload.JobID)
	remoteKey := payload.JobID.String() + ".pdf"
	
	if err := w.uploadFile(ctx, "tarang-docs-processed", remoteKey, localOutputPath, "application/pdf"); err != nil {
		w.updateStatus(ctx, payload.JobID, "FAILED", nil)
		return fmt.Errorf("failed to upload PDF %s: %v", remoteKey, err)
	}

	// 4. Update DB Status
	if err := w.updateStatus(ctx, payload.JobID, "COMPLETED", &remoteKey); err != nil {
		return fmt.Errorf("failed to update final status: %v", err)
	}

	log.Printf("Successfully processed document job: %s", payload.JobID)
	return nil
}

func (w *ConvertWorker) downloadFile(ctx context.Context, bucket, key, localPath string) error {
	out, err := os.Create(localPath)
	if err != nil {
		return err
	}
	defer out.Close()

	resp, err := w.minio.S3Client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	_, err = io.Copy(out, resp.Body)
	return err
}

func (w *ConvertWorker) uploadFile(ctx context.Context, bucket, key, localPath, contentType string) error {
	file, err := os.Open(localPath)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = w.minio.S3Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(bucket),
		Key:         aws.String(key),
		Body:        file,
		ContentType: aws.String(contentType),
	})
	return err
}

func (w *ConvertWorker) updateStatus(ctx context.Context, jobID uuid.UUID, status string, processedKey *string) error {
	query := `UPDATE document_jobs SET status = $1, processed_minio_key = $2, updated_at = NOW() WHERE id = $3`
	_, err := w.db.Exec(ctx, query, status, processedKey, jobID)
	return err
}
