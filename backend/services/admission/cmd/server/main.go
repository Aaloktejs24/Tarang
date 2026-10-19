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

	"database/sql"
	_ "github.com/lib/pq"
	
	"backend/shared/config"
	"backend/shared/env"
	"backend/shared/logger"
	"backend/shared/tracing"

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
	defer shutdown(ctx)

	cfg := config.Load()
	if err := cfg.Validate(); err != nil {
		logger.Log.Fatal("invalid config", zap.Error(err))
	}

	db, err := sql.Open("postgres", cfg.AdmissionDBURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	repo := admission.NewRepository(db)
	admissionService := admission.NewService(repo, cfg)

	admissionHandler := v1.NewAdmissionHandler(admissionService)

	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000", "http://localhost:3001"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.Route("/api/v1", func(r chi.Router) {
		v1.RegisterRoutes(r, admissionHandler)
	})

	go func() {
		log.Println("Admission service HTTP running on :8082")
		if err := http.ListenAndServe(":8082", r); err != nil {
			logger.Log.Fatal("http server failed", zap.Error(err))
		}
	}()

	lis, err := net.Listen("tcp", ":50052")
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
