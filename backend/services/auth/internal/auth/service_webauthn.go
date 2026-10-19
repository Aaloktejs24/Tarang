package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"time"
	"net/http"

	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/go-webauthn/webauthn/protocol"
	"github.com/google/uuid"
	"github.com/golang-jwt/jwt/v5"
)

// Session Management

func (s *Service) SaveWebAuthnSession(ctx context.Context, sessionID string, sessionData *webauthn.SessionData) error {
	data, err := json.Marshal(sessionData)
	if err != nil {
		return err
	}
	return s.redis.Set(ctx, "webauthn_session:"+sessionID, data, 5*time.Minute).Err()
}

func (s *Service) GetWebAuthnSession(ctx context.Context, sessionID string) (*webauthn.SessionData, error) {
	data, err := s.redis.Get(ctx, "webauthn_session:"+sessionID).Bytes()
	if err != nil {
		return nil, err
	}
	var sessionData webauthn.SessionData
	if err := json.Unmarshal(data, &sessionData); err != nil {
		return nil, err
	}
	return &sessionData, nil
}

func (s *Service) DeleteWebAuthnSession(ctx context.Context, sessionID string) error {
	return s.redis.Del(ctx, "webauthn_session:"+sessionID).Err()
}

// Helper to get or create AdminWebAuthnUser
func (s *Service) GetAdminWebAuthnUser(ctx context.Context, role, identifier string) (*AdminWebAuthnUser, error) {
	creds, err := s.repo.GetAdminWebAuthnCredentials(ctx, role, identifier)
	if err != nil {
		return nil, err
	}
	return &AdminWebAuthnUser{
		Role:        role,
		Identifier:  identifier,
		Credentials: creds,
	}, nil
}

// Registration

func (s *Service) BeginAdminWebAuthnRegistration(ctx context.Context, role, identifier string) (*protocol.CredentialCreation, string, error) {
	user, err := s.GetAdminWebAuthnUser(ctx, role, identifier)
	if err != nil {
		return nil, "", err
	}

	options, sessionData, err := s.webAuthn.BeginRegistration(user)
	if err != nil {
		return nil, "", err
	}

	sessionID := uuid.New().String()
	if err := s.SaveWebAuthnSession(ctx, sessionID, sessionData); err != nil {
		return nil, "", err
	}

	return options, sessionID, nil
}

func (s *Service) FinishAdminWebAuthnRegistration(ctx context.Context, role, identifier, sessionID string, req *http.Request) error {
	user, err := s.GetAdminWebAuthnUser(ctx, role, identifier)
	if err != nil {
		return err
	}

	sessionData, err := s.GetWebAuthnSession(ctx, sessionID)
	if err != nil {
		return fmt.Errorf("invalid or expired session")
	}

	// Parse credential from request
	credential, err := s.webAuthn.FinishRegistration(user, *sessionData, req)
	if err != nil {
		return err
	}

	// Save to DB
	cred := &AdminWebAuthnCredential{
		Role:            role,
		Identifier:      identifier,
		CredentialID:    credential.ID,
		PublicKey:       credential.PublicKey,
		AttestationType: credential.AttestationType,
		SignCount:       credential.Authenticator.SignCount,
		AAGUID:          credential.Authenticator.AAGUID,
		BackupEligible:  credential.Flags.BackupEligible,
		BackupState:     credential.Flags.BackupState,
	}

	if err := s.repo.SaveAdminWebAuthnCredential(ctx, cred); err != nil {
		return err
	}

	_ = s.DeleteWebAuthnSession(ctx, sessionID)
	return nil
}

// Login

func (s *Service) BeginAdminWebAuthnLogin(ctx context.Context, role, identifier string) (*protocol.CredentialAssertion, string, error) {
	user, err := s.GetAdminWebAuthnUser(ctx, role, identifier)
	if err != nil {
		return nil, "", err
	}

	// If the user has no credentials, they cannot log in via WebAuthn
	if len(user.Credentials) == 0 {
		return nil, "", fmt.Errorf("no biometric credentials found for user")
	}

	options, sessionData, err := s.webAuthn.BeginLogin(user)
	if err != nil {
		return nil, "", err
	}

	sessionID := uuid.New().String()
	if err := s.SaveWebAuthnSession(ctx, sessionID, sessionData); err != nil {
		return nil, "", err
	}

	return options, sessionID, nil
}

func (s *Service) FinishAdminWebAuthnLogin(ctx context.Context, role, identifier, sessionID string, req *http.Request) (string, error) {
	user, err := s.GetAdminWebAuthnUser(ctx, role, identifier)
	if err != nil {
		return "", err
	}

	sessionData, err := s.GetWebAuthnSession(ctx, sessionID)
	if err != nil {
		return "", fmt.Errorf("invalid or expired session")
	}

	credential, err := s.webAuthn.FinishLogin(user, *sessionData, req)
	if err != nil {
		return "", err
	}

	// Update sign count
	if err := s.repo.UpdateAdminWebAuthnCredentialSignCount(ctx, credential.ID, credential.Authenticator.SignCount); err != nil {
		// Log error but continue
		fmt.Printf("Warning: failed to update sign count: %v\n", err)
	}

	_ = s.DeleteWebAuthnSession(ctx, sessionID)

	// Issue the actual JWT based on role
	now := time.Now()
	var typ string
	if role == "super_admin" {
		typ = "super_access"
	} else {
		typ = "admin_access" // Assuming this is how admins are handled, or standard user token
	}

	claims := jwt.MapClaims{
		"sub": uuid.Nil.String(), // We don't have UUIDs for super_admin yet
		"iat": now.Unix(),
		"exp": now.Add(24 * time.Hour).Unix(),
		"typ": typ,
		"role": role,
		"identifier": identifier,
	}

	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(s.cfg.JWTSecret))
}
