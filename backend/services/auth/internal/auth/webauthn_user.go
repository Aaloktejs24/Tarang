package auth

import (


	"github.com/go-webauthn/webauthn/webauthn"
)

type AdminWebAuthnUser struct {
	Role        string
	Identifier  string
	Credentials []AdminWebAuthnCredential
}

// WebAuthnID returns the user's ID
func (u *AdminWebAuthnUser) WebAuthnID() []byte {
	// A simple deterministic ID based on role and identifier
	id := u.Role + ":" + u.Identifier
	return []byte(id)
}

// WebAuthnName returns the user's username
func (u *AdminWebAuthnUser) WebAuthnName() string {
	return u.Identifier
}

// WebAuthnDisplayName returns the user's display name
func (u *AdminWebAuthnUser) WebAuthnDisplayName() string {
	return u.Identifier
}

// WebAuthnIcon is not (yet) implemented
func (u *AdminWebAuthnUser) WebAuthnIcon() string {
	return ""
}

// WebAuthnCredentials returns credentials owned by the user
func (u *AdminWebAuthnUser) WebAuthnCredentials() []webauthn.Credential {
	var creds []webauthn.Credential
	for _, c := range u.Credentials {
		creds = append(creds, webauthn.Credential{
			ID:              c.CredentialID,
			PublicKey:       c.PublicKey,
			AttestationType: c.AttestationType,
			Authenticator: webauthn.Authenticator{
				AAGUID:       c.AAGUID,
				SignCount:    c.SignCount,
				CloneWarning: false,
			},
			Flags: webauthn.CredentialFlags{
				BackupEligible: c.BackupEligible,
				BackupState:    c.BackupState,
			},
		})
	}
	return creds
}
