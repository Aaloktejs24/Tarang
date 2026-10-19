package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base32"
	"fmt"
	"log"
	"math/big"
	"strconv"
	"strings"
	"time"

	"backend/shared/config"
	"backend/shared/queue"

	"github.com/alexedwards/argon2id"
	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/pquerna/otp/totp"
	"github.com/redis/go-redis/v9"
)

const (
	AccessTTL       = 15 * time.Minute
	RefreshTTL      = 7 * 24 * time.Hour
	AdminRefreshTTL = 6 * time.Hour
	OTP_TTL         = 15 * time.Minute
)

////////////////////////////////////////////////////////////
//// USER CLIENT INTERFACE
////////////////////////////////////////////////////////////

type UserClient interface {
	ExistsByEmail(ctx context.Context, email string) (bool, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	GetByUsername(ctx context.Context, username string) (*User, error)
	GetByPhone(ctx context.Context, phone string) (*User, error)
	Create(ctx context.Context, u *User) error
	GetByID(ctx context.Context, id uuid.UUID) (*User, error)
	SetTOTPSecret(ctx context.Context, id uuid.UUID, secret string) error
	UpdateMFAPreference(ctx context.Context, id uuid.UUID, preference string) error
	VerifyPhone(ctx context.Context, id uuid.UUID) error
	MarkKYCVerified(ctx context.Context, id uuid.UUID, referenceID, aadhaarHash, fullName, dob, gender string) error
	UpdateProfilePic(ctx context.Context, id uuid.UUID, url string) error
	UpdateBanner(ctx context.Context, id uuid.UUID, url string) error
}

////////////////////////////////////////////////////////////
//// SERVICE
////////////////////////////////////////////////////////////

type Service struct {
	repo     *Repository
	users    UserClient
	cfg      *config.Config
	redis    *redis.Client
	queue    *queue.Publisher
	webAuthn *webauthn.WebAuthn
}

func NewService(
	repo *Repository,
	users UserClient,
	r *redis.Client,
	cfg *config.Config,
	q *queue.Publisher,
) *Service {

	wconfig := &webauthn.Config{
		RPDisplayName: "Tarang",
		RPID:          "localhost",
		RPOrigins:     []string{"http://localhost:3000"},
	}

	wa, err := webauthn.New(wconfig)
	if err != nil {
		log.Fatalf("Failed to initialize WebAuthn: %v", err)
	}

	return &Service{
		repo:     repo,
		users:    users,
		redis:    r,
		cfg:      cfg,
		queue:    q,
		webAuthn: wa,
	}
}

////////////////////////////////////////////////////////////
//// USER DTOs
////////////////////////////////////////////////////////////

type User struct {
	ID            uuid.UUID
	Email         string
	Username      string
	Role          string
	Phone         string
	PhoneVerified bool
	KycVerified   bool
	MFAPreference string
	TOTPSecret    string
	FullName      string
	DOB           string
	Gender        string
	ProfilePicURL string
	BannerURL     string
}

type UserPassword struct {
	UserID     uuid.UUID
	Hash       string
	Algo       string
	ParamsJSON []byte
	CreatedAt  time.Time
}

////////////////////////////////////////////////////////////
//// USER LOOKUPS
////////////////////////////////////////////////////////////

func (s *Service) GetAccountByEmail(ctx context.Context, email string) (*Account, error) {
	return s.repo.GetAccountByEmail(ctx, email)
}

func (s *Service) GetAccountByUsername(ctx context.Context, username string) (*Account, error) {
	return s.repo.GetAccountByUsername(ctx, username)
}

func (s *Service) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	return s.users.GetByEmail(ctx, normalizeEmail(email))
}

func (s *Service) GetUserByID(ctx context.Context, id uuid.UUID) (*User, error) {
	return s.users.GetByID(ctx, id)
}

func (s *Service) GetProfile(ctx context.Context, userID uuid.UUID) (*User, error) {
	return s.users.GetByID(ctx, userID)
}

func (s *Service) SetUserTOTPSecret(ctx context.Context, id uuid.UUID, secret string) error {
	return s.users.SetTOTPSecret(ctx, id, secret)
}

func (s *Service) UpdateUserMFAPreference(ctx context.Context, id uuid.UUID, preference string) error {
	return s.users.UpdateMFAPreference(ctx, id, preference)
}

func (s *Service) GetUserByUsername(ctx context.Context, username string) (*User, error) {
	return s.users.GetByUsername(ctx, username)
}

