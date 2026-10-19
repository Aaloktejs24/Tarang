package middleware

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/redis/go-redis/v9"
)

type responseRecorder struct {
	http.ResponseWriter
	statusCode int
	body       *bytes.Buffer
}

func (r *responseRecorder) WriteHeader(statusCode int) {
	r.statusCode = statusCode
	r.ResponseWriter.WriteHeader(statusCode)
}

func (r *responseRecorder) Write(b []byte) (int, error) {
	r.body.Write(b)
	return r.ResponseWriter.Write(b)
}

type IdempotencyRecord struct {
	Status     string `json:"status"` // "in_progress" or "completed"
	StatusCode int    `json:"status_code"`
	Body       string `json:"body"`
}

func Idempotency(redisClient *redis.Client) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			idempotencyKey := r.Header.Get("Idempotency-Key")

			// If no key is provided, bypass middleware
			if idempotencyKey == "" {
				next.ServeHTTP(w, r)
				return
			}

			redisKey := "idemp:" + idempotencyKey

			// Check if key exists
			val, err := redisClient.Get(r.Context(), redisKey).Result()
			if err == nil {
				// Key exists
				var record IdempotencyRecord
				if err := json.Unmarshal([]byte(val), &record); err == nil {
					if record.Status == "in_progress" {
						http.Error(w, `{"error": "A request is already being processed."}`, http.StatusConflict)
						return
					}
					if record.Status == "completed" {
						w.Header().Set("Content-Type", "application/json")
						w.WriteHeader(record.StatusCode)
						w.Write([]byte(record.Body))
						return
					}
				}
			} else if err != redis.Nil {
				// Internal redis error, bypass gracefully
				next.ServeHTTP(w, r)
				return
			}

			// Key doesn't exist, mark as in_progress
			initialRecord := IdempotencyRecord{Status: "in_progress"}
			initialBytes, _ := json.Marshal(initialRecord)
			
			// SETNX to prevent race conditions
			set, err := redisClient.SetNX(r.Context(), redisKey, initialBytes, 24*time.Hour).Result()
			if err != nil || !set {
				// Another request might have just set it
				http.Error(w, `{"error": "Concurrent request detected."}`, http.StatusConflict)
				return
			}

			// Wrap ResponseWriter to capture the response
			rec := &responseRecorder{
				ResponseWriter: w,
				statusCode:     http.StatusOK,
				body:           &bytes.Buffer{},
			}

			next.ServeHTTP(rec, r)

			// Update the record with the actual response
			if rec.statusCode >= 200 && rec.statusCode < 400 {
				finalRecord := IdempotencyRecord{
					Status:     "completed",
					StatusCode: rec.statusCode,
					Body:       rec.body.String(),
				}
				finalBytes, _ := json.Marshal(finalRecord)
				// Save successful response
				redisClient.Set(context.Background(), redisKey, finalBytes, 24*time.Hour)
			} else {
				// If the request failed (e.g. 400, 500), we typically remove the idempotency key 
				// so the client can safely retry.
				redisClient.Del(context.Background(), redisKey)
			}
		})
	}
}
