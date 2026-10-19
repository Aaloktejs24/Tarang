package auth

import (
	"context"
	"encoding/json"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository { return &Repository{db: db} }

func (r *Repository) CreateToken(ctx context.Context, t *UserToken) error {
	row := r.db.QueryRow(ctx, `
		INSERT INTO user_tokens (user_id, kind, token_hash, expires_at)
		VALUES ($1,$2,$3,$4) RETURNING id, created_at
	`, t.UserID, t.Kind, t.TokenHash, t.ExpiresAt)
	return row.Scan(&t.ID, &t.CreatedAt)
}

func (r *Repository) GetTokenByID(ctx context.Context, id uuid.UUID) (*UserToken, error) {
	var t UserToken
	err := r.db.QueryRow(ctx, `
		SELECT id, user_id, kind, token_hash, expires_at, consumed_at, created_at
		FROM user_tokens WHERE id=$1
	`, id).Scan(&t.ID, &t.UserID, &t.Kind, &t.TokenHash, &t.ExpiresAt, &t.ConsumedAt, &t.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *Repository) GetValidTokenByHash(ctx context.Context, hash []byte, kind TokenKind) (*UserToken, error) {
	var t UserToken
	err := r.db.QueryRow(ctx, `
		SELECT id, user_id, kind, token_hash, expires_at, consumed_at, created_at
		FROM user_tokens
		WHERE token_hash = $1 AND kind = $2 AND consumed_at IS NULL AND expires_at > now()
		LIMIT 1
	`, hash, kind).Scan(&t.ID, &t.UserID, &t.Kind, &t.TokenHash, &t.ExpiresAt, &t.ConsumedAt, &t.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *Repository) ConsumeToken(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `UPDATE user_tokens SET consumed_at = now() WHERE id = $1`, id)
	return err
}

func (r *Repository) ConsumeAllRefreshForUser(ctx context.Context, userID uuid.UUID) error {
	_, err := r.db.Exec(ctx, `UPDATE user_tokens SET consumed_at = now() WHERE user_id=$1 AND kind=$2 AND consumed_at IS NULL`, userID, TokenRefresh)
	return err
}

func (r *Repository) LogEvent(ctx context.Context, userID *uuid.UUID, event, ip, ua string, details map[string]any) error {
	d, _ := json.Marshal(details)
	_, err := r.db.Exec(ctx, `INSERT INTO auth_audits (user_id, event, ip, user_agent, details) VALUES ($1,$2,$3,$4,$5)`, userID, event, ip, ua, d)
	return err
}

// ---------------------------------------------------------
// Registration Sessions
// ---------------------------------------------------------

func (r *Repository) CreateRegistrationSession(ctx context.Context, session *RegistrationSession) error {
	row := r.db.QueryRow(ctx, `
		INSERT INTO registration_sessions (email, phone, expires_at)
		VALUES ($1, $2, $3) RETURNING id, created_at
	`, session.Email, session.Phone, session.ExpiresAt)
	return row.Scan(&session.ID, &session.CreatedAt)
}

func (r *Repository) GetRegistrationSessionByID(ctx context.Context, id uuid.UUID) (*RegistrationSession, error) {
	var s RegistrationSession
	err := r.db.QueryRow(ctx, `
		SELECT id, email, phone, otp_hash, email_verified, expires_at, created_at
		FROM registration_sessions WHERE id=$1
	`, id).Scan(&s.ID, &s.Email, &s.Phone, &s.OTPHash, &s.EmailVerified, &s.ExpiresAt, &s.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *Repository) UpdateRegistrationSessionOTP(ctx context.Context, id uuid.UUID, hash string) error {
	_, err := r.db.Exec(ctx, `UPDATE registration_sessions SET otp_hash=$1 WHERE id=$2`, hash, id)
	return err
}

func (r *Repository) SetRegistrationSessionEmailVerified(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `UPDATE registration_sessions SET email_verified=true WHERE id=$1`, id)
	return err
}

func (r *Repository) DeleteRegistrationSession(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM registration_sessions WHERE id=$1`, id)
	return err
}

// ---------------------------------------------------------
// Accounts
// ---------------------------------------------------------

func (r *Repository) CreateAccount(ctx context.Context, a *Account) error {
	row := r.db.QueryRow(ctx, `
		INSERT INTO accounts (username, email, phone, password_hash, email_verified_at)
		VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at, updated_at
	`, a.Username, a.Email, a.Phone, a.PasswordHash, a.EmailVerifiedAt)
	return row.Scan(&a.ID, &a.CreatedAt, &a.UpdatedAt)
}

func (r *Repository) GetAccountByEmail(ctx context.Context, email string) (*Account, error) {
	var a Account
	err := r.db.QueryRow(ctx, `
		SELECT id, username, email, phone, password_hash, email_verified_at, phone_verified_at, disabled, created_at, updated_at
		FROM accounts WHERE email=$1
	`, email).Scan(&a.ID, &a.Username, &a.Email, &a.Phone, &a.PasswordHash, &a.EmailVerifiedAt, &a.PhoneVerifiedAt, &a.Disabled, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *Repository) GetAccountByUsername(ctx context.Context, username string) (*Account, error) {
	var a Account
	err := r.db.QueryRow(ctx, `
		SELECT id, username, email, phone, password_hash, email_verified_at, phone_verified_at, disabled, created_at, updated_at
		FROM accounts WHERE username=$1
	`, username).Scan(&a.ID, &a.Username, &a.Email, &a.Phone, &a.PasswordHash, &a.EmailVerifiedAt, &a.PhoneVerifiedAt, &a.Disabled, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *Repository) GetAccountByID(ctx context.Context, id uuid.UUID) (*Account, error) {
	var a Account
	err := r.db.QueryRow(ctx, `
		SELECT id, username, email, phone, password_hash, email_verified_at, phone_verified_at, disabled, created_at, updated_at
		FROM accounts WHERE id=$1
	`, id).Scan(&a.ID, &a.Username, &a.Email, &a.Phone, &a.PasswordHash, &a.EmailVerifiedAt, &a.PhoneVerifiedAt, &a.Disabled, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *Repository) UpdateAccountPassword(ctx context.Context, accountID uuid.UUID, hash string) error {
	_, err := r.db.Exec(ctx, `UPDATE accounts SET password_hash = $1, updated_at = NOW() WHERE id = $2`, hash, accountID)
	return err
}