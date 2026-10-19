package user

import (
	"context"
	"fmt"
	"log"

	"backend/shared/config"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type Service struct {
	repo  *Repository
	cfg   *config.Config
	redis *redis.Client
}

func (s *Service) MarkKYCVerified(ctx context.Context, userID uuid.UUID, referenceID, aadhaarHash, fullName, dob, gender string) error {
	user, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return err
	}

	user.KycReferenceID = &referenceID
	user.AadhaarHash = &aadhaarHash
	user.FullName = &fullName
	user.DOB = &dob
	user.Gender = &gender

	return s.repo.UpdateKYC(ctx, user)
}

func NewService(repo *Repository, cfg *config.Config, redis *redis.Client) *Service {
	return &Service{repo: repo, cfg: cfg, redis: redis}
}

//////////////////////////////////////////////////////
// gRPC HELPERS
//////////////////////////////////////////////////////

func (s *Service) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	return s.repo.ExistsByEmail(ctx, email)
}

func (s *Service) GetByEmail(ctx context.Context, email string) (*User, error) {
	return s.repo.GetByEmail(ctx, email)
}

func (s *Service) Create(ctx context.Context, idStr string, email, username, fullName, role string) (*User, error) {
	log.Printf("Service Create: Email=%s, Username=%s, Role=%s", email, username, role)
	user := &User{
		Email:    email,
		Username: username,
		Role:     role,
	}

	if fullName != "" {
		user.FullName = &fullName
	}

	if user.Role == "" {
		user.Role = "none"
	}

	parsedID, err := uuid.Parse(idStr)
	if err != nil || parsedID == uuid.Nil {
		log.Printf("[Service] Create ERROR: missing or invalid user id: '%s'", idStr)
		return nil, fmt.Errorf("missing or invalid user id")
	}
	user.ID = parsedID

	if err := s.repo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *Service) GetByID(ctx context.Context, id uuid.UUID) (*User, error) {
	return s.repo.GetByID(ctx, id)
}



func (s *Service) GetByUsername(ctx context.Context, username string) (*User, error) {
	return s.repo.GetByUsername(ctx, username)
}

func (s *Service) GetByPhone(ctx context.Context, phone string) (*User, error) {
	return s.repo.GetByPhone(ctx, phone)
}

func (s *Service) GetUserByEmailOrUsername(ctx context.Context, identifier string) (*User, error) {
	user, err := s.repo.GetByEmail(ctx, identifier)
	if err == nil {
		return user, nil
	}
	return s.repo.GetByUsername(ctx, identifier)
}

func (s *Service) GetUserByEmailOrPhone(ctx context.Context, identifier string) (*User, error) {
	user, err := s.repo.GetByEmail(ctx, identifier)
	if err == nil {
		return user, nil
	}
	return s.repo.GetByPhone(ctx, identifier)
}



//////////////////////////////////////////////////////
// PHONE VERIFY
//////////////////////////////////////////////////////

func (s *Service) VerifyPhone(ctx context.Context, userID string) error {
	id, err := uuid.Parse(userID)
	if err != nil {
		return err
	}
	return s.repo.SetPhoneVerified(ctx, id)
}

//////////////////////////////////////////////////////
// EMAIL VERIFY
//////////////////////////////////////////////////////

func (s *Service) VerifyEmail(ctx context.Context, userID string) error {

	id, err := uuid.Parse(userID)
	if err != nil {
		return err
	}

	return s.repo.SetEmailVerified(ctx, id)
}

//////////////////////////////////////////////////////
// TOTP
//////////////////////////////////////////////////////

func (s *Service) EnableTOTP(ctx context.Context, userID string, secret string) error {

	id, err := uuid.Parse(userID)
	if err != nil {
		return err
	}

	if err := s.repo.SetTOTPSecret(ctx, id, secret); err != nil {
		return err
	}
	return s.repo.SetMFAPreference(ctx, id, "totp")
}

func (s *Service) DisableTOTP(ctx context.Context, userID string) error {

	id, err := uuid.Parse(userID)
	if err != nil {
		return err
	}

	if err := s.repo.SetTOTPSecret(ctx, id, ""); err != nil {
		return err
	}
	return s.repo.SetMFAPreference(ctx, id, "none")
}

//////////////////////////////////////////////////////
// ADMIN USER CONTROL
//////////////////////////////////////////////////////

func (s *Service) DisableUser(ctx context.Context, userID string) error {

	id, err := uuid.Parse(userID)
	if err != nil {
		return err
	}

	return s.repo.SetDisabled(ctx, id, true)
}

func (s *Service) EnableUser(ctx context.Context, userID string) error {

	id, err := uuid.Parse(userID)
	if err != nil {
		return err
	}

	return s.repo.SetDisabled(ctx, id, false)
}



func (s *Service) UpdateMFAPreference(ctx context.Context, id uuid.UUID, preference string) error {
	return s.repo.SetMFAPreference(ctx, id, preference)
}

func (s *Service) SetTOTPSecret(ctx context.Context, id uuid.UUID, secret string) error {
	return s.repo.SetTOTPSecret(ctx, id, secret)
}

func (s *Service) UpdateProfilePic(ctx context.Context, userID uuid.UUID, url string) error {
	return s.repo.SetProfilePic(ctx, userID, url)
}

func (s *Service) UpdateBanner(ctx context.Context, userID uuid.UUID, url string) error {
	return s.repo.SetBanner(ctx, userID, url)
}

func (s *Service) UpdateBio(ctx context.Context, userID uuid.UUID, bio string) error {
	return s.repo.SetBio(ctx, userID, bio)
}

func (s *Service) UpdateProfile(ctx context.Context, userID uuid.UUID, fullName, dob, gender, bio string, socialLinks map[string]string, skills, recognitions []string, location string, languages []string, demographic string, institutionName string, instituteProfile *InstituteProfile) error {
	u, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return err
	}

	if fullName != "" {
		u.FullName = &fullName
	}
	if institutionName != "" {
		u.InstitutionName = &institutionName
	}
	if dob != "" {
		u.DOB = &dob
	}
	if gender != "" {
		u.Gender = &gender
	}
	if bio != "" {
		u.Bio = &bio
	}
	if socialLinks != nil {
		u.SocialLinks = socialLinks
	}
	if skills != nil {
		u.Skills = skills
	}
	if recognitions != nil {
		u.Recognitions = recognitions
	}
	if location != "" {
		u.Location = &location
	}
	if languages != nil {
		u.Languages = languages
	}
	if demographic != "" {
		u.Demographic = &demographic
	}

	if err := s.repo.UpdateProfile(ctx, u); err != nil {
		return err
	}

	if instituteProfile != nil && (u.Role == "organisation" || u.Role == "institute") {
		instituteProfile.UserID = u.ID
		if err := s.repo.UpsertInstituteProfile(ctx, instituteProfile); err != nil {
			return err
		}
	}

	return nil
}

func (s *Service) UpdateInstitution(ctx context.Context, userID uuid.UUID, institutionName string) error {
	u, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return err
	}

	if institutionName != "" {
		u.InstitutionName = &institutionName
	}

	return s.repo.UpdateProfile(ctx, u)
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

func (s *Service) GetInstitutes(ctx context.Context, limit, offset int) ([]*User, error) {
	return s.repo.GetInstitutes(ctx, limit, offset)
}
