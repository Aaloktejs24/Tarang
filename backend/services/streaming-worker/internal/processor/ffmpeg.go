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
	"regexp"
	"strings"

	"backend/pkg/storage"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	amqp "github.com/rabbitmq/amqp091-go"
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
	inputDir := filepath.Join("/tmp", "raw", payload.JobID.String())
	if err := os.MkdirAll(inputDir, os.ModePerm); err != nil {
		w.updateStatus(ctx, payload.JobID, "FAILED", nil, nil)
		return fmt.Errorf("failed to create input dir: %v", err)
	}
	defer os.RemoveAll(inputDir)

	localInputPath := filepath.Join(inputDir, filepath.Base(payload.RawMinioKey))
	if err := w.downloadFile(ctx, "tarang-media-raw", payload.RawMinioKey, localInputPath); err != nil {
		w.updateStatus(ctx, payload.JobID, "FAILED", nil, nil)
		return fmt.Errorf("failed to download file: %v", err)
	}

	// 2. Run FFmpeg
	outputDir := filepath.Join("/tmp", "proc", payload.JobID.String())
	if err := os.MkdirAll(outputDir, os.ModePerm); err != nil {
		w.updateStatus(ctx, payload.JobID, "FAILED", nil, nil)
		return fmt.Errorf("failed to create output dir: %v", err)
	}
	defer os.RemoveAll(outputDir) // Clean up chunks

	// Calculate deterministic KID and KEY based on JobID
	kidHex := strings.ReplaceAll(payload.JobID.String(), "-", "")
	// A simple deterministic key for mock purposes (in production, fetch from secure KMS)
	keyHex := fmt.Sprintf("%x", md5.Sum([]byte(payload.JobID.String()+"TARANG_SECRET")))[0:32]

	manifestFile := "index.mpd"
	localManifestPath := filepath.Join(outputDir, manifestFile)

	// Check if the input file has an audio stream
	probeCmd := exec.CommandContext(ctx, "ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=codec_type", "-of", "default=noprint_wrappers=1:nokey=1", localInputPath)
	probeOut, _ := probeCmd.Output()
	hasAudio := strings.TrimSpace(string(probeOut)) == "audio"
	log.Printf("Job %s: hasAudio = %v", payload.JobID, hasAudio)

	// Probe input video dimensions to build appropriate ladder and preserve exact aspect ratio
	probeDimsCmd := exec.CommandContext(ctx, "ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=s=x:p=0", localInputPath)
	probeDimsOut, _ := probeDimsCmd.Output()
	sourceWidth := 1920
	sourceHeight := 1080
	var pw, ph int
	if n, err := fmt.Sscanf(strings.TrimSpace(string(probeDimsOut)), "%dx%d", &pw, &ph); err == nil && n == 2 && pw > 0 && ph > 0 {
		sourceWidth = pw
		sourceHeight = ph
	}
	log.Printf("Job %s: sourceDimensions = %dx%d", payload.JobID, sourceWidth, sourceHeight)

	type LadderTier struct {
		Height  int
		Bitrate string
		MaxRate string
		BufSize string
		CRF     int
	}

	allTiers := []LadderTier{
		{Height: 2160, Bitrate: "7000k", MaxRate: "9000k", BufSize: "14000k", CRF: 20},
		{Height: 1440, Bitrate: "4000k", MaxRate: "5500k", BufSize: "8000k", CRF: 21},
		{Height: 1080, Bitrate: "2400k", MaxRate: "3500k", BufSize: "5000k", CRF: 22},
		{Height: 720, Bitrate: "1300k", MaxRate: "1800k", BufSize: "2600k", CRF: 22},
		{Height: 480, Bitrate: "700k", MaxRate: "950k", BufSize: "1400k", CRF: 23},
		{Height: 360, Bitrate: "380k", MaxRate: "500k", BufSize: "750k", CRF: 23},
		{Height: 240, Bitrate: "220k", MaxRate: "300k", BufSize: "450k", CRF: 24},
		{Height: 144, Bitrate: "130k", MaxRate: "180k", BufSize: "260k", CRF: 25},
	}

	var activeTiers []LadderTier
	for _, tier := range allTiers {
		if tier.Height <= sourceHeight {
			activeTiers = append(activeTiers, tier)
		}
	}
	if len(activeTiers) == 0 {
		activeTiers = allTiers
	}

	// Build filter_complex split and scaling with matching DAR
	splitLabels := make([]string, len(activeTiers))
	for i := range activeTiers {
		splitLabels[i] = fmt.Sprintf("[v%d]", i)
	}
	filterParts := []string{
		fmt.Sprintf("[0:v]split=%d%s", len(activeTiers), strings.Join(splitLabels, "")),
	}
	for i, tier := range activeTiers {
		filterParts = append(filterParts, fmt.Sprintf("[v%d]scale=-2:%d,setdar=%d/%d[v%dout]", i, tier.Height, sourceWidth, sourceHeight, i))
	}
	filterComplex := strings.Join(filterParts, "; ")

	// CMAF DASH + HLS with CENC ClearKey Encryption
	ffmpegArgs := []string{
		"-y", // Overwrite just in case
		"-i", localInputPath,
		"-preset", "slow", // High compression efficiency (optimal motion estimation, subme=8, trellis=2)
		"-threads", "0",    // Utilize all available CPU cores
		"-filter_complex", filterComplex,
	}

	for i := range activeTiers {
		ffmpegArgs = append(ffmpegArgs, "-map", fmt.Sprintf("[v%dout]", i))
	}

	if hasAudio {
		ffmpegArgs = append(ffmpegArgs, "-map", "0:a:0", "-c:a", "aac", "-b:a", "128k", "-ar", "48000")
	}

	ffmpegArgs = append(ffmpegArgs,
		"-c:v", "libx264",
		"-pix_fmt", "yuv420p",
		"-profile:v", "high",
		"-level", "4.2",
		"-color_primaries", "bt709",
		"-color_trc", "bt709",
		"-colorspace", "bt709",
		"-g", "48",
		"-keyint_min", "48",
		"-sc_threshold", "0",
		"-x264-params", "rc-lookahead=50:lookahead_threads=0:b-adapt=2:direct=auto:weightp=2:trellis=2",
	)
	for i, tier := range activeTiers {
		ffmpegArgs = append(ffmpegArgs,
			fmt.Sprintf("-b:v:%d", i), tier.Bitrate,
			fmt.Sprintf("-maxrate:v:%d", i), tier.MaxRate,
			fmt.Sprintf("-bufsize:v:%d", i), tier.BufSize,
			fmt.Sprintf("-crf:v:%d", i), fmt.Sprintf("%d", tier.CRF),
		)
	}

	ffmpegArgs = append(ffmpegArgs,
		"-f", "dash",
		"-seg_duration", "4",
		"-use_timeline", "1",
		"-use_template", "1",
	)

	if hasAudio {
		ffmpegArgs = append(ffmpegArgs, "-adaptation_sets", "id=0,streams=v id=1,streams=a")
	} else {
		ffmpegArgs = append(ffmpegArgs, "-adaptation_sets", "id=0,streams=v")
	}

	ffmpegArgs = append(ffmpegArgs,
		"-hls_playlist", "1",
		"-encryption_scheme", "cenc-aes-ctr",
		"-encryption_key", keyHex,
		"-encryption_kid", kidHex,
		localManifestPath,
	)

	cmd := exec.CommandContext(ctx, "ffmpeg", ffmpegArgs...)

	log.Printf("Running FFmpeg for job %s...", payload.JobID)
	if out, err := cmd.CombinedOutput(); err != nil {
		w.updateStatus(ctx, payload.JobID, "FAILED", nil, nil)
		log.Printf("FFmpeg failed: %v\nOutput: %s", err, string(out))
		return fmt.Errorf("ffmpeg failed: %v", err)
	}

	// 2.5 Clean up index.mpd to ensure no empty AdaptationSets exist (prevents Shaka Error 4003)
	if mpdBytes, err := os.ReadFile(localManifestPath); err == nil {
		re := regexp.MustCompile(`(?s)<AdaptationSet[^>]*>\s*</AdaptationSet>`)
		cleaned := re.ReplaceAll(mpdBytes, nil)
		_ = os.WriteFile(localManifestPath, cleaned, 0644)
	}

	// 2.6 Generate a high-resolution poster frame (thumbnail) for instant preview
	posterPath := filepath.Join(outputDir, "poster.jpg")
	posterCmd := exec.CommandContext(ctx, "ffmpeg", "-ss", "00:00:01", "-i", localInputPath, "-vframes", "1", "-q:v", "2", posterPath)
	if err := posterCmd.Run(); err != nil {
		// Fallback to 00:00:00 if video is shorter than 1s
		_ = exec.CommandContext(ctx, "ffmpeg", "-ss", "00:00:00", "-i", localInputPath, "-vframes", "1", "-q:v", "2", posterPath).Run()
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
		} else if strings.HasSuffix(f.Name(), ".jpg") || strings.HasSuffix(f.Name(), ".jpeg") {
			contentType = "image/jpeg"
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
	if err := os.MkdirAll(filepath.Dir(localPath), os.ModePerm); err != nil {
		return err
	}

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
