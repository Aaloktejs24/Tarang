package main

import (
	"context"
	"log"
	"net"
	"net/http"

	"backend/proto/lmspb"
	"backend/services/lms/internal/lms"
	lmsgrpc "backend/services/lms/internal/grpc"
	v1 "backend/services/lms/internal/http/v1"

	"backend/shared/config"
	"backend/shared/database"
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

	shutdown, err := tracing.InitTracer("lms-service")
	if err != nil {
		logger.Log.Fatal("failed to init tracer", zap.Error(err))
	}
	defer func() { _ = shutdown(ctx) }()

	cfg := config.Load()
	if err := cfg.Validate(); err != nil {
		logger.Log.Fatal("invalid config", zap.Error(err))
	}

	err = database.ConnectMongoDB(cfg.MongoURI, "lms_db")
	if err != nil {
		log.Fatal(err)
	}
	defer database.DisconnectMongoDB()

	repo := lms.NewRepository(database.MongoDatabase)
	lmsService := lms.NewService(repo, cfg)

	lmsHandler := v1.NewLMSHandler(lmsService)

	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000", "http://localhost:3001"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.Route("/api/v1/lms", func(r chi.Router) {
		v1.RegisterRoutes(r, lmsHandler)
	})

	go func() {
		log.Println("LMS service HTTP running on :8085")
		if err := http.ListenAndServe(":8085", r); err != nil { // #nosec G114
			logger.Log.Fatal("http server failed", zap.Error(err))
		}
	}()

	lis, err := net.Listen("tcp", ":50055") // #nosec G102
	if err != nil {
		logger.Log.Fatal("failed to listen", zap.Error(err))
	}

	grpcServer := grpc.NewServer(
		grpc.StatsHandler(otelgrpc.NewServerHandler()),
	)

	lmspb.RegisterLMSServiceServer(
		grpcServer,
		lmsgrpc.NewServer(lmsService),
	)

	log.Println("LMS service gRPC running on :50055")

	if err := grpcServer.Serve(lis); err != nil {
		log.Fatal(err)
	}
}
