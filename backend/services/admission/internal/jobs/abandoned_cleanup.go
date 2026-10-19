package jobs

import (
	"context"
	"log"
	"time"

	"backend/services/admission/internal/admission"
)

// StartAbandonedCleanupJob runs a background goroutine every 24 hours
// that cleans up abandoned program drafts and auto-withdraws abandoned student applications.
// Data is considered abandoned if not updated in the last 30 days.
func StartAbandonedCleanupJob(svc admission.Service) {
	go func() {
		// Wait 5 minutes after startup before first run
		time.Sleep(5 * time.Minute)

		ticker := time.NewTicker(24 * time.Hour)
		defer ticker.Stop()

		// Run immediately once, then on ticker
		cleanAbandonedData(svc)

		for range ticker.C {
			cleanAbandonedData(svc)
		}
	}()
	log.Println("[AbandonedCleanup] Background job scheduled — runs every 24 hours")
}

func cleanAbandonedData(svc admission.Service) {
	ctx := context.Background()
	cutoffTime := time.Now().Add(-30 * 24 * time.Hour) // 30 days ago

	log.Printf("[AbandonedCleanup] Starting cleanup scan for data before %v...", cutoffTime.Format(time.RFC3339))

	err := svc.CleanAbandonedData(ctx, cutoffTime)
	if err != nil {
		log.Printf("[AbandonedCleanup] Scan failed: %v", err)
	} else {
		log.Printf("[AbandonedCleanup] Scan complete")
	}
}