func (s *Service) GetUserByPhone(ctx context.Context, phone string) (*User, error) {
	return s.users.GetByPhone(ctx, phone)
}

func (s *Service) GetUserByIdentifier(ctx context.Context, identifier string) (*User, error) {
	// Try email
	u, err := s.users.GetByEmail(ctx, normalizeEmail(identifier))
	if err == nil {
		return u, nil
	}
	// Try username
	return s.users.GetByUsername(ctx, identifier)
}

////////////////////////////////////////////////////////////
//// LOGIN SESSIONS
////////////////////////////////////////////////////////////

func (s *Service) CreateLoginSession(ctx context.Context, session *LoginSession) error {
	return s.repo.CreateLoginSession(ctx, session)
}

func (s *Service) GetLoginSessionByID(ctx context.Context, id uuid.UUID) (*LoginSession, error) {
	return s.repo.GetLoginSessionByID(ctx, id)
}

func (s *Service) DeleteLoginSession(ctx context.Context, id uuid.UUID) error {
	return s.repo.DeleteLoginSession(ctx, id)
}

////////////////////////////////////////////////////////////
//// REGISTRATION
////////////////////////////////////////////////////////////

func (s *Service) RegisterStart(ctx context.Context, email string) (*RegistrationSession, error) {
	email = normalizeEmail(email)

	// Check if already registered
	acc, _ := s.repo.GetAccountByEmail(ctx, email)
	if acc != nil {
		return nil, fmt.Errorf("email already registered")
	}

	session := &RegistrationSession{
		Email:     email,
		ExpiresAt: time.Now().Add(15 * time.Minute),
	}

	if err := s.repo.CreateRegistrationSession(ctx, session); err != nil {
		return nil, err
	}

	return session, nil
}

func (s *Service) SendRegistrationOTP(ctx context.Context, sessionID uuid.UUID) error {
	session, err := s.repo.GetRegistrationSessionByID(ctx, sessionID)
	if err != nil {
		return err
	}

	otp, err := s.GenerateOTP(ctx, "register_session_"+sessionID.String(), session.Email)
	if err != nil {
		return err
	}

	// We just publish OTP to RabbitMQ for now (which is out-of-band hash validation logic for Redis in GenerateOTP)
	// Actually, GenerateOTP puts the hash in Redis! So we don't necessarily need to store the hash in DB session unless we want to remove Redis reliance.
	// Since Redis GenerateOTP works well, we can stick to using the purpose as "register_session_{id}".
	job := queue.OTPJob{
		Email:   session.Email,
		Purpose: "register",
		Code:    otp,
	}

	return s.queue.PublishOTP(job)
}

func (s *Service) VerifyRegistrationOTP(ctx context.Context, sessionID uuid.UUID, code string) error {
	session, err := s.repo.GetRegistrationSessionByID(ctx, sessionID)
	if err != nil {
		return err
	}

	ok, err := s.VerifyOTP(ctx, "register_session_"+sessionID.String(), session.Email, code)
	if err != nil || !ok {
		return fmt.Errorf("invalid or expired OTP")
	}

	return s.repo.SetRegistrationSessionEmailVerified(ctx, sessionID)
}

func (s *Service) CompleteRegistrationSession(ctx context.Context, sessionID uuid.UUID, username, password, fullName, role string) (*Account, error) {
	session, err := s.repo.GetRegistrationSessionByID(ctx, sessionID)
	if err != nil {
		return nil, err
	}

	if !session.EmailVerified {
		return nil, fmt.Errorf("email not verified")
	}

	if session.ExpiresAt.Before(time.Now()) {
		return nil, fmt.Errorf("registration session expired")
	}

	hash, err := argon2id.CreateHash(password, argon2id.DefaultParams)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	acc := &Account{
		Username:        username,
		Email:           session.Email,
		PasswordHash:    hash,
		EmailVerifiedAt: &now,
	}

	if err := s.repo.CreateAccount(ctx, acc); err != nil {
		return nil, fmt.Errorf("username or email already taken")
	}

	// Also create Public Profile in user-service via gRPC
	u := &User{
		ID:       acc.ID, // CRITICAL: Sync IDs between services
		Email:    acc.Email,
		Username: acc.Username,
		FullName: fullName,
		Role:     role,
	}

	log.Printf("[Registration] Creating profile - ID: %s, Username: %s, FullName: %s, Role: %s", u.ID, u.Username, u.FullName, u.Role)
	if err := s.users.Create(ctx, u); err != nil {
		// Log the error and return it to prevent inconsistent registration state
		log.Printf("[Registration] Failed to create user profile in user-service: %v", err)
		return nil, fmt.Errorf("failed to create user profile: %v", err)
	}

	s.repo.DeleteRegistrationSession(ctx, sessionID)

	return acc, nil
}

