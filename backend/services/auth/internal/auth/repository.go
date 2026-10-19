package auth

import (
	"context"
	"encoding/json"
	"time"

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
		SELECT id, email, phone, otp_hash, totp_secret, email_verified, expires_at, created_at
		FROM registration_sessions WHERE id=$1
	`, id).Scan(&s.ID, &s.Email, &s.Phone, &s.OTPHash, &s.TOTPSecret, &s.EmailVerified, &s.ExpiresAt, &s.CreatedAt)
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

func (r *Repository) SetRegistrationSessionTOTPSecret(ctx context.Context, id uuid.UUID, secret string) error {
	_, err := r.db.Exec(ctx, `UPDATE registration_sessions SET totp_secret=$1 WHERE id=$2`, secret, id)
	return err
}

func (r *Repository) DeleteRegistrationSession(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM registration_sessions WHERE id=$1`, id)
	return err
}

// ---------------------------------------------------------
// Login Sessions (MFA)
// ---------------------------------------------------------

func (r *Repository) CreateLoginSession(ctx context.Context, session *LoginSession) error {
	row := r.db.QueryRow(ctx, `
		INSERT INTO auth_login_sessions (user_id, requires_totp, requires_otp, requires_setup, expires_at)
		VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at
	`, session.UserID, session.RequiresTOTP, session.RequiresOTP, session.RequiresSetup, session.ExpiresAt)
	return row.Scan(&session.ID, &session.CreatedAt)
}

func (r *Repository) GetLoginSessionByID(ctx context.Context, id uuid.UUID) (*LoginSession, error) {
	var s LoginSession
	err := r.db.QueryRow(ctx, `
		SELECT id, user_id, requires_totp, requires_otp, requires_setup, expires_at, created_at
		FROM auth_login_sessions WHERE id=$1
	`, id).Scan(&s.ID, &s.UserID, &s.RequiresTOTP, &s.RequiresOTP, &s.RequiresSetup, &s.ExpiresAt, &s.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *Repository) DeleteLoginSession(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM auth_login_sessions WHERE id=$1`, id)
	return err
}

// ---------------------------------------------------------
// Accounts
// ---------------------------------------------------------

func (r *Repository) CreateAccount(ctx context.Context, a *Account) error {
	row := r.db.QueryRow(ctx, `
		INSERT INTO accounts (username, email, phone, password_hash, email_verified_at, totp_secret, mfa_preference)
		VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, created_at, updated_at
	`, a.Username, a.Email, a.Phone, a.PasswordHash, a.EmailVerifiedAt, a.TOTPSecret, a.MFAPreference)
	return row.Scan(&a.ID, &a.CreatedAt, &a.UpdatedAt)
}

func (r *Repository) GetAccountByEmail(ctx context.Context, email string) (*Account, error) {
	var a Account
	err := r.db.QueryRow(ctx, `
		SELECT id, username, email, phone, password_hash, email_verified_at, phone_verified_at, totp_secret, mfa_preference, disabled, created_at, updated_at
		FROM accounts WHERE email=$1
	`, email).Scan(&a.ID, &a.Username, &a.Email, &a.Phone, &a.PasswordHash, &a.EmailVerifiedAt, &a.PhoneVerifiedAt, &a.TOTPSecret, &a.MFAPreference, &a.Disabled, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *Repository) GetAccountByUsername(ctx context.Context, username string) (*Account, error) {
	var a Account
	err := r.db.QueryRow(ctx, `
		SELECT id, username, email, phone, password_hash, email_verified_at, phone_verified_at, totp_secret, mfa_preference, disabled, created_at, updated_at
		FROM accounts WHERE username=$1
	`, username).Scan(&a.ID, &a.Username, &a.Email, &a.Phone, &a.PasswordHash, &a.EmailVerifiedAt, &a.PhoneVerifiedAt, &a.TOTPSecret, &a.MFAPreference, &a.Disabled, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *Repository) GetAccountByID(ctx context.Context, id uuid.UUID) (*Account, error) {
	var a Account
	err := r.db.QueryRow(ctx, `
		SELECT id, username, email, phone, password_hash, email_verified_at, phone_verified_at, totp_secret, mfa_preference, disabled, created_at, updated_at
		FROM accounts WHERE id=$1
	`, id).Scan(&a.ID, &a.Username, &a.Email, &a.Phone, &a.PasswordHash, &a.EmailVerifiedAt, &a.PhoneVerifiedAt, &a.TOTPSecret, &a.MFAPreference, &a.Disabled, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *Repository) UpdateAccountPassword(ctx context.Context, accountID uuid.UUID, hash string) error {
	_, err := r.db.Exec(ctx, `UPDATE accounts SET password_hash = $1, updated_at = NOW() WHERE id = $2`, hash, accountID)
	return err
}

// ---------------------------------------------------------
// Admin Tokens
// ---------------------------------------------------------

func (r *Repository) SaveAdminToken(ctx context.Context, token string, role string, expiresAt time.Time) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO admin_tokens (token, role, expires_at)
		VALUES ($1, $2, $3)
	`, token, role, expiresAt)
	return err
}

