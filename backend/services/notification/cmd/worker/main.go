package main

import (
	"context"
	"encoding/json"
	"log"
	"sync"

	"backend/shared/config"

	"backend/shared/env"

	mail "backend/services/notification/internal/email"
	sms "backend/services/notification/internal/sms"
	"backend/shared/queue"
	"backend/shared/tracing"

	"github.com/rabbitmq/amqp091-go"
)

func worker(id int, msgs <-chan amqp091.Delivery, ch *amqp091.Channel, mtx *sync.Mutex) {

	for msg := range msgs {

		var job queue.OTPJob

		err := json.Unmarshal(msg.Body, &job)
		if err != nil {
			log.Println("invalid message")
			mtx.Lock()
			_ = msg.Nack(false, false)
			mtx.Unlock()
			continue
		}

		log.Println("worker", id, "processing OTP")

		// Clean handling
		var emailErr, smsErr error

		if job.Email != "" {
			emailErr = mail.SendSES(job.Email, job.Code)
			if emailErr != nil {
				log.Println("email failed:", emailErr)
			}
		}

		if job.Phone != "" {
			smsErr = sms.SendMSG91(job.Phone, job.Code)
			if smsErr != nil {
				log.Println("sms failed:", smsErr)
			}
		}

		// If both operations that were attempted failed, we retry.
		// If at least one succeeded (or wasn't attempted and the other succeeded), we consider it sent.
		// Wait, if BOTH are intended, and ONE fails, should we retry?
		// For OTP, usually it's one or the other.
		hasError := false
		if job.Email != "" && emailErr != nil {
			hasError = true
		}
		if job.Phone != "" && smsErr != nil {
			hasError = true
		}

		if hasError {
			job.Retries++
			body, _ := json.Marshal(job)

			if job.Retries >= 5 {
				log.Println("sending to DLQ")
				mtx.Lock()
				err := ch.Publish("", "otp_dead_queue", false, false, amqp091.Publishing{
					ContentType: "application/json",
					Body:        body,
				})
				mtx.Unlock()
				if err != nil {
					log.Println("DLQ publish failed:", err)
				}
			} else {
				log.Println("retrying OTP")
				mtx.Lock()
				err := ch.Publish("", "otp_retry_queue", false, false, amqp091.Publishing{
					ContentType: "application/json",
					Body:        body,
				})
				mtx.Unlock()
				if err != nil {
					log.Println("retry publish failed:", err)
				}
			}

			mtx.Lock()
			_ = msg.Ack(false)
			mtx.Unlock()
			continue
		}

		log.Println("OTP sent successfully")

		mtx.Lock()
		_ = msg.Ack(false)
		mtx.Unlock()
	}
}

func main() {

	env.Load()

	cfg := config.Load()

	if err := mail.InitSES(cfg.SESSenderEmail); err != nil {
		log.Fatalf("failed to init SES: %v", err)
	}

	if err := sms.InitMSG91(cfg.MSG91AuthKey, cfg.MSG91TemplateID); err != nil {
		log.Fatalf("failed to init MSG91: %v", err)
	}

	ctx := context.Background()
	shutdown, err := tracing.InitTracer("notification-worker")
	if err != nil {
		log.Printf("failed to init tracer: %v", err)
	} else {
		defer func() { _ = shutdown(ctx) }()
	}

	conn, ch, err := queue.ConnectRabbitMQ(cfg.RabbitURL)
	if err != nil {
		log.Fatal(err)
	}

	defer func() { _ = conn.Close() }()
	defer func() { _ = ch.Close() }()

	msgs, err := ch.Consume(
		"otp_queue",
		"",
		false,
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		log.Fatal(err)
	}

	// Worker pool
	var chMutex sync.Mutex
	for i := 0; i < 10; i++ {
		go worker(i, msgs, ch, &chMutex)
	}

	log.Println("Notification worker started")

	select {}
}
