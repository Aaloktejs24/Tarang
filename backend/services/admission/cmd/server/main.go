package main

import (
	"context"
	"log"
	"net"
	"net/http"

	"backend/proto/admissionpb"
	"backend/services/admission/internal/admission"
	admissiongrpc "backend/services/admission/internal/grpc"
	v1 "backend/services/admission/internal/http/v1"
	"backend/services/admission/internal/jobs"

	"backend/shared/config"
	"backend/shared/database"
	"backend/shared/env"
	"backend/shared/logger"
	"backend/shared/tracing"
	"backend/shared/redis"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

func main() {
	env.Load()

	ctx := context.Background()

	logger.InitLogger()
	defer logger.Sync()

	shutdown, err := tracing.InitTracer("admission-service")
	if err != nil {
		logger.Log.Fatal("failed to init tracer", zap.Error(err))
	}
	defer func() { _ = shutdown(ctx) }()

	cfg := config.Load()
	if err := cfg.Validate(); err != nil {
		logger.Log.Fatal("invalid config", zap.Error(err))
	}

	err = database.ConnectMongoDB(cfg.MongoURI, "admissions_db")
	if err != nil {
		log.Fatal(err)
	}
	defer database.DisconnectMongoDB()

	redisClient, err := redis.ConnectRedis(
		ctx,
		cfg.RedisAddr,
		cfg.RedisPassword,
		cfg.RedisDB,
	)
	if err != nil {
		log.Fatalf("redis connection failed: %v", err)
	}
	defer func() { _ = redisClient.Close() }()

	repo := admission.NewRepository(database.MongoDatabase, redisClient)
	admissionService := admission.NewService(repo, cfg)

	// Start background cleanup for abandoned drafts and applications (every 24h)
	jobs.StartAbandonedCleanupJob(admissionService)

	admissionHandler := v1.NewAdmissionHandler(admissionService, redisClient)

	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000", "http://localhost:3001"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "Idempotency-Key"},
		AllowCredentials: true,
	}))

	r.Route("/api/v1", func(r chi.Router) {
		v1.RegisterRoutes(r, admissionHandler)
	})

	go func() {
		log.Println("Admission service HTTP running on :8082")
		if err := http.ListenAndServe(":8082", r); err != nil { // #nosec G114
			logger.Log.Fatal("http server failed", zap.Error(err))
		}
	}()

	lis, err := net.Listen("tcp", ":50052") // #nosec G102
	if err != nil {
		logger.Log.Fatal("failed to listen", zap.Error(err))
	}

	grpcServer := grpc.NewServer(
		grpc.StatsHandler(otelgrpc.NewServerHandler()),
	)

	admissionpb.RegisterAdmissionServiceServer(
		grpcServer,
		admissiongrpc.NewServer(admissionService),
	)

	log.Println("Admission service gRPC running on :50052")

	if err := grpcServer.Serve(lis); err != nil {
		log.Fatal(err)
	}
}
