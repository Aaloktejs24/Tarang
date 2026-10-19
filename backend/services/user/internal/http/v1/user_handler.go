package v1

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"backend/services/user/internal/user"
	"backend/shared/s3"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type UserHandler struct {
	svc *user.Service
	s3  *s3.S3Client
}

func NewUserHandler(s *user.Service, s3Client *s3.S3Client) *UserHandler {
	return &UserHandler{svc: s, s3: s3Client}
}

func (h *UserHandler) RegisterRoutes(r chi.Router) {
	r.Get("/profile", h.getProfile)
	r.Get("/s3/sign", h.getUploadUrl)
	r.Post("/profile/update-pic", h.updateProfilePic)
	r.Post("/profile/update-banner", h.updateBanner)
	r.Post("/profile/update-bio", h.updateBio)
	r.Post("/profile/update", h.updateProfile)
	r.Get("/public/profile/{username}", h.getPublicProfile)
	r.Get("/public/institutes", h.getInstitutes)
}

func (h *UserHandler) extractUserID(r *http.Request) (uuid.UUID, bool, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return uuid.Nil, false, fmt.Errorf("missing authorization header")
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return uuid.Nil, false, fmt.Errorf("invalid authorization header format")
	}

	token := parts[1]
	uid, totpPending, err := h.svc.VerifyJWT(token)
	if err != nil {
		return uuid.Nil, false, err
	}

	return uid, totpPending, nil
}

