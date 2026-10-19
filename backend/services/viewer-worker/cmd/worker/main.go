package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/jackc/pgx/v5/pgxpool"
	amqp "github.com/rabbitmq/amqp091-go"
	
	"backend/services/viewer-worker/internal/processor"
	"backend/pkg/storage"
)

func main() {
	log.Println("Starting Viewer Document Conversion Worker...")

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
	if rabbitURL == "" {
		log.Fatal("RABBIT_URL environment variable is required")
	}

	conn, err := amqp.Dial(rabbitURL)
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %v", err)
	}
	defer ch.Close()

	// Ensure Queue exists
	q, err := ch.QueueDeclare(
		"document.convert.queue", // name
		true,                     // durable
		false,                    // delete when unused
		false,                    // exclusive
		false,                    // no-wait
		nil,                      // arguments
	)
	if err != nil {
		log.Fatalf("Failed to declare a queue: %v", err)
	}

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack (manual ack required)
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	if err != nil {
		log.Fatalf("Failed to register a consumer: %v", err)
	}

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	log.Println("Waiting for messages. To exit press CTRL+C")

	// Setup Minio
	minioClient, err := storage.NewMinioClient(context.Background())
	if err != nil {
		log.Fatalf("Failed to initialize MinIO client: %v", err)
	}

	processor := processor.NewConvertWorker(dbPool, minioClient)

	go func() {
		for d := range msgs {
			if err := processor.ProcessMessage(context.Background(), d); err != nil {
				log.Printf("Error processing message: %v", err)
				d.Nack(false, false)
			} else {
				d.Ack(false)
			}
		}
	}()

	<-quit
	log.Println("Shutting down worker...")
}
