package processor

import (
	"context"
	"crypto/md5"
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

type TranscodeMessage struct {
	JobID       uuid.UUID `json:"job_id"`
	RawMinioKey string    `json:"raw_minio_key"`
}

type TranscodeWorker struct {
	db    *pgxpool.Pool
	minio *storage.MinioClient
}

func NewTranscodeWorker(db *pgxpool.Pool, minio *storage.MinioClient) *TranscodeWorker {
	return &TranscodeWorker{
		db:    db,
		minio: minio,
	}
}

func (w *TranscodeWorker) ProcessMessage(ctx context.Context, msg amqp.Delivery) error {
	var payload TranscodeMessage
	if err := json.Unmarshal(msg.Body, &payload); err != nil {
		log.Printf("Failed to unmarshal message: %v", err)
		return err // Return err to Nack/requeue if desired, or nil to discard
	}

	log.Printf("Processing job: %s, file: %s", payload.JobID, payload.RawMinioKey)

	// 1. Download from Minio
	localInputPath := filepath.Join("/tmp", payload.RawMinioKey)
	if err := w.downloadFile(ctx, "tarang-media-raw", payload.RawMinioKey, localInputPath); err != nil {
		w.updateStatus(ctx, payload.JobID, "FAILED", nil, nil)
		return fmt.Errorf("failed to download file: %v", err)
	}
	defer os.Remove(localInputPath)

	// 2. Run FFmpeg
	outputDir := filepath.Join("/tmp", payload.JobID.String())
	if err := os.MkdirAll(outputDir, os.ModePerm); err != nil {
		w.updateStatus(ctx, payload.JobID, "FAILED", nil, nil)
		return fmt.Errorf("failed to create output dir: %v", err)
	}
	defer os.RemoveAll(outputDir) // Clean up chunks

	// Calculate deterministic KID and KEY based on JobID
	kidHex := strings.ReplaceAll(payload.JobID.String(), "-", "")
	// A simple deterministic key for mock purposes (in production, fetch from secure KMS)
	keyHex := fmt.Sprintf("%x", md5.Sum([]byte(payload.JobID.String() + "TARANG_SECRET")))[0:32]

	manifestFile := "index.mpd"
	localManifestPath := filepath.Join(outputDir, manifestFile)

	// CMAF DASH + HLS with CENC ClearKey Encryption
	cmd := exec.CommandContext(ctx, "ffmpeg",
		"-i", localInputPath,
		"-map", "0:v:0", "-map", "0:a:0?", // map first video and audio stream
		"-c:v", "libx264", "-c:a", "aac",
		"-f", "dash",
		"-seg_duration", "10",
		"-use_timeline", "1",
		"-use_template", "1",
		"-hls_playlist", "1",
		"-encryption_scheme", "cenc-aes-ctr",
		"-encryption_key", keyHex,
		"-encryption_kid", kidHex,
		localManifestPath,
	)
	
	log.Printf("Running FFmpeg for job %s...", payload.JobID)
	if out, err := cmd.CombinedOutput(); err != nil {
		w.updateStatus(ctx, payload.JobID, "FAILED", nil, nil)
		log.Printf("FFmpeg failed: %v\nOutput: %s", err, string(out))
		return fmt.Errorf("ffmpeg failed: %v", err)
	}

	// 3. Upload Chunks to Minio
	log.Printf("Uploading CMAF chunks & Manifests to MinIO for job %s...", payload.JobID)
	files, err := os.ReadDir(outputDir)
	if err != nil {
		w.updateStatus(ctx, payload.JobID, "FAILED", nil, nil)
		return fmt.Errorf("failed to read output dir: %v", err)
	}

	for _, f := range files {
		if f.IsDir() {
			continue
		}
		localFilePath := filepath.Join(outputDir, f.Name())
		remoteKey := fmt.Sprintf("%s/%s", payload.JobID.String(), f.Name())
		
		var contentType string
		if strings.HasSuffix(f.Name(), ".m3u8") {
			contentType = "application/vnd.apple.mpegurl"
		} else if strings.HasSuffix(f.Name(), ".mpd") {
			contentType = "application/dash+xml"
		} else if strings.HasSuffix(f.Name(), ".m4s") || strings.HasSuffix(f.Name(), ".mp4") {
			contentType = "video/mp4"
		} else {
			contentType = "application/octet-stream"
		}

		if err := w.uploadFile(ctx, "tarang-media-processed", remoteKey, localFilePath, contentType); err != nil {
			w.updateStatus(ctx, payload.JobID, "FAILED", nil, nil)
			return fmt.Errorf("failed to upload chunk %s: %v", f.Name(), err)
		}
	}

	// 4. Update DB Status
	publicDashUrl := fmt.Sprintf("%s/tarang-media-processed/%s/%s", os.Getenv("MINIO_PUBLIC_URL"), payload.JobID.String(), manifestFile)
	publicHlsUrl := fmt.Sprintf("%s/tarang-media-processed/%s/media_0.m3u8", os.Getenv("MINIO_PUBLIC_URL"), payload.JobID.String()) // FFmpeg dash hls playlist name
	
	if err := w.updateStatus(ctx, payload.JobID, "COMPLETED", &publicDashUrl, &publicHlsUrl); err != nil {
		return fmt.Errorf("failed to update final status: %v", err)
	}

	// 5. Auto-delete the raw uploaded video to save storage space
	log.Printf("Deleting raw uploaded file from MinIO to save storage space...")
	delErr := w.minio.DeleteFile(ctx, "tarang-media-raw", payload.RawMinioKey)
	if delErr != nil {
		log.Printf("WARNING: Failed to delete raw file %s: %v", payload.RawMinioKey, delErr)
	} else {
		log.Printf("Successfully deleted raw file %s", payload.RawMinioKey)
	}

	log.Printf("Successfully processed job: %s", payload.JobID)
	return nil
}

func (w *TranscodeWorker) downloadFile(ctx context.Context, bucket, key, localPath string) error {
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

func (w *TranscodeWorker) uploadFile(ctx context.Context, bucket, key, localPath, contentType string) error {
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

func (w *TranscodeWorker) updateStatus(ctx context.Context, jobID uuid.UUID, status string, dashUrl *string, hlsUrl *string) error {
	query := `UPDATE streaming_jobs SET status = $1, dash_manifest_url = $2, hls_manifest_url = $3, updated_at = NOW() WHERE id = $4`
	_, err := w.db.Exec(ctx, query, status, dashUrl, hlsUrl, jobID)
	return err
}