func (h *UserHandler) getProfile(w http.ResponseWriter, r *http.Request) {
	uid, _, err := h.extractUserID(r)
	if err != nil {
		fmt.Printf("[UserHandler] Token verification failed in getProfile: %v\n", err)
		respondError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	fmt.Printf("[UserHandler] Fetching profile for UID: %s\n", uid)
	u, err := h.svc.GetByID(r.Context(), uid)
	if err != nil {
		fmt.Printf("[UserHandler] User not found by ID %s in getProfile: %v\n", uid, err)
		respondError(w, http.StatusNotFound, "user not found")
		return
	}

	// Map user model fields back to response payload mapping from Auth service
	// The auth service response expects certain boolean flags.
	phone := ""
	if u.Phone != nil {
		phone = *u.Phone
	}

	fullName := ""
	if u.FullName != nil {
		fullName = *u.FullName
	}

	dob := ""
	if u.DOB != nil {
		dob = *u.DOB
	}

	gender := ""
	if u.Gender != nil {
		gender = *u.Gender
	}

	profilePic := ""
	if u.ProfilePicURL != nil {
		profilePic = *u.ProfilePicURL
	}
	banner := ""
	if u.BannerURL != nil {
		banner = *u.BannerURL
	}
	bio := ""
	if u.Bio != nil {
		bio = *u.Bio
	}

	resp := map[string]any{
		"id":             u.ID,
		"email":          u.Email,
		"username":       u.Username,
		"role":           u.Role,
		"phone":          phone,
		"phone_verified": u.PhoneVerifiedAt != nil,
		"kyc_verified":   u.KycVerifiedAt != nil,
		"kyc_status":     h.getKycStatus(u),
		"mfa_preference": u.MFAPreference,
		"full_name":      fullName,
		"dob":            dob,
		"gender":         gender,
		"profile_pic_url": profilePic,
		"banner_url":      banner,
		"bio":             bio,
		"social_links":    u.SocialLinks,
		"skills":          u.Skills,
		"recognitions":    u.Recognitions,
		"location":        u.Location,
		"languages":       u.Languages,
		"demographic":     u.Demographic,
		"institution_name": u.InstitutionName,
	}

	bucket := "tarang-user-service"
	// Generate signed URLs if they exist
	if profilePic != "" {
		if key := h.getS3KeyFromURL(profilePic); key != "" {
			if signed, err := h.s3.GenerateDownloadURL(r.Context(), bucket, key, 1*time.Hour); err == nil {
				resp["profile_pic_url"] = signed
			}
		}
	}
	if banner != "" {
		if key := h.getS3KeyFromURL(banner); key != "" {
			if signed, err := h.s3.GenerateDownloadURL(r.Context(), bucket, key, 1*time.Hour); err == nil {
				resp["banner_url"] = signed
			}
		}
	}

	respondJSON(w, http.StatusOK, resp)
}

func (h *UserHandler) getPublicProfile(w http.ResponseWriter, r *http.Request) {
	username := chi.URLParam(r, "username")
	if username == "" {
		respondError(w, http.StatusBadRequest, "username is required")
		return
	}

	u, err := h.svc.GetByUsername(r.Context(), username)
	if err != nil {
		respondError(w, http.StatusNotFound, "user not found")
		return
	}

	// Sanitize output for public viewing
	fullName := ""
	if u.FullName != nil {
		fullName = *u.FullName
	}

	profilePic := ""
	if u.ProfilePicURL != nil {
		profilePic = *u.ProfilePicURL
	}
	banner := ""
	if u.BannerURL != nil {
		banner = *u.BannerURL
	}
	bio := ""
	if u.Bio != nil {
		bio = *u.Bio
	}

	resp := map[string]any{
		"id":              u.ID,
		"username":        u.Username,
		"role":            u.Role,
		"kyc_verified":    u.KycVerifiedAt != nil,
		"kyc_status":      h.getKycStatus(u),
		"full_name":       fullName,
		"profile_pic_url": profilePic,
		"banner_url":      banner,
		"bio":             bio,
		"social_links":    u.SocialLinks,
		"skills":          u.Skills,
		"recognitions":    u.Recognitions,
		"location":        u.Location,
		"languages":       u.Languages,
		"demographic":     u.Demographic,
	}

	bucket := "tarang-user-service"
	// Generate signed URLs for public access (images are private in S3)
	if profilePic != "" {
		if key := h.getS3KeyFromURL(profilePic); key != "" {
			if signed, err := h.s3.GenerateDownloadURL(r.Context(), bucket, key, 1*time.Hour); err == nil {
				resp["profile_pic_url"] = signed
			}
		}
	}
	if banner != "" {
		if key := h.getS3KeyFromURL(banner); key != "" {
			if signed, err := h.s3.GenerateDownloadURL(r.Context(), bucket, key, 1*time.Hour); err == nil {
				resp["banner_url"] = signed
			}
		}
	}

	respondJSON(w, http.StatusOK, resp)
}

func (h *UserHandler) getUploadUrl(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	uidStr := r.URL.Query().Get("user_id")
	fileType := r.URL.Query().Get("type") // "profile" or "banner"
	mimeType := r.URL.Query().Get("mime") // "image/jpeg", etc.

	fmt.Printf("DEBUG: getUploadUrl - user_id: %s, type: %s, mime: %s\n", uidStr, fileType, mimeType)

	if uidStr == "" || fileType == "" || mimeType == "" {
		respondError(w, http.StatusBadRequest, "user_id, type, and mime are required")
		return
	}

	// Security: Validate mime type
	allowedMime := map[string]string{
		"image/jpeg":      ".jpg",
		"image/png":       ".png",
		"image/webp":      ".webp",
		"application/pdf": ".pdf",
	}
	ext, ok := allowedMime[mimeType]
	if !ok {
		respondError(w, http.StatusBadRequest, "unsupported file type")
		return
	}

	fileName := fmt.Sprintf("users/%s/%s/current%s", uidStr, fileType, ext)
	bucket := "tarang-user-service"

	url, err := h.s3.GenerateUploadURL(ctx, bucket, fileName, 15*time.Minute)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to generate upload url")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"upload_url": url,
		"file_url":   fmt.Sprintf("https://%s.s3.ap-south-1.amazonaws.com/%s", bucket, fileName),
	})
}

func (h *UserHandler) updateProfilePic(w http.ResponseWriter, r *http.Request) {
	var in struct {
		UserID string `json:"user_id"`
		URL    string `json:"url"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	fmt.Printf("DEBUG: updateProfilePic - user_id: %s, url: %s\n", in.UserID, in.URL)


	uid, err := uuid.Parse(in.UserID)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid user id")
		return
	}

	if err := h.svc.UpdateProfilePic(r.Context(), uid, in.URL); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update profile pic")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "profile pic updated"})
}

func (h *UserHandler) updateBanner(w http.ResponseWriter, r *http.Request) {
	var in struct {
		UserID string `json:"user_id"`
		URL    string `json:"url"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	fmt.Printf("DEBUG: updateBanner - user_id: %s, url: %s\n", in.UserID, in.URL)


	uid, err := uuid.Parse(in.UserID)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid user id")
		return
	}

	if err := h.svc.UpdateBanner(r.Context(), uid, in.URL); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update banner")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "banner updated"})
}

