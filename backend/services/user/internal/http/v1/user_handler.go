package v1

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"backend/services/user/internal/user"
	"backend/shared/config"
	"backend/shared/errors"
	"backend/shared/storage"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type UserHandler struct {
	svc   *user.Service
	minio *storage.MinioClient
	cfg   *config.Config
}

func NewUserHandler(s *user.Service, minioClient *storage.MinioClient, cfg *config.Config) *UserHandler {
	return &UserHandler{svc: s, minio: minioClient, cfg: cfg}
}

func (h *UserHandler) RegisterRoutes(r chi.Router) {
	r.Get("/profile", h.getProfile)
	r.Get("/s3/sign", h.getUploadUrl)
	r.Get("/s3/get", h.getDownloadUrl)
	r.Post("/s3/delete", h.deleteFiles)
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
		respondError(w, http.StatusUnauthorized, errors.ErrUnauthorized)
		return
	}

	fmt.Printf("[UserHandler] Fetching profile for UID: %s\n", uid)
	u, err := h.svc.GetByID(r.Context(), uid)
	if err != nil {
		fmt.Printf("[UserHandler] User not found by ID %s in getProfile: %v\n", uid, err)
		respondError(w, http.StatusNotFound, errors.ErrUserNotFound)
		return
	}

	// Map user model fields back to response payload mapping from Auth service
	// The auth service response expects certain boolean flags.

	fullName := ""
	if u.FullName != nil {
		fullName = *u.FullName
	}

	dob := ""
	if u.DOB != nil {
		dob = u.DOB.Format("2006-01-02")
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

	location := ""
	if u.Location != nil {
		location = *u.Location
	}
	demographic := ""
	if u.Demographic != nil {
		demographic = *u.Demographic
	}

	isCompleted := fullName != "" && bio != "" && location != "" && len(u.Languages) > 0 && demographic != ""

	resp := map[string]any{
		"id":                   u.ID,
		"username":             u.Username,
		"email":                u.Email,
		"role":                 u.Role,
		"kyc_verified":         u.KycVerifiedAt != nil,
		"kyc_status":           h.getKycStatus(u),
		"full_name":            fullName,
		"dob":                  dob,
		"gender":               gender,
		"phone":                u.Phone,
		"religion":             u.Religion,
		"caste":                u.Caste,
		"subcaste":             u.Subcaste,
		"nationality":          u.Nationality,
		"profile_pic_url":      profilePic,
		"banner_url":           banner,
		"bio":                  bio,
		"social_links":         u.SocialLinks,
		"skills":               u.Skills,
		"recognitions":         u.Recognitions,
		"primary_name":         u.PrimaryName,
		"secondary_name":       u.SecondaryName,
		"is_profile_completed": isCompleted,
		"location":             u.Location,
		"languages":            u.Languages,
		"demographic":          u.Demographic,
		"institute_profile":    u.InstituteProfile,
		"addresses":            u.Addresses,
		"academic_records":     u.AcademicRecords,
	}

	bucket := "tarang-user-service"
	// Generate signed URLs if they exist
	if profilePic != "" {
		if key := h.getStorageKeyFromURL(profilePic); key != "" {
			if signed, err := h.minio.GenerateDownloadURL(r.Context(), bucket, key, 1*time.Hour); err == nil {
				resp["profile_pic_url"] = signed
			}
		}
	}
	if banner != "" {
		if key := h.getStorageKeyFromURL(banner); key != "" {
			if signed, err := h.minio.GenerateDownloadURL(r.Context(), bucket, key, 1*time.Hour); err == nil {
				resp["banner_url"] = signed
			}
		}
	}
	if u.InstituteProfile != nil {
		ip := *u.InstituteProfile
		if ip.LogoURL != "" {
			if key := h.getStorageKeyFromURL(ip.LogoURL); key != "" {
				if signed, err := h.minio.GenerateDownloadURL(r.Context(), bucket, key, 1*time.Hour); err == nil {
					ip.LogoURL = signed
				}
			}
		}
		if ip.BannerURL != "" {
			if key := h.getStorageKeyFromURL(ip.BannerURL); key != "" {
				if signed, err := h.minio.GenerateDownloadURL(r.Context(), bucket, key, 1*time.Hour); err == nil {
					ip.BannerURL = signed
				}
			}
		}
		resp["institute_profile"] = &ip
	}

	respondJSON(w, http.StatusOK, resp)
}