func (s *Service) ResendOTP(ctx context.Context, purpose, target string) (string, error) {
	var u *User
	var errLookup error

	if purpose == "register" {
		// For registration, we expect target to be email
		u = &User{Email: normalizeEmail(target)}
	} else {
		// Only Email and Phone allowed for reset/resend
		if strings.Contains(target, "@") {
			u, errLookup = s.users.GetByEmail(ctx, normalizeEmail(target))
		} else {
			u, errLookup = s.users.GetByPhone(ctx, target)
		}

		if errLookup != nil || u == nil {
			return "", fmt.Errorf("user not found")
		}
	}

	finalTarget := target
	if u.Email != "" {
		finalTarget = u.Email
	} else if u.Phone != "" {
		finalTarget = u.Phone
	}

	otp, err := s.GenerateOTP(ctx, purpose, finalTarget)
	if err != nil {
		return "", err
	}

	job := queue.OTPJob{
		Purpose: purpose,
		Code:    otp,
		Email:   u.Email,
		Phone:   u.Phone,
	}

	if err := s.queue.PublishOTP(job); err != nil {
		return "", err
	}

	return finalTarget, nil
}

////////////////////////////////////////////////////////////
//// PASSWORD RESET
////////////////////////////////////////////////////////////

func (s *Service) StartPasswordReset(ctx context.Context, target string) (string, error) {
	var u *User
	var errLookup error

	if strings.Contains(target, "@") {
		// 1. Try Email
		u, errLookup = s.users.GetByEmail(ctx, normalizeEmail(target))
	} else {
		// 2. Try Phone (must be numeric)
		if _, err := strconv.ParseInt(target, 10, 64); err != nil {
			return "", fmt.Errorf("user not found")
		}
		u, errLookup = s.users.GetByPhone(ctx, target)
	}

	if errLookup != nil || u == nil {
		return "", fmt.Errorf("user not found")
	}

	finalTarget := target
	if u.Email != "" {
		finalTarget = u.Email
	} else if u.Phone != "" {
		finalTarget = u.Phone
	}

	otp, err := s.GenerateOTP(ctx, "password_reset", finalTarget)
	if err != nil {
		return "", err
	}

	job := queue.OTPJob{
		Purpose: "password_reset",
		Code:    otp,
		Email:   u.Email,
		Phone:   u.Phone,
	}

	if err := s.queue.PublishOTP(job); err != nil {
		return "", err
	}

	return finalTarget, nil
}

func (s *Service) ResetPassword(ctx context.Context, target, code, password string) error {

	ok, err := s.VerifyOTP(ctx, "password_reset", target, code)
	if err != nil || !ok {
		return fmt.Errorf("invalid or expired otp")
	}

	var acc *Account
	var errLookup error

	if strings.Contains(target, "@") {
		// 1. Try Email
		acc, errLookup = s.repo.GetAccountByEmail(ctx, target)
	} else {
		// 2. Try Phone
		// Since we don't have GetAccountByPhone, we might need a workaround. For now, fetch by username if not email or fetch user to get email?
		// Actually, target should be email. If phone, we need to map phone -> email, or phone -> account.
		// We'll trust the target format.
		// Wait, user-service GetByPhone returns `u`. Then we can lookup auth_db.
		u, errPhone := s.users.GetByPhone(ctx, target)
		if errPhone == nil {
			acc, errLookup = s.repo.GetAccountByEmail(ctx, u.Email)
		} else {
			return fmt.Errorf("user not found")
		}
	}

	if errLookup != nil || acc == nil {
		return fmt.Errorf("user not found")
	}

	hash, err := argon2id.CreateHash(password, argon2id.DefaultParams)
	if err != nil {
		return err
	}

	acc.PasswordHash = string(hash)
	// We can add a repo method to specifically update password or just update account
	err = s.repo.UpdateAccountPassword(ctx, acc.ID, acc.PasswordHash)
	return err
}

////////////////////////////////////////////////////////////
//// PHONE VERIFICATION
////////////////////////////////////////////////////////////