func (r *Repository) GetActiveAdminToken(ctx context.Context, role string) (*AdminToken, error) {
	var t AdminToken
	err := r.db.QueryRow(ctx, `
		SELECT id, token, role, created_at, expires_at
		FROM admin_tokens
		WHERE role = $1 AND expires_at > NOW()
		ORDER BY created_at DESC LIMIT 1
	`, role).Scan(&t.ID, &t.Token, &t.Role, &t.CreatedAt, &t.ExpiresAt)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *Repository) GetAdminTokenByValue(ctx context.Context, token string) (*AdminToken, error) {
	var t AdminToken
	err := r.db.QueryRow(ctx, `
		SELECT id, token, role, created_at, expires_at
		FROM admin_tokens
		WHERE token = $1 AND expires_at > NOW()
		LIMIT 1
	`, token).Scan(&t.ID, &t.Token, &t.Role, &t.CreatedAt, &t.ExpiresAt)
	if err != nil {
		return nil, err
	}
	return &t, nil
}
// ---------------------------------------------------------
// Admin WebAuthn Credentials
// ---------------------------------------------------------

type AdminWebAuthnCredential struct {
	ID              uuid.UUID
	Role            string
	Identifier      string
	CredentialID    []byte
	PublicKey       []byte
	AttestationType string
	SignCount       uint32
	AAGUID          []byte
	BackupEligible  bool
	BackupState     bool
	CreatedAt       time.Time
}

func (r *Repository) SaveAdminWebAuthnCredential(ctx context.Context, cred *AdminWebAuthnCredential) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO admin_webauthn_credentials (role, identifier, credential_id, public_key, attestation_type, sign_count, aaguid, backup_eligible, backup_state)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`, cred.Role, cred.Identifier, cred.CredentialID, cred.PublicKey, cred.AttestationType, cred.SignCount, cred.AAGUID, cred.BackupEligible, cred.BackupState)
	return err
}

func (r *Repository) GetAdminWebAuthnCredentials(ctx context.Context, role, identifier string) ([]AdminWebAuthnCredential, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, role, identifier, credential_id, public_key, attestation_type, sign_count, aaguid, backup_eligible, backup_state, created_at
		FROM admin_webauthn_credentials
		WHERE role = $1 AND identifier = $2
	`, role, identifier)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var creds []AdminWebAuthnCredential
	for rows.Next() {
		var c AdminWebAuthnCredential
		var sc int64
		if err := rows.Scan(&c.ID, &c.Role, &c.Identifier, &c.CredentialID, &c.PublicKey, &c.AttestationType, &sc, &c.AAGUID, &c.BackupEligible, &c.BackupState, &c.CreatedAt); err != nil {
			return nil, err
		}
		// #nosec G115
		c.SignCount = uint32(sc)
		creds = append(creds, c)
	}
	return creds, nil
}

func (r *Repository) UpdateAdminWebAuthnCredentialSignCount(ctx context.Context, credentialID []byte, signCount uint32) error {
	_, err := r.db.Exec(ctx, `
		UPDATE admin_webauthn_credentials SET sign_count = $1 WHERE credential_id = $2
	`, signCount, credentialID)
	return err
}

func (r *Repository) GetAccountByPhone(ctx context.Context, phone string) (*Account, error) {
	var a Account
	err := r.db.QueryRow(ctx, `
		SELECT id, username, email, phone, password_hash, email_verified_at, phone_verified_at, totp_secret, mfa_preference, disabled, created_at, updated_at
		FROM accounts WHERE phone=$1
	`, phone).Scan(&a.ID, &a.Username, &a.Email, &a.Phone, &a.PasswordHash, &a.EmailVerifiedAt, &a.PhoneVerifiedAt, &a.TOTPSecret, &a.MFAPreference, &a.Disabled, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *Repository) SetPhoneVerified(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `UPDATE accounts SET phone_verified_at = now() WHERE id=$1`, id)
	return err
}

func (r *Repository) SetEmailVerified(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `UPDATE accounts SET email_verified_at = now() WHERE id=$1`, id)
	return err
}

func (r *Repository) SetAccountTOTPSecret(ctx context.Context, id uuid.UUID, secret string) error {
	_, err := r.db.Exec(ctx, `UPDATE accounts SET totp_secret=$1 WHERE id=$2`, secret, id)
	return err
}

func (r *Repository) UpdateAccountMFAPreference(ctx context.Context, id uuid.UUID, preference string) error {
	_, err := r.db.Exec(ctx, `UPDATE accounts SET mfa_preference=$1 WHERE id=$2`, preference, id)
	return err
}

// ---------------------------------------------------------
// Background Cleanup
// ---------------------------------------------------------

// CleanExpiredTokensAndSessions removes expired tokens and registration/login sessions
func (r *Repository) CleanExpiredTokensAndSessions(ctx context.Context) error {
	// Delete expired registration sessions
	_, err := r.db.Exec(ctx, `DELETE FROM registration_sessions WHERE expires_at < now()`)
	if err != nil {
		return err
	}

	// Delete expired login sessions
	_, err = r.db.Exec(ctx, `DELETE FROM auth_login_sessions WHERE expires_at < now()`)
	if err != nil {
		return err
	}

	// Delete expired tokens
	_, err = r.db.Exec(ctx, `DELETE FROM user_tokens WHERE expires_at < now()`)
	return err
}

// CleanUnverifiedAccounts removes accounts older than 7 days that are not verified
func (r *Repository) CleanUnverifiedAccounts(ctx context.Context) (int64, error) {
	tag, err := r.db.Exec(ctx, `
		DELETE FROM accounts
		WHERE email_verified_at IS NULL
		  AND phone_verified_at IS NULL
		  AND created_at < (now() - interval '7 days')
	`)
	if err != nil {
		return 0, err
	}
	return tag.RowsAffected(), nil
}
