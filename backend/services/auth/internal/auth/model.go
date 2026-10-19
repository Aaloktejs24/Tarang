package auth

import (
	"time"

	"github.com/google/uuid"
)

type TokenKind string

const (
	TokenVerifyEmail   TokenKind = "verify_email"
	TokenResetPassword TokenKind = "reset_password"
	TokenOTP           TokenKind = "otp"
	TokenRefresh       TokenKind = "refresh"
)

type UserToken struct {
	ID         uuid.UUID  `db:"id" json:"id"`
	UserID     uuid.UUID  `db:"user_id" json:"user_id"`
	Kind       TokenKind  `db:"kind" json:"kind"`
	TokenHash  []byte     `db:"token_hash" json:"-"`
	ExpiresAt  time.Time  `db:"expires_at" json:"expires_at"`
	ConsumedAt *time.Time `db:"consumed_at" json:"consumed_at,omitempty"`
	CreatedAt  time.Time  `db:"created_at" json:"created_at"`
}

type Account struct {
	ID              uuid.UUID  `db:"id" json:"id"`
	Username        string     `db:"username" json:"username"`
	Email           string     `db:"email" json:"email"`
	Phone           *string    `db:"phone" json:"phone,omitempty"`
	PasswordHash    string     `db:"password_hash" json:"-"`
	EmailVerifiedAt *time.Time `db:"email_verified_at" json:"email_verified_at,omitempty"`
	PhoneVerifiedAt *time.Time `db:"phone_verified_at" json:"phone_verified_at,omitempty"`
	Disabled        bool       `db:"disabled" json:"disabled"`
	CreatedAt       time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt       time.Time  `db:"updated_at" json:"updated_at"`
}

type RegistrationSession struct {
	ID            uuid.UUID `db:"id" json:"id"`
	Email         string    `db:"email" json:"email"`
	Phone         *string   `db:"phone" json:"phone,omitempty"`
	OTPHash       *string   `db:"otp_hash" json:"-"`
	EmailVerified bool      `db:"email_verified" json:"email_verified"`
	ExpiresAt     time.Time `db:"expires_at" json:"expires_at"`
	CreatedAt     time.Time `db:"created_at" json:"created_at"`
}

type LoginSession struct {
	ID            uuid.UUID `db:"id" json:"id"`
	UserID        uuid.UUID `db:"user_id" json:"user_id"`
	RequiresTOTP  bool      `db:"requires_totp" json:"requires_totp"`
	RequiresOTP   bool      `db:"requires_otp" json:"requires_otp"`
	RequiresSetup bool      `db:"requires_setup" json:"requires_setup"`
	ExpiresAt     time.Time `db:"expires_at" json:"expires_at"`
	CreatedAt     time.Time `db:"created_at" json:"created_at"`
}

type AdminToken struct {
	ID        int       `db:"id" json:"id"`
	Token     string    `db:"token" json:"token"`
	Role      string    `db:"role" json:"role"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	ExpiresAt time.Time `db:"expires_at" json:"expires_at"`
}