func (s *Service) StartPhoneVerification(ctx context.Context, userID uuid.UUID, phone string) (string, error) {

	otp, err := s.GenerateOTP(ctx, "verify_phone", phone)
	if err != nil {
		return "", err
	}

	job := queue.OTPJob{
		Phone:   phone,
		Purpose: "verify_phone",
		Code:    otp,
	}

	if err := s.queue.PublishOTP(job); err != nil {
		return "", err
	}
	return phone, nil
}

func (s *Service) VerifyPhone(ctx context.Context, userID uuid.UUID, phone, code string) error {

	ok, err := s.VerifyOTP(ctx, "verify_phone", phone, code)
	if err != nil || !ok {
		return fmt.Errorf("invalid or expired otp")
	}

	return s.users.VerifyPhone(ctx, userID)
}

func (s *Service) MarkKYCVerified(ctx context.Context, userID uuid.UUID, referenceID, hash, name, dob, gender string) error {
	return s.users.MarkKYCVerified(ctx, userID, referenceID, hash, name, dob, gender)
}

func (s *Service) UpdateProfilePic(ctx context.Context, userID uuid.UUID, url string) error {
	return s.users.UpdateProfilePic(ctx, userID, url)
}

func (s *Service) UpdateBanner(ctx context.Context, userID uuid.UUID, url string) error {
	return s.users.UpdateBanner(ctx, userID, url)
}

func (s *Service) StartLoginOTP(ctx context.Context, email string) (string, error) {
	otp, err := s.GenerateOTP(ctx, "login", email)
	if err != nil {
		return "", err
	}

	job := queue.OTPJob{
		Email:   email,
		Purpose: "login",
		Code:    otp,
	}

	if err := s.queue.PublishOTP(job); err != nil {
		return "", err
	}
	return email, nil
}

////////////////////////////////////////////////////////////
//// LOGIN RATE LIMIT
////////////////////////////////////////////////////////////

func (s *Service) CheckLoginAttempts(ctx context.Context, email string) error {
	// The INCR happens in RecordLoginFailure, we just check here.
	key := fmt.Sprintf("login:attempts:%s", email)
	count, _ := s.redis.Get(ctx, key).Int()
	if count >= 10 {
		return fmt.Errorf("too many login attempts")
	}
	return nil
}

func (s *Service) RecordLoginFailure(ctx context.Context, email string) {
	key := fmt.Sprintf("login:attempts:%s", email)
	count, _ := s.redis.Incr(ctx, key).Result()
	if count == 1 {
		s.redis.Expire(ctx, key, 10*time.Minute)
	}
}

func (s *Service) ClearLoginAttempts(ctx context.Context, email string) {

	// Leaving empty or decrementing logic here
	// key := fmt.Sprintf("login:attempts:%s", email)
	// Let it expire naturally to maintain distributed protections
}

////////////////////////////////////////////////////////////
//// ACCESS TOKENS
////////////////////////////////////////////////////////////

func (s *Service) CreateAccessJWT(userID uuid.UUID) (string, error) {

	now := time.Now()

	claims := jwt.MapClaims{
		"sub": userID.String(),
		"iat": now.Unix(),
		"exp": now.Add(AccessTTL).Unix(),
		"typ": "access",
		"jti": uuid.New().String(),
	}

	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return t.SignedString([]byte(s.cfg.JWTSecret))
}

func (s *Service) VerifyJWT(tokenString string) (uuid.UUID, bool, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.cfg.JWTSecret), nil
	})

	if err != nil {
		return uuid.Nil, false, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Check blacklist
		jti, _ := claims["jti"].(string)
		if jti != "" {
			blacklisted, _ := s.redis.Exists(context.Background(), "blacklist:jti:"+jti).Result()
			if blacklisted > 0 {
				return uuid.Nil, false, fmt.Errorf("token revoked")
			}
		}
		sub, ok := claims["sub"].(string)
		if !ok {
			return uuid.Nil, false, fmt.Errorf("invalid sub claim")
		}
		uid, err := uuid.Parse(sub)
		if err != nil {
			return uuid.Nil, false, fmt.Errorf("invalid user id in sub")
		}

		totpPending, _ := claims["totp_pending"].(bool)
		return uid, totpPending, nil
	}

	return uuid.Nil, false, fmt.Errorf("invalid token")
}