func (h *UserHandler) getPublicProfile(w http.ResponseWriter, r *http.Request) {
	username := chi.URLParam(r, "username")
	if username == "" {
		respondError(w, http.StatusBadRequest, errors.ErrUsernameIsRequired)
		return
	}

	var u *user.User
	var err error

	if parsedID, parseErr := uuid.Parse(username); parseErr == nil {
		u, err = h.svc.GetByID(r.Context(), parsedID)
	} else {
		u, err = h.svc.GetByUsername(r.Context(), username)
	}

	if err != nil {
		respondError(w, http.StatusNotFound, errors.ErrUserNotFound)
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
		"id":                u.ID,
		"username":          u.Username,
		"role":              u.Role,
		"kyc_verified":      u.KycVerifiedAt != nil,
		"kyc_status":        h.getKycStatus(u),
		"full_name":         fullName,
		"profile_pic_url":   profilePic,
		"banner_url":        banner,
		"bio":               bio,
		"social_links":      u.SocialLinks,
		"skills":            u.Skills,
		"recognitions":      u.Recognitions,
		"location":          u.Location,
		"languages":         u.Languages,
		"primary_name":      u.PrimaryName,
		"secondary_name":    u.SecondaryName,
		"institute_profile": u.InstituteProfile,
	}

	bucket := "tarang-user-service"
	// Generate signed URLs for public access
	if profilePic != "" {
		if key := h.getStorageKeyFromURL(profilePic); key != "" {
			if signed, err := h.minio.GenerateDownloadURL(r.Context(), bucket, key, 1*time.Hour); err == nil {
				resp["profile_pic_url"] = signed
			}
		}
	}
	if banner != "" {
		if key := h.getStorageKeyFromURL(banner); key != "" {
			if signed, err := h.minio.GenerateDownloadURL(r.Context(), bucket, key, 1*time.Hour); err == nil {
				resp["banner_url"] = signed
			}
		}
	}
	if u.InstituteProfile != nil {
		ip := *u.InstituteProfile
		if ip.LogoURL != "" {
			if key := h.getStorageKeyFromURL(ip.LogoURL); key != "" {
				if signed, err := h.minio.GenerateDownloadURL(r.Context(), bucket, key, 1*time.Hour); err == nil {
					ip.LogoURL = signed
				}
			}
		}
		if ip.BannerURL != "" {
			if key := h.getStorageKeyFromURL(ip.BannerURL); key != "" {
				if signed, err := h.minio.GenerateDownloadURL(r.Context(), bucket, key, 1*time.Hour); err == nil {
					ip.BannerURL = signed
				}
			}
		}
		resp["institute_profile"] = &ip
	}

	respondJSON(w, http.StatusOK, resp)
}

func (h *UserHandler) getUploadUrl(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	uidStr := r.URL.Query().Get("user_id")
	fileType := r.URL.Query().Get("type")     // "profile", "banner", "document", "thumbnail", etc.
	mimeType := r.URL.Query().Get("mime")     // "image/jpeg", etc.
	username := r.URL.Query().Get("username") // required for central naming
	filename := r.URL.Query().Get("filename") // descriptive label: "casteProof", "profilePic", etc.

	if uidStr == "" || fileType == "" || mimeType == "" {
		respondError(w, http.StatusBadRequest, errors.ErrFileMetadataRequired)
		return
	}

	// Security: Validate mime type
	allowedMime := map[string]string{
		"image/jpeg":      ".jpg",
		"image/png":       ".png",
		"image/webp":      ".webp",
		"application/pdf": ".pdf",
		"video/mp4":       ".mp4",
		"video/webm":      ".webm",
		"video/ogg":       ".ogg",
		"audio/mpeg":      ".mp3",
		"audio/wav":       ".wav",
		"audio/ogg":       ".ogg",
		"audio/mp3":       ".mp3",
		"audio/*":         ".mp3",
	}
	ext, ok := allowedMime[mimeType]
	if !ok {
		respondError(w, http.StatusBadRequest, errors.ErrUnsupportedFileType)
		return
	}

	// Central naming: username_filename_(date+time)_tarang.ext
	timestamp := time.Now().Format("20060102_150405")
	var fileName string
	if username != "" && filename != "" {
		fileName = fmt.Sprintf("users/%s/%s/%s_%s_%s_tarang%s", uidStr, fileType, username, filename, timestamp, ext)
	} else if username != "" {
		fileName = fmt.Sprintf("users/%s/%s/%s_%s_%s_tarang%s", uidStr, fileType, username, fileType, timestamp, ext)
	} else {
		fileName = fmt.Sprintf("users/%s/%s/%s_%s_tarang%s", uidStr, fileType, fileType, timestamp, ext)
	}
	bucket := "tarang-user-service"

	url, err := h.minio.GenerateUploadURL(ctx, bucket, fileName, 15*time.Minute)
	if err != nil {
		fmt.Printf("ERROR generating upload URL: %v\n", err)
		respondError(w, http.StatusInternalServerError, errors.ErrFailedToGenerateUploadURL)
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"upload_url": url,
		"file_url":   fmt.Sprintf("%s/%s/%s", h.cfg.MinioPublicURL, bucket, fileName),
	})
}