func (h *UserHandler) updateBio(w http.ResponseWriter, r *http.Request) {
	var in struct {
		UserID string `json:"user_id"`
		Bio    string `json:"bio"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	uid, err := uuid.Parse(in.UserID)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid user id")
		return
	}

	if err := h.svc.UpdateBio(r.Context(), uid, in.Bio); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to update bio")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "bio updated"})
}

func (h *UserHandler) updateProfile(w http.ResponseWriter, r *http.Request) {
	var in struct {
		UserID       string            `json:"user_id"`
		Bio          string            `json:"bio"`
		SocialLinks  map[string]string `json:"social_links"`
		Skills       []string          `json:"skills"`
		Recognitions []string          `json:"recognitions"`
		FullName     string            `json:"full_name"`
		DOB          string            `json:"dob"`
		Gender       string            `json:"gender"`
		Location         string                 `json:"location"`
		Languages        []string               `json:"languages"`
		Demographic      string                 `json:"demographic"`
		InstitutionName  string                 `json:"institution_name"`
		InstituteProfile *user.InstituteProfile `json:"institute_profile"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	uid, err := uuid.Parse(in.UserID)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid user id")
		return
	}

	if err := h.svc.UpdateProfile(r.Context(), uid, in.FullName, in.DOB, in.Gender, in.Bio, in.SocialLinks, in.Skills, in.Recognitions, in.Location, in.Languages, in.Demographic, in.InstitutionName, in.InstituteProfile); err != nil {
		fmt.Printf("[UserHandler] UpdateProfile error: %v\n", err)
		respondError(w, http.StatusInternalServerError, "failed to update profile")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "profile updated"})
}
func (h *UserHandler) getS3KeyFromURL(fileURL string) string {
	parts := strings.Split(fileURL, ".amazonaws.com/")
	if len(parts) < 2 {
		return ""
	}
	return parts[1]
}

func (h *UserHandler) getKycStatus(u *user.User) string {
	if u.KycVerifiedAt != nil {
		return "verified"
	}
	return "none"
}

func (h *UserHandler) getInstitutes(w http.ResponseWriter, r *http.Request) {
	limit := 50
	offset := 0

	if l := r.URL.Query().Get("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}
	if o := r.URL.Query().Get("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	users, err := h.svc.GetInstitutes(r.Context(), limit, offset)
	if err != nil {
		fmt.Printf("[UserHandler] GetInstitutes error: %v\n", err)
		respondError(w, http.StatusInternalServerError, "failed to fetch institutes")
		return
	}

	var results []map[string]any
	bucket := "tarang-user-service"
	for _, u := range users {
		fullName := ""
		if u.FullName != nil {
			fullName = *u.FullName
		}
		profilePic := ""
		if u.ProfilePicURL != nil {
			profilePic = *u.ProfilePicURL
			if key := h.getS3KeyFromURL(profilePic); key != "" {
				if signed, err := h.s3.GenerateDownloadURL(r.Context(), bucket, key, 1*time.Hour); err == nil {
					profilePic = signed
				}
			}
		}

		banner := ""
		if u.BannerURL != nil {
			banner = *u.BannerURL
			if key := h.getS3KeyFromURL(banner); key != "" {
				if signed, err := h.s3.GenerateDownloadURL(r.Context(), bucket, key, 1*time.Hour); err == nil {
					banner = signed
				}
			}
		}

		results = append(results, map[string]any{
			"id":                u.ID,
			"username":          u.Username,
			"email":             u.Email,
			"full_name":         fullName,
			"profile_pic_url":   profilePic,
			"banner_url":        banner,
			"location":          u.Location,
			"languages":         u.Languages,
			"demographic":       u.Demographic,
			"bio":               u.Bio,
			"recognitions":      u.Recognitions,
			"institution_name":  u.InstitutionName,
			"institute_profile": u.InstituteProfile,
		})
	}

	// Make sure we return an empty array instead of null if no results
	if results == nil {
		results = []map[string]any{}
	}

	respondJSON(w, http.StatusOK, results)
}