func (s *Service) CreateTempJWT(userID uuid.UUID) (string, error) {

	now := time.Now()

	claims := jwt.MapClaims{
		"sub":          userID.String(),
		"iat":          now.Unix(),
		"exp":          now.Add(15 * time.Minute).Unix(),
		"typ":          "access",
		"totp_pending": true,
		"jti":          uuid.New().String(),
	}

	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return t.SignedString([]byte(s.cfg.JWTSecret))
}

func (s *Service) Logout(ctx context.Context, tokenString string) error {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.cfg.JWTSecret), nil
	})
	if err != nil {
		return err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		jti, _ := claims["jti"].(string)
		exp, _ := claims["exp"].(float64)
		if jti != "" && exp > 0 {
			ttl := time.Until(time.Unix(int64(exp), 0))
			if ttl > 0 {
				return s.redis.Set(ctx, "blacklist:jti:"+jti, "1", ttl).Err()
			}
		}
	}
	return nil
}

////////////////////////////////////////////////////////////
//// REFRESH TOKENS
////////////////////////////////////////////////////////////

func (s *Service) GenerateRefreshToken(ctx context.Context, userID uuid.UUID, ttl time.Duration) (string, uuid.UUID, error) {

	raw, err := randBase32(32)
	if err != nil {
		return "", uuid.Nil, err
	}

	hash := sha256Bytes(raw)

	t := &UserToken{
		UserID:    userID,
		Kind:      TokenRefresh,
		TokenHash: hash,
		ExpiresAt: time.Now().Add(ttl),
	}

	if err := s.repo.CreateToken(ctx, t); err != nil {
		return "", uuid.Nil, err
	}

	return raw, t.ID, nil
}

func (s *Service) VerifyRefreshToken(ctx context.Context, raw string) (*UserToken, error) {

	hash := sha256Bytes(raw)

	return s.repo.GetValidTokenByHash(ctx, hash, TokenRefresh)
}

func (s *Service) RotateRefreshToken(ctx context.Context, old *UserToken) (string, uuid.UUID, time.Duration, error) {

	if err := s.repo.ConsumeToken(ctx, old.ID); err != nil {
		return "", uuid.Nil, 0, err
	}

	ttl := old.ExpiresAt.Sub(old.CreatedAt)
	if ttl <= 0 {
		ttl = RefreshTTL
	}

	raw, id, err := s.GenerateRefreshToken(ctx, old.UserID, ttl)
	return raw, id, ttl, err
}

////////////////////////////////////////////////////////////
//// OTP
////////////////////////////////////////////////////////////

func (s *Service) GenerateOTP(ctx context.Context, purpose, target string) (string, error) {

	email := normalizeEmail(target)

	// 1. Check 30-sec cooldown
	cooldownKey := fmt.Sprintf("otp:cooldown:%s:%s", purpose, email)
	cooldown, _ := s.redis.Exists(ctx, cooldownKey).Result()
	if cooldown > 0 {
		return "", fmt.Errorf("please wait 30 seconds before requesting another OTP")
	}

	// 2. Check 5 attempts in 5 mins limit
	limitKey := fmt.Sprintf("otp:limit:%s:%s", purpose, email)
	count, _ := s.redis.Get(ctx, limitKey).Int()
	if count >= 5 {
		return "", fmt.Errorf("maximum OTP attempts reached. please try again in 5 minutes")
	}

	val, err := rand.Int(rand.Reader, big.NewInt(1000000))
	if err != nil {
		return "", err
	}

	code := fmt.Sprintf("%06d", val.Int64())

	key := fmt.Sprintf("otp:%s:%s", purpose, email)

	if err := s.redis.Set(ctx, key, code, OTP_TTL).Err(); err != nil {
		return "", err
	}

	// Update limits
	s.redis.Set(ctx, cooldownKey, "1", 30*time.Second)
	newCount, _ := s.redis.Incr(ctx, limitKey).Result()
	if newCount == 1 {
		s.redis.Expire(ctx, limitKey, 5*time.Minute)
	}

	return code, nil
}

func (s *Service) VerifyOTP(ctx context.Context, purpose, target, code string) (bool, error) {

	key := fmt.Sprintf("otp:%s:%s", purpose, normalizeEmail(target))

	stored, err := s.redis.Get(ctx, key).Result()

	if err == redis.Nil {
		return false, fmt.Errorf("otp expired")
	}

	if err != nil {
		return false, err
	}

	if stored != code {
		return false, nil
	}

	deleted, err := s.redis.Del(ctx, key).Result()
	if err != nil {
		return false, err
	}
	if deleted == 0 {
		return false, fmt.Errorf("otp expired or already verified")
	}

	return true, nil
}