// getDownloadUrl generates a short-lived presigned GET URL for a private MinIO object.
// Called by the Next.js proxy (/api/proxy/file.pdf) to serve documents without exposing credentials.
func (h *UserHandler) getDownloadUrl(w http.ResponseWriter, r *http.Request) {
	fileURL := r.URL.Query().Get("url")
	if fileURL == "" {
		respondError(w, http.StatusBadRequest, errors.ErrFileMetadataRequired)
		return
	}

	bucket := "tarang-user-service"
	key := h.getStorageKeyFromURL(fileURL)
	if key == "" {
		// URL is not a MinIO URL we recognise – return it as-is so the proxy can try directly
		respondJSON(w, http.StatusOK, map[string]string{"signed_url": fileURL})
		return
	}

	signed, err := h.minio.GenerateDownloadURL(r.Context(), bucket, key, 1*time.Hour)
	if err != nil {
		fmt.Printf("ERROR generating download URL: %v\n", err)
		respondError(w, http.StatusInternalServerError, errors.ErrFailedToGenerateUploadURL)
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"signed_url": signed})
}

// deleteFiles deletes files from MinIO given their public URLs.
// Used for cascading cleanup: re-uploads, application withdrawal, etc.
func (h *UserHandler) deleteFiles(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var in struct {
		FileURLs []string `json:"file_urls"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidPayload)
		return
	}

	if len(in.FileURLs) == 0 {
		respondJSON(w, http.StatusOK, map[string]interface{}{"deleted": 0})
		return
	}

	bucket := "tarang-user-service"
	publicPrefix := fmt.Sprintf("%s/%s/", h.cfg.MinioPublicURL, bucket)

	deleted := 0
	for _, fileURL := range in.FileURLs {
		// Extract MinIO key from public URL
		if !strings.HasPrefix(fileURL, publicPrefix) {
			fmt.Printf("[deleteFiles] Skipping non-MinIO URL: %s\n", fileURL)
			continue
		}
		key := strings.TrimPrefix(fileURL, publicPrefix)
		if key == "" {
			continue
		}

		err := h.minio.RemoveObject(ctx, bucket, key)
		if err != nil {
			fmt.Printf("[deleteFiles] Failed to delete %s: %v\n", key, err)
			continue
		}
		deleted++
		fmt.Printf("[deleteFiles] Deleted: %s\n", key)
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{"deleted": deleted})
}

func (h *UserHandler) updateProfilePic(w http.ResponseWriter, r *http.Request) {
	var in struct {
		UserID string `json:"user_id"`
		URL    string `json:"url"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidPayload)
		return
	}

	uid, err := uuid.Parse(in.UserID)
	if err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidUserIdentifier)
		return
	}

	if err := h.svc.UpdateProfilePic(r.Context(), uid, in.URL); err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrFailedToUpdateProfilePic)
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
		respondError(w, http.StatusBadRequest, errors.ErrInvalidPayload)
		return
	}

	uid, err := uuid.Parse(in.UserID)
	if err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidUserIdentifier)
		return
	}

	if err := h.svc.UpdateBanner(r.Context(), uid, in.URL); err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrFailedToUpdateBanner)
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
		respondError(w, http.StatusBadRequest, errors.ErrInvalidPayload)
		return
	}

	uid, err := uuid.Parse(in.UserID)
	if err != nil {
		respondError(w, http.StatusBadRequest, errors.ErrInvalidUserIdentifier)
		return
	}

	if err := h.svc.UpdateBio(r.Context(), uid, in.Bio); err != nil {
		respondError(w, http.StatusInternalServerError, errors.ErrFailedToUpdateBio)
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "bio updated"})
}

