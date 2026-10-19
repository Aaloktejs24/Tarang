package storage

import (
	"bytes"
	"context"
	"net"
	"net/http"
	"strings"
	"time"

	"backend/shared/config"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type MinioClient struct {
	client       *minio.Client
	publicClient *minio.Client
}

func NewMinioClient(cfg *config.Config) (*MinioClient, error) {
	minioClient, err := minio.New(cfg.MinioEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.MinioAccessKey, cfg.MinioSecretKey, ""),
		Secure: cfg.MinioUseSSL,
	})
	if err != nil {
		return nil, err
	}

	publicEndpoint := strings.TrimPrefix(strings.TrimPrefix(cfg.MinioPublicURL, "http://"), "https://")
	isSecure := strings.HasPrefix(cfg.MinioPublicURL, "https://")
	
	publicClient, err := minio.New(publicEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.MinioAccessKey, cfg.MinioSecretKey, ""),
		Secure: isSecure,
		Transport: &http.Transport{
			DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
				if addr == publicEndpoint {
					addr = cfg.MinioEndpoint
				}
				return (&net.Dialer{
					Timeout:   30 * time.Second,
					KeepAlive: 30 * time.Second,
				}).DialContext(ctx, network, addr)
			},
		},
	})
	if err != nil {
		return nil, err
	}

	return &MinioClient{
		client:       minioClient,
		publicClient: publicClient,
	}, nil
}

func (m *MinioClient) GenerateUploadURL(ctx context.Context, bucket, key string, expires time.Duration) (string, error) {
	presignedURL, err := m.publicClient.PresignedPutObject(ctx, bucket, key, expires)
	if err != nil {
		return "", err
	}
	return presignedURL.String(), nil
}

func (m *MinioClient) GenerateDownloadURL(ctx context.Context, bucket, key string, expires time.Duration) (string, error) {
	presignedURL, err := m.publicClient.PresignedGetObject(ctx, bucket, key, expires, nil)
	if err != nil {
		return "", err
	}
	return presignedURL.String(), nil
}

func (m *MinioClient) UploadFile(ctx context.Context, bucket, key string, body []byte, contentType string) (string, error) {
	reader := bytes.NewReader(body)
	_, err := m.client.PutObject(ctx, bucket, key, reader, int64(len(body)), minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", err
	}
	return key, nil
}
