package storage

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

type MinioClient struct {
	S3Client    *s3.Client
	PresignClient *s3.PresignClient
}

func NewMinioClient(ctx context.Context) (*MinioClient, error) {
	endpoint := os.Getenv("MINIO_ENDPOINT")
	if endpoint == "" {
		endpoint = "http://localhost:9000"
	} else {
		endpoint = "http://" + endpoint
	}
	accessKey := os.Getenv("MINIO_ACCESS_KEY")
	secretKey := os.Getenv("MINIO_SECRET_KEY")

	if accessKey == "" || secretKey == "" {
		log.Println("WARNING: MINIO_ACCESS_KEY or MINIO_SECRET_KEY is empty. Using defaults.")
		accessKey = "minioadmin"
		secretKey = "minioadmin"
	}

	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("us-east-1"),
		config.WithCredentialsProvider(aws.CredentialsProviderFunc(func(ctx context.Context) (aws.Credentials, error) {
			return aws.Credentials{
				AccessKeyID:     accessKey,
				SecretAccessKey: secretKey,
			}, nil
		})),
	)
	if err != nil {
		return nil, fmt.Errorf("unable to load SDK config: %v", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = true
		o.BaseEndpoint = aws.String(endpoint)
	})

	publicEndpoint := os.Getenv("MINIO_PUBLIC_URL")
	if publicEndpoint == "" {
		publicEndpoint = endpoint
	}

	presignBaseClient := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = true
		o.BaseEndpoint = aws.String(publicEndpoint)
	})
	presignClient := s3.NewPresignClient(presignBaseClient)

	return &MinioClient{
		S3Client:    client,
		PresignClient: presignClient,
	}, nil
}

func (m *MinioClient) GetObject(ctx context.Context, bucketName, objectKey string) (*s3.GetObjectOutput, error) {
	return m.S3Client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
	})
}

func (m *MinioClient) GeneratePresignedUploadURL(ctx context.Context, bucketName, objectKey, contentType string, lifetime time.Duration) (string, error) {
	input := &s3.PutObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
	}
	
	if contentType != "" {
		input.ContentType = aws.String(contentType)
	}

	req, err := m.PresignClient.PresignPutObject(ctx, input, func(opts *s3.PresignOptions) {
		opts.Expires = lifetime
	})
	if err != nil {
		return "", err
	}
	return req.URL, nil
}

func (m *MinioClient) GeneratePresignedDownloadURL(ctx context.Context, bucketName, objectKey string, lifetime time.Duration) (string, error) {
	req, err := m.PresignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = lifetime
	})
	if err != nil {
		return "", err
	}
	return req.URL, nil
}

func (m *MinioClient) CreateMultipartUpload(ctx context.Context, bucketName, objectKey string) (string, error) {
	out, err := m.S3Client.CreateMultipartUpload(ctx, &s3.CreateMultipartUploadInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
	})
	if err != nil {
		return "", err
	}
	return *out.UploadId, nil
}

func (m *MinioClient) GeneratePresignedPartURLs(ctx context.Context, bucketName, objectKey, uploadId string, numParts int32, lifetime time.Duration) ([]string, error) {
	urls := make([]string, numParts)
	for i := int32(1); i <= numParts; i++ {
		req, err := m.PresignClient.PresignUploadPart(ctx, &s3.UploadPartInput{
			Bucket:     aws.String(bucketName),
			Key:        aws.String(objectKey),
			UploadId:   aws.String(uploadId),
			PartNumber: aws.Int32(i),
		}, func(opts *s3.PresignOptions) {
			opts.Expires = lifetime
		})
		if err != nil {
			return nil, err
		}
		urls[i-1] = req.URL
	}
	return urls, nil
}

func (m *MinioClient) CompleteMultipartUpload(ctx context.Context, bucketName, objectKey, uploadId string, completedParts []map[string]interface{}) error {
	var parts []types.CompletedPart
	for _, cp := range completedParts {
		partNum := int32(cp["PartNumber"].(float64))
		eTag := cp["ETag"].(string)
		parts = append(parts, types.CompletedPart{
			PartNumber: aws.Int32(partNum),
			ETag:       aws.String(eTag),
		})
	}

	_, err := m.S3Client.CompleteMultipartUpload(ctx, &s3.CompleteMultipartUploadInput{
		Bucket:   aws.String(bucketName),
		Key:      aws.String(objectKey),
		UploadId: aws.String(uploadId),
		MultipartUpload: &types.CompletedMultipartUpload{
			Parts: parts,
		},
	})
	return err
}

func (m *MinioClient) DeleteFile(ctx context.Context, bucketName, objectKey string) error {
	_, err := m.S3Client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
	})
	return err
}
