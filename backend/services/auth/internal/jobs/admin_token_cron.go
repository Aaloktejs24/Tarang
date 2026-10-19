package jobs

import (
	"context"
	"crypto/rand"
	"math/big"
	"time"

	"go.uber.org/zap"
	"backend/services/auth/internal/auth"
	"backend/shared/logger"
)

// GenerateRandomString generates an alphanumeric string of given length
func GenerateRandomString(n int) (string, error) {
	const letters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
	ret := make([]byte, n)
	for i := 0; i < n; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(letters))))
		if err != nil {
			return "", err
		}
		ret[i] = letters[num.Int64()]
	}
	return string(ret), nil
}

// AdminTokenJob represents the background task that resets the admin token every night.
type AdminTokenJob struct {
	repo *auth.Repository
}

func NewAdminTokenJob(repo *auth.Repository) *AdminTokenJob {
	return &AdminTokenJob{repo: repo}
}

// Run executes the job
func (j *AdminTokenJob) Run() {
	ctx := context.Background()

	// Set expiration to next midnight
	now := time.Now()
	expiresAt := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, now.Location())

	// Generate and save regular admin token
	adminToken, err := GenerateRandomString(7)
	if err != nil {
		logger.Log.Error("failed to generate random token", zap.Error(err))
		return
	}
	err = j.repo.SaveAdminToken(ctx, adminToken, "admin", expiresAt)
	if err != nil {
		logger.Log.Error("failed to insert admin token", zap.Error(err))
		return
	}

	// Generate and save super admin token
	superAdminToken, err := GenerateRandomString(7)
	if err != nil {
		logger.Log.Error("failed to generate random super admin token", zap.Error(err))
		return
	}
	err = j.repo.SaveAdminToken(ctx, superAdminToken, "super_admin", expiresAt)
	if err != nil {
		logger.Log.Error("failed to insert super admin token", zap.Error(err))
		return
	}

	logger.Log.Info("successfully generated new admin and super admin tokens", 
		zap.String("admin_token", adminToken), 
		zap.String("super_admin_token", superAdminToken), 
		zap.Time("expiresAt", expiresAt))

	// Mock emailing the super admin
	logger.Log.Info("[MOCK EMAIL] To Super Admin: Your daily secure login link is /" + superAdminToken + "/super-admin")
}

// InitAdminToken generates tokens on startup if none are active
func (j *AdminTokenJob) InitAdminToken() {
	ctx := context.Background()
	_, err := j.repo.GetActiveAdminToken(ctx, "super_admin")
	if err != nil {
		// If no active token, run it immediately so the system is usable
		logger.Log.Info("no active super admin token found on startup, generating tokens...")
		j.Run()
	}
}
