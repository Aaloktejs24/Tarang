package main

import (
	"context"
	"log"
	"net"

	"backend/proto/userpb"
	usergrpc "backend/services/user/internal/grpc"
	"backend/services/user/internal/user"

	"backend/shared/config"
	"backend/shared/database"
	"backend/shared/logger"
	"backend/shared/redis"
	"backend/shared/tracing"

	v1 "backend/services/user/internal/http/v1"
	"backend/shared/env"
	"backend/shared/kyc"
	"backend/shared/storage"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"

	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

func main() {
	env.Load()

	//---------------------------------------------------
	// Context
	//---------------------------------------------------

	ctx := context.Background()

	//---------------------------------------------------
	// Logger & Tracing
	//---------------------------------------------------

	logger.InitLogger()
	defer logger.Sync()

	shutdown, err := tracing.InitTracer("user-service")
	if err != nil {
		logger.Log.Fatal("failed to init tracer", zap.Error(err))
	}
	defer func() { _ = shutdown(ctx) }()

	//---------------------------------------------------
	// Config
	//---------------------------------------------------

	cfg := config.Load()

	if err := cfg.Validate(); err != nil {
		logger.Log.Fatal("invalid config", zap.Error(err))
	}

	//---------------------------------------------------
	// Database
	//---------------------------------------------------

	db, err := database.ConnectPostgres(ctx, cfg.UserDBURL)
	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()

	//---------------------------------------------------
	// Redis
	//---------------------------------------------------

	redisClient, err := redis.ConnectRedis(ctx, cfg.RedisAddr, cfg.RedisPassword, cfg.RedisDB)
	if err != nil {
		logger.Log.Fatal("redis connection failed", zap.Error(err))
	}
	defer func() { _ = redisClient.Close() }()

	//---------------------------------------------------
	// Repository + Service
	//---------------------------------------------------

	repo := user.NewRepository(db, redisClient, cfg.ALEMasterKey)

	userService := user.NewService(repo, cfg, redisClient)

	//---------------------------------------------------
	// S3 and KYC Clients
	//---------------------------------------------------

	minioClient, err := storage.NewMinioClient(cfg)
	if err != nil {
		logger.Log.Fatal("failed to initialize minio client", zap.Error(err))
	}

	kycSandbox := kyc.NewSandboxProvider(cfg.SandboxAPIKey, cfg.SandboxAPISecret, cfg.DigilockerRedirectURL)

	//---------------------------------------------------
	// HTTP Handlers & Router
	//---------------------------------------------------

	userHandler := v1.NewUserHandler(userService, minioClient, cfg)
	kycHandler := v1.NewKycHandler(userService, kycSandbox)

	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000", "http://localhost:3001"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.Route("/api/v1", func(r chi.Router) {
		v1.RegisterRoutes(r, userHandler, kycHandler)
	})

	go func() {
		log.Println("User service HTTP running on :8081")
		if err := http.ListenAndServe(":8081", r); err != nil { // #nosec G114
			logger.Log.Fatal("http server failed", zap.Error(err))
		}
	}()

	//---------------------------------------------------
	// gRPC server
	//---------------------------------------------------

	lis, err := net.Listen("tcp", ":50051") // #nosec G102
	if err != nil {
		logger.Log.Fatal("failed to listen", zap.Error(err))
	}

	grpcServer := grpc.NewServer(
		grpc.StatsHandler(otelgrpc.NewServerHandler()),
	)

	userpb.RegisterUserServiceServer(
		grpcServer,
		usergrpc.NewServer(userService),
	)

	log.Println("User service running on :50051")

	if err := grpcServer.Serve(lis); err != nil {
		log.Fatal(err)
	}
}
