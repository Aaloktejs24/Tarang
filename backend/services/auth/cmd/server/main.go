package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"backend/services/auth/internal/auth"
	authclient "backend/services/auth/internal/client"
	v1 "backend/services/auth/internal/http/v1"
	"backend/services/auth/internal/jobs"

	"backend/shared/config"
	"backend/shared/database"
	"backend/shared/logger"
	"backend/shared/queue"
	"backend/shared/redis"
	"backend/shared/tracing"

	"backend/shared/env"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/robfig/cron/v3"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.uber.org/zap"
)

func main() {

	//---------------------------------------------------
	// 1️⃣ Load ENV
	//---------------------------------------------------

	env.Load()

	logger.InitLogger()
	defer logger.Sync()

	//---------------------------------------------------
	// 2️⃣ Load Config
	//---------------------------------------------------

	cfg := config.Load()

	if err := cfg.Validate(); err != nil {
		logger.Log.Fatal("invalid config", zap.Error(err))
	}

	ctx := context.Background()

	//---------------------------------------------------
	// Tracing
	//---------------------------------------------------

	shutdown, err := tracing.InitTracer("auth-service")
	if err != nil {
		logger.Log.Fatal("failed to init tracer", zap.Error(err))
	}
	defer func() { _ = shutdown(ctx) }()

	//---------------------------------------------------
	// 3️⃣ Postgres
	//---------------------------------------------------

	db, err := database.ConnectPostgres(ctx, cfg.AuthDBURL)
	if err != nil {
		logger.Log.Fatal("postgres connection failed", zap.Error(err))
	}
	defer db.Close()

	//---------------------------------------------------
	// 4️⃣ Redis
	//---------------------------------------------------

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

	//---------------------------------------------------
	// 5️⃣ RabbitMQ
	//---------------------------------------------------

	conn, ch, err := queue.ConnectRabbitMQ(cfg.RabbitURL)
	if err != nil {
		log.Fatalf("rabbitmq connection failed: %v", err)
	}
	defer func() { _ = conn.Close() }()
	defer func() { _ = ch.Close() }()

	publisher := queue.NewPublisher(ch)

	//---------------------------------------------------
	// 6️⃣ Repository
	//---------------------------------------------------

	authRepo := auth.NewRepository(db)

	//---------------------------------------------------
	// 6.5️⃣ Cron Jobs
	//---------------------------------------------------

	adminTokenJob := jobs.NewAdminTokenJob(authRepo)
	adminTokenJob.InitAdminToken()

	c := cron.New()
	// Run at midnight every day
	_, err = c.AddJob("@midnight", adminTokenJob)
	if err != nil {
		logger.Log.Fatal("failed to schedule admin token cron", zap.Error(err))
	}
	c.Start()
	defer c.Stop()

	//---------------------------------------------------
	// 7️⃣ gRPC User Client
	//---------------------------------------------------

	userClient, err := authclient.NewUserClient(cfg.UserServiceAddr)
	if err != nil {
		log.Fatal(err)
	}
	defer func() { _ = userClient.Close() }()

	//---------------------------------------------------
	// 8️⃣ Service
	//---------------------------------------------------

	authSvc := auth.NewService(
		authRepo,
		userClient,
		redisClient,
		cfg,
		publisher,
	)

	//---------------------------------------------------
	// 🔟 Handler
	//---------------------------------------------------

	authHandler := v1.NewAuthHandler(authSvc)

	//---------------------------------------------------
	// 🔟 Router
	//---------------------------------------------------

	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))

	// Tracing middleware
	r.Use(func(next http.Handler) http.Handler {
		return otelhttp.NewHandler(next, "api-request")
	})

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000", "http://localhost:3001"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	//---------------------------------------------------
	// Routes & Metrics
	//---------------------------------------------------

	r.Handle("/metrics", promhttp.Handler())

	r.Route("/api/v1", func(r chi.Router) {
		v1.RegisterRoutes(r, authHandler)
	})

	//---------------------------------------------------
	// HTTP Server
	//---------------------------------------------------

	addr := fmt.Sprintf(":%s", cfg.Port)

	server := &http.Server{
		Addr:         addr,
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	logger.Log.Info("Auth service running", zap.String("port", addr))

	if err := server.ListenAndServe(); err != nil {
		logger.Log.Fatal("Auth service crashed", zap.Error(err))
	}
}
