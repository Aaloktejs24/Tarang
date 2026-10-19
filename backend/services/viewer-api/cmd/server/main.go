package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	amqp "github.com/rabbitmq/amqp091-go"
	
	"backend/services/viewer-api/internal/handler"
	"backend/services/viewer-api/internal/repository"
	"backend/pkg/storage"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8084" // Different port
	}

	// Setup Database Connection
	dbURL := os.Getenv("VIEWER_DATABASE_URL")
	var dbPool *pgxpool.Pool
	if dbURL != "" {
		poolConfig, err := pgxpool.ParseConfig(dbURL)
		if err != nil {
			log.Fatalf("Unable to parse DATABASE_URL: %v", err)
		}
		dbPool, err = pgxpool.NewWithConfig(context.Background(), poolConfig)
		if err != nil {
			log.Fatalf("Unable to connect to database: %v", err)
		}
		defer dbPool.Close()
		log.Println("Connected to PostgreSQL")
	} else {
		log.Println("Warning: VIEWER_DATABASE_URL not set")
	}

	// Setup RabbitMQ Connection
	rabbitURL := os.Getenv("RABBIT_URL")
	var rabbitConn *amqp.Connection
	if rabbitURL != "" {
		var err error
		rabbitConn, err = amqp.Dial(rabbitURL)
		if err != nil {
			log.Fatalf("Failed to connect to RabbitMQ: %v", err)
		}
		defer rabbitConn.Close()
		log.Println("Connected to RabbitMQ")
	} else {
		log.Println("Warning: RABBIT_URL not set")
	}

	// Setup Minio
	minioClient, err := storage.NewMinioClient(context.Background())
	if err != nil {
		log.Fatalf("Failed to initialize MinIO client: %v", err)
	}

	repo := repository.NewViewerRepository(dbPool)
	h := handler.NewViewerHandler(repo, minioClient, rabbitConn)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("viewer-api OK"))
	})

	r.Post("/api/v1/viewer/upload-intent", h.HandleUploadIntent)
	r.Post("/api/v1/viewer/process/{job_id}", h.HandleProcess)
	r.Post("/api/v1/viewer/tex/compile", h.HandleCompileTeX)
	r.Get("/api/v1/viewer/{job_id}/metadata", h.HandleGetMetadata)
	r.Get("/api/v1/viewer/download/{job_id}", h.HandleDownload)

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		log.Printf("Starting viewer-api on port %s...", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Println("Server exiting")
}
