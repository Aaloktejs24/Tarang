package config

import (
	"net/url"
	"os"
	"strconv"
)

type Config struct {
	AuthDBURL string
	UserDBURL string
	AdmissionDBURL string

	RedisAddr     string
	RedisPassword string
	RedisDB       int

	JWTSecret string
	Port      string
	RabbitURL string

	SESSenderEmail string

	MSG91AuthKey    string
	MSG91TemplateID string

	SandboxAPIKey         string
	SandboxAPISecret      string
	DigilockerRedirectURL string

	ALEMasterKey string

	AWSRegion          string
	AWSAccessKeyID     string
	AWSSecretAccessKey string

	MinioEndpoint  string
	MinioAccessKey string
	MinioSecretKey string
	MinioUseSSL    bool
	MinioPublicURL string

	UserServiceAddr    string
	SuperAdminPassword string
}

func Load() *Config {
	return &Config{
		AuthDBURL: getEnv(
			"AUTH_DATABASE_URL",
			"postgresql://user:pass@localhost:5432/auth_db?sslmode=disable",
		),

		UserDBURL: getEnv(
			"USER_DATABASE_URL",
			"postgresql://user:pass@localhost:5432/user_db?sslmode=disable",
		),

		AdmissionDBURL: getEnv(
			"ADMISSION_DATABASE_URL",
			"postgresql://user:pass@localhost:5432/admission_db?sslmode=disable",
		),

		RedisAddr:     getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),
		RedisDB:       getEnvAsInt("REDIS_DB", 0),

		JWTSecret: getEnv("JWT_SECRET", "change-me-in-production"),
		Port:      getEnv("PORT", "8080"),

		RabbitURL:      getEnv("RABBIT_URL", "amqp://guest:guest@localhost:5672/"),
		SESSenderEmail: getEnv("SES_SENDER_EMAIL", ""),

		MSG91AuthKey:    getEnv("MSG91_AUTH_KEY", ""),
		MSG91TemplateID: getEnv("MSG91_TEMPLATE_ID", ""),

		SandboxAPIKey:         os.Getenv("SANDBOX_API_KEY"),
		SandboxAPISecret:      os.Getenv("SANDBOX_API_SECRET"),
		DigilockerRedirectURL: os.Getenv("DIGILOCKER_REDIRECT_URL"),

		ALEMasterKey: getEnv("ALE_MASTER_KEY", ""),

		// Used by SES
		AWSRegion:          getEnv("AWS_REGION", "ap-south-1"),
		AWSAccessKeyID:     os.Getenv("AWS_ACCESS_KEY_ID"),
		AWSSecretAccessKey: os.Getenv("AWS_SECRET_ACCESS_KEY"),

		// Used by MinIO Object Storage
		MinioEndpoint:  getEnv("MINIO_ENDPOINT", "localhost:9000"),
		MinioAccessKey: getEnv("MINIO_ACCESS_KEY", "minioadmin"),
		MinioSecretKey: getEnv("MINIO_SECRET_KEY", "minioadmin"),
		MinioUseSSL:    getEnv("MINIO_USE_SSL", "false") == "true",
		MinioPublicURL: getEnv("MINIO_PUBLIC_URL", "http://localhost:9000"),

		UserServiceAddr:    getEnv("USER_SERVICE_ADDR", "user-service:50051"),
		SuperAdminPassword: os.Getenv("SUPER_ADMIN_PASSWORD"),
	}
}

func (c *Config) Validate() error {
	if _, err := url.ParseRequestURI(c.AuthDBURL); err != nil {
		return err
	}

	if _, err := url.ParseRequestURI(c.UserDBURL); err != nil {
		return err
	}

	if _, err := url.ParseRequestURI(c.AdmissionDBURL); err != nil {
		return err
	}

	return nil
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func getEnvAsInt(name string, fallback int) int {
	if value, ok := os.LookupEnv(name); ok {
		if n, err := strconv.Atoi(value); err == nil {
			return n
		}
	}
	return fallback
}