// PeekOTP checks whether the OTP is correct WITHOUT consuming/deleting it.
// This allows validating at step 2 while keeping the OTP usable at the final step.
func (s *Service) PeekOTP(ctx context.Context, purpose, target, code string) (bool, error) {

	key := fmt.Sprintf("otp:%s:%s", purpose, normalizeEmail(target))

	stored, err := s.redis.Get(ctx, key).Result()
	if err == redis.Nil {
		return false, fmt.Errorf("otp expired")
	}
	if err != nil {
		return false, err
	}

	return stored == code, nil
}

////////////////////////////////////////////////////////////
//// TOTP
////////////////////////////////////////////////////////////

func (s *Service) ValidateTOTP(secret, code string) bool {
	if secret == "" {
		log.Printf("[TOTP] Validation failed: secret is empty for code %s", code)
		return false
	}

	now := time.Now()
	valid, err := totp.ValidateCustom(code, secret, now, totp.ValidateOpts{
		Period: 30,
		Skew:   1,
		Digits: 6,
	})

	if !valid {
		maskedSecret := ""
		if len(secret) > 4 {
			maskedSecret = secret[:2] + "..." + secret[len(secret)-2:]
		}
		log.Printf("[TOTP] Validation FAILED: code=%s, time=%s, secret_len=%d, secret_masked=%s",
			code, now.Format(time.RFC3339), len(secret), maskedSecret)
		if err != nil {
			log.Printf("[TOTP] Validation error detail: %v", err)
		}
	} else {
		log.Printf("[TOTP] Validation SUCCESS: code=%s", code)
	}

	return valid
}

func (s *Service) GenerateTOTPSecret(email string) (string, string, error) {
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "Tarang",
		AccountName: email,
	})
	if err != nil {
		return "", "", err
	}
	return key.Secret(), key.URL(), nil
}

////////////////////////////////////////////////////////////
//// HELPERS
////////////////////////////////////////////////////////////

func randBase32(n int) (string, error) {

	b := make([]byte, n)

	if _, err := rand.Read(b); err != nil {
		return "", err
	}

	return base32.StdEncoding.
		WithPadding(base32.NoPadding).
		EncodeToString(b), nil
}

func sha256Bytes(s string) []byte {
	sum := sha256.Sum256([]byte(s))
	return sum[:]
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

////////////////////////////////////////////////////////////
//// ADMIN TOKENS & SUPER ADMIN
////////////////////////////////////////////////////////////

func (s *Service) ValidateAdminToken(ctx context.Context, token string, role string) bool {
	t, err := s.repo.GetAdminTokenByValue(ctx, token)
	if err != nil || t == nil {
		return false
	}
	if t.Role != role {
		return false
	}
	return true
}

func (s *Service) GetActiveAdminToken(ctx context.Context, role string) (string, error) {
	t, err := s.repo.GetActiveAdminToken(ctx, role)
	if err != nil {
		return "", err
	}
	return t.Token, nil
}

func (s *Service) SuperAdminLogin(ctx context.Context, password string) (string, error) {
	// For now, hardcode super password. In production, this should come from env: s.cfg.SuperAdminPassword
	superPassword := "tarang_super_123" 
	if password != superPassword {
		return "", fmt.Errorf("invalid super admin password")
	}

	now := time.Now()
	claims := jwt.MapClaims{
		"sub": uuid.Nil.String(),
		"iat": now.Unix(),
		"exp": now.Add(24 * time.Hour).Unix(),
		"typ": "super_access",
	}

	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(s.cfg.JWTSecret))
}

func (s *Service) SendAdminTokenEmail(ctx context.Context, email string) error {
	token, err := s.GetActiveAdminToken(ctx, "admin")
	if err != nil {
		return err
	}

	// Currently mock the email send via console log
	// In production, publish to RabbitMQ or use notification service
	log.Printf("[MOCK EMAIL] Sending Admin Token to %s: Link: /%s/admin", email, token)
	return nil
}

func (s *Service) GetAdminWebAuthnCredentials(ctx context.Context, role, identifier string) ([]AdminWebAuthnCredential, error) {
	return s.repo.GetAdminWebAuthnCredentials(ctx, role, identifier)
}