func (h *UserHandler) updateProfile(w http.ResponseWriter, r *http.Request) {
	var in struct {
		UserID           string                      `json:"user_id"`
		Bio              string                      `json:"bio"`
		SocialLinks      map[string]string           `json:"social_links"`
		Skills           []string                    `json:"skills"`
		Recognitions     []string                    `json:"recognitions"`
		FullName         string                      `json:"full_name"`
		DOB              string                      `json:"dob"`
		Gender           string                      `json:"gender"`
		Location         string                      `json:"location"`
		Languages        []string                    `json:"languages"`
		Demographic      string                      `json:"demographic"`
		PrimaryName      string                      `json:"primary_name"`
		SecondaryName    string                      `json:"secondary_name"`
		InstituteProfile *user.InstituteProfileInput `json:"institute_profile"`
		Religion         string                      `json:"religion"`
		Caste            string                      `json:"caste"`
		Subcaste         string                      `json:"subcaste"`
		Nationality      string                      `json:"nationality"`
		Addresses        []*user.UserAddress         `json:"addresses"`
		AcademicRecords  []*user.UserAcademicRecord  `json:"academic_records"`
		WorkExperiences  []*user.UserWorkExperience  `json:"work_experiences"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		fmt.Printf("[UserHandler] Decode error: %v\n", err)
		respondError(w, http.StatusBadRequest, errors.ErrInvalidPayload)
		return
	}

	uid, err := uuid.Parse(in.UserID)
	if err != nil {
		fmt.Printf("[UserHandler] Invalid UUID: %v\n", in.UserID)
		respondError(w, http.StatusBadRequest, errors.ErrInvalidUserIdentifier)
		return
	}

	if in.InstituteProfile != nil {
		if in.InstituteProfile.InstituteType == "" {
			fmt.Printf("[UserHandler] Missing InstituteType\n")
			respondError(w, http.StatusBadRequest, errors.ErrInstituteTypeRequired)
			return
		}
		if in.InstituteProfile.EstablishedYear < 1800 {
			fmt.Printf("[UserHandler] Invalid EstablishedYear: %d\n", in.InstituteProfile.EstablishedYear)
			respondError(w, http.StatusBadRequest, errors.ErrEstablishedYearInvalid)
			return
		}
		if in.InstituteProfile.RegistrationNumber == "" {
			fmt.Printf("[UserHandler] Missing RegistrationNumber\n")
			respondError(w, http.StatusBadRequest, errors.ErrRegistrationNumberRequired)
			return
		}
		if len(in.InstituteProfile.CoursesOffered) == 0 {
			fmt.Printf("[UserHandler] Missing CoursesOffered\n")
			respondError(w, http.StatusBadRequest, errors.ErrCoursesOfferedRequired)
			return
		}
		if in.InstituteProfile.StudentCount < 0 || in.InstituteProfile.FacultyCount < 0 {
			fmt.Printf("[UserHandler] Negative Counts\n")
			respondError(w, http.StatusBadRequest, errors.ErrCountsCannotBeNegative)
			return
		}
	}

	if err := h.svc.UpdateProfile(r.Context(), uid, in.FullName, in.DOB, in.Gender, in.Bio, in.SocialLinks, in.Skills, in.Recognitions, in.Location, in.Languages, in.Demographic, in.PrimaryName, in.SecondaryName, in.InstituteProfile, in.Religion, in.Caste, in.Subcaste, in.Nationality, in.Addresses, in.AcademicRecords, in.WorkExperiences); err != nil {
		fmt.Printf("[UserHandler] UpdateProfile error: %v\n", err)
		respondError(w, http.StatusInternalServerError, errors.ErrFailedToUpdateProfile)
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "profile updated"})
}
func (h *UserHandler) getStorageKeyFromURL(fileURL string) string {
	// Handle old AWS URLs
	if strings.Contains(fileURL, ".amazonaws.com/") {
		parts := strings.Split(fileURL, ".amazonaws.com/")
		if len(parts) >= 2 {
			return parts[1]
		}
	}

	// Handle new MinIO URLs
	if h.cfg.MinioPublicURL != "" && strings.Contains(fileURL, h.cfg.MinioPublicURL) {
		parts := strings.Split(fileURL, h.cfg.MinioPublicURL+"/")
		if len(parts) >= 2 {
			// Parts[1] is bucket/key. We just want the key.
			keyParts := strings.SplitN(parts[1], "/", 2)
			if len(keyParts) == 2 {
				return keyParts[1]
			}
		}
	}

	return ""
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
		respondError(w, http.StatusInternalServerError, errors.ErrFailedToFetchInstitutes)
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
			if key := h.getStorageKeyFromURL(profilePic); key != "" {
				if signed, err := h.minio.GenerateDownloadURL(r.Context(), bucket, key, 1*time.Hour); err == nil {
					profilePic = signed
				}
			}
		}

		banner := ""
		if u.BannerURL != nil {
			banner = *u.BannerURL
			if key := h.getStorageKeyFromURL(banner); key != "" {
				if signed, err := h.minio.GenerateDownloadURL(r.Context(), bucket, key, 1*time.Hour); err == nil {
					banner = signed
				}
			}
		}

		results = append(results, map[string]any{
			"id":              u.ID,
			"username":        u.Username,
			"full_name":       fullName,
			"profile_pic_url": profilePic,
			"banner_url":      banner,
			"location":        u.Location,
			"languages":       u.Languages,
			"demographic":     u.Demographic,
			"bio":             u.Bio,
			"recognitions":    u.Recognitions,
			"primary_name":    u.PrimaryName,
			"secondary_name":  u.SecondaryName,
		})
	}

	// Make sure we return an empty array instead of null if no results
	if results == nil {
		results = []map[string]any{}
	}

	respondJSON(w, http.StatusOK, results)
}
