package user

import (
	"time"
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
	// user.DOB handled separately if time.Time
	user.Gender = &gender

	return s.repo.UpdateKYC(ctx, user)
}

func NewService(repo *Repository, cfg *config.Config, redis *redis.Client) *Service {
	return &Service{repo: repo, cfg: cfg, redis: redis}
}

//////////////////////////////////////////////////////
// gRPC HELPERS
//////////////////////////////////////////////////////





func (s *Service) Create(ctx context.Context, idStr string, username, fullName, role, phone, dob, gender string) (*User, error) {
	log.Printf("Service Create: Username=%s, Role=%s", username, role)
	user := &User{
		
		Username: username,
		Role:     role,
	}

	if fullName != "" {
		user.FullName = &fullName
	}

	if phone != "" {
		user.Phone = &phone
	}

	if dob != "" {
		t, err := time.Parse("2006-01-02", dob)
		if err == nil {
			user.DOB = &t
		} else {
			log.Printf("[Service] Create WARNING: invalid dob format: '%s'", dob)
		}
	}

	if gender != "" {
		user.Gender = &gender
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









//////////////////////////////////////////////////////
// PHONE VERIFY
//////////////////////////////////////////////////////



//////////////////////////////////////////////////////
// EMAIL VERIFY
//////////////////////////////////////////////////////



//////////////////////////////////////////////////////
// TOTP
//////////////////////////////////////////////////////





//////////////////////////////////////////////////////
// ADMIN USER CONTROL
//////////////////////////////////////////////////////







func (s *Service) UpdateProfilePic(ctx context.Context, userID uuid.UUID, url string) error {
	return s.repo.SetProfilePic(ctx, userID, url)
}

func (s *Service) UpdateBanner(ctx context.Context, userID uuid.UUID, url string) error {
	return s.repo.SetBanner(ctx, userID, url)
}

func (s *Service) UpdateBio(ctx context.Context, userID uuid.UUID, bio string) error {
	return s.repo.SetBio(ctx, userID, bio)
}

func (s *Service) UpdateProfile(ctx context.Context, userID uuid.UUID, fullName, dob, gender, bio string, socialLinks map[string]string, skills, recognitions []string, location string, languages []string, demographic string, institutionName string, instProfile *InstituteProfileInput) error {
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
		parsedDOB, _ := time.Parse("2006-01-02", dob)
		u.DOB = &parsedDOB
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

	if instProfile != nil {
		if err := s.repo.UpsertInstituteProfile(ctx, userID, instProfile, u.InstitutionName); err != nil {
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

func (s *Service) CreateInstitute(ctx context.Context, name, instituteType string, establishedYear int, ownerID uuid.UUID) (*Institute, error) {
	i := &Institute{
		ID:              uuid.New(),
		Name:            name,
		InstituteType:   &instituteType,
		EstablishedYear: &establishedYear,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	err := s.repo.CreateInstitute(ctx, i, ownerID)
	if err != nil {
		return nil, err
	}
	return i, nil
}

func (s *Service) GetInstitute(ctx context.Context, id uuid.UUID) (*Institute, error) {
	return s.repo.GetInstitute(ctx, id)
}
