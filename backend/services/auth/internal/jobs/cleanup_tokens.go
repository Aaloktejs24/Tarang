package jobs

import (
	"context"
	"log"
	"time"

	"backend/services/auth/internal/auth"
)

// StartCleanupJob runs a background goroutine every 24 hours
// that cleans up expired tokens, sessions, and unverified users.
func StartCleanupJob(repo *auth.Repository) {
	go func() {
		// Wait 5 minutes after startup before first run
		time.Sleep(5 * time.Minute)

		ticker := time.NewTicker(24 * time.Hour)
		defer ticker.Stop()

		// Run immediately once, then on ticker
		runCleanup(repo)

		for range ticker.C {
			runCleanup(repo)
		}
	}()
	log.Println("[CleanupJob] Background job scheduled — runs every 24 hours")
}

func runCleanup(repo *auth.Repository) {
	ctx := context.Background()

	log.Println("[CleanupJob] Starting cleanup scan...")

	// 1. Clean expired sessions and tokens
	err := repo.CleanExpiredTokensAndSessions(ctx)
	if err != nil {
		log.Printf("[CleanupJob] Failed to clean expired sessions: %v", err)
	} else {
		log.Println("[CleanupJob] Successfully cleaned expired sessions and tokens")
	}

	// 2. Clean 7-day old unverified accounts
	deletedCount, err := repo.CleanUnverifiedAccounts(ctx)
	if err != nil {
		log.Printf("[CleanupJob] Failed to clean unverified accounts: %v", err)
	} else if deletedCount > 0 {
		log.Printf("[CleanupJob] Successfully deleted %d unverified 7-day-old accounts", deletedCount)
	}
}