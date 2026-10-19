package admission

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"backend/proto/admissionpb"
	"backend/shared/config"
	"github.com/google/uuid"
	"google.golang.org/protobuf/types/known/emptypb"
)

type Service interface {
	CreateProgram(ctx context.Context, req *admissionpb.CreateProgramRequest) (*admissionpb.ProgramResponse, error)
	UpdateProgram(ctx context.Context, req *admissionpb.UpdateProgramRequest) (*admissionpb.ProgramResponse, error)
	GetProgramByID(ctx context.Context, req *admissionpb.ProgramIDRequest) (*admissionpb.ProgramResponse, error)
	GetProgramsByInstitute(ctx context.Context, req *admissionpb.InstituteIDRequest) (*admissionpb.ProgramListResponse, error)
	DeleteProgram(ctx context.Context, req *admissionpb.DeleteProgramRequest) (*emptypb.Empty, error)

	// Drafts
	SaveDraft(ctx context.Context, req *admissionpb.SaveDraftRequest) (*admissionpb.DraftResponse, error)
	GetDrafts(ctx context.Context, req *admissionpb.GetDraftsRequest) (*admissionpb.DraftListResponse, error)
	DeleteDraft(ctx context.Context, req *admissionpb.DeleteDraftRequest) (*emptypb.Empty, error)

	// Applications & Progress Tracking (ACID)
	ApplyForProgram(ctx context.Context, req *admissionpb.ApplyRequest) (*admissionpb.TransactionResponse, error)
	UpdateApplicationProgress(ctx context.Context, req *admissionpb.UpdateProgressRequest) (*admissionpb.TransactionResponse, error)
	GetApplicationHistory(ctx context.Context, req *admissionpb.HistoryRequest) (*admissionpb.HistoryResponse, error)
	GetUserApplications(ctx context.Context, req *admissionpb.UserApplicationsRequest) (*admissionpb.ApplicationListResponse, error)
	GetInstituteApplications(ctx context.Context, req *admissionpb.InstituteApplicationsRequest) (*admissionpb.ApplicationListResponse, error)
	DeleteApplication(ctx context.Context, appID string) error

	// Background Jobs
	CleanAbandonedData(ctx context.Context, cutoffTime time.Time) error
}

type service struct {
	repo Repository
	cfg  *config.Config
}

func NewService(repo Repository, cfg *config.Config) Service {
	return &service{repo: repo, cfg: cfg}
}

func (s *service) CreateProgram(ctx context.Context, req *admissionpb.CreateProgramRequest) (*admissionpb.ProgramResponse, error) {
	programID := uuid.New().String()

	prog := &admissionpb.Program{
		Id:            programID,
		InstituteId:   req.InstituteId,
		FormTitle: req.FormTitle,
		FormDesc:  req.FormDesc,
		ImageUrl:      req.ImageUrl,
		LastDate:      req.LastDate,
		Seats:         req.Seats,
		AcademicYear:  req.AcademicYear,
		Eligibility:   req.Eligibility,
		Fees:          req.Fees,
		Duration:      req.Duration,
		Stages:        req.Stages,
		PublishDate:   req.PublishDate,
	}

	err := s.repo.CreateProgram(ctx, prog)
	if err != nil {
		return nil, err
	}

	return &admissionpb.ProgramResponse{Program: prog}, nil
}

func (s *service) UpdateProgram(ctx context.Context, req *admissionpb.UpdateProgramRequest) (*admissionpb.ProgramResponse, error) {
	// First check if program exists
	existingProg, err := s.repo.GetProgramByID(ctx, req.Id)
	if err != nil {
		return nil, err
	}

	// Update fields
	prog := &admissionpb.Program{
		Id:            req.Id,
		InstituteId:   req.InstituteId,
		FormTitle: req.FormTitle,
		FormDesc:  req.FormDesc,
		ImageUrl:      req.ImageUrl,
		LastDate:      req.LastDate,
		Seats:         req.Seats,
		AcademicYear:  req.AcademicYear,
		Eligibility:   req.Eligibility,
		Fees:          req.Fees,
		Duration:      req.Duration,
		Stages:        req.Stages,
		PublishDate:   req.PublishDate,
	}

	// Make sure we keep the same institute_id if it's not provided or we enforce ownership
	if prog.InstituteId == "" {
		prog.InstituteId = existingProg.InstituteId
	}

	err = s.repo.UpdateProgram(ctx, prog)
	if err != nil {
		return nil, err
	}

	return &admissionpb.ProgramResponse{Program: prog}, nil
}

func (s *service) GetProgramByID(ctx context.Context, req *admissionpb.ProgramIDRequest) (*admissionpb.ProgramResponse, error) {
	prog, err := s.repo.GetProgramByID(ctx, req.Id)
	if err != nil {
		return nil, err
	}
	return &admissionpb.ProgramResponse{Program: prog}, nil
}

func (s *service) GetProgramsByInstitute(ctx context.Context, req *admissionpb.InstituteIDRequest) (*admissionpb.ProgramListResponse, error) {
	programs, err := s.repo.GetProgramsByInstitute(ctx, req.InstituteId)
	if err != nil {
		return nil, err
	}
	return &admissionpb.ProgramListResponse{Programs: programs}, nil
}

func (s *service) DeleteProgram(ctx context.Context, req *admissionpb.DeleteProgramRequest) (*emptypb.Empty, error) {
	err := s.repo.DeleteProgram(ctx, req.Id)
	if err != nil {
		return nil, err
	}
	return &emptypb.Empty{}, nil
}

// Draft Implementations
func (s *service) SaveDraft(ctx context.Context, req *admissionpb.SaveDraftRequest) (*admissionpb.DraftResponse, error) {
	draftID := uuid.New().String()
	if req.DraftId != "" {
		draftID = req.DraftId
	}

	draft := &admissionpb.Draft{
		Id:          draftID,
		InstituteId: req.InstituteId,
		ProgramId:   req.ProgramId,
		DraftData:   req.DraftData,
	}

	err := s.repo.SaveDraft(ctx, draft)
	if err != nil {
		return nil, err
	}

	return &admissionpb.DraftResponse{Draft: draft}, nil
}

func (s *service) GetDrafts(ctx context.Context, req *admissionpb.GetDraftsRequest) (*admissionpb.DraftListResponse, error) {
	drafts, err := s.repo.GetDrafts(ctx, req.InstituteId)
	if err != nil {
		return nil, err
	}
	return &admissionpb.DraftListResponse{Drafts: drafts}, nil
}

func (s *service) DeleteDraft(ctx context.Context, req *admissionpb.DeleteDraftRequest) (*emptypb.Empty, error) {
	err := s.repo.DeleteDraft(ctx, req.InstituteId, req.DraftId)
	if err != nil {
		return nil, err
	}
	return &emptypb.Empty{}, nil
}

// Applications & Progress Tracking Implementations
func (s *service) ApplyForProgram(ctx context.Context, req *admissionpb.ApplyRequest) (*admissionpb.TransactionResponse, error) {
	// Business Rule: Only one active application allowed per user at any time.
	existingApps, err := s.repo.GetUserApplications(ctx, req.UserId)
	if err == nil {
		for _, a := range existingApps {
			if a.Status != "withdrawn" && a.Status != "rejected" {
				return nil, fmt.Errorf("user already has an active application")
			}
		}
	}

	txID := uuid.New().String()
	appID := uuid.New().String()

	app := &admissionpb.Application{
		Id:                appID,
		UserId:            req.UserId,
		InstituteId:       req.InstituteId,
		ProgramId:         req.ProgramId,
		CurrentStageIndex: 0,
		Status:            "pending",
	}

	tx := &admissionpb.Transaction{
		Id:            txID,
		ApplicationId: appID,
		ActorId:       req.UserId,
		ActionType:    "APPLICATION_STARTED",
		Metadata:      req.Metadata,
	}

	err = s.repo.ApplyForProgram(ctx, app, tx)
	if err != nil {
		return nil, err
	}

	return &admissionpb.TransactionResponse{
		Transaction: tx,
		Application: app,
	}, nil
}

func (s *service) UpdateApplicationProgress(ctx context.Context, req *admissionpb.UpdateProgressRequest) (*admissionpb.TransactionResponse, error) {
	txID := uuid.New().String()

	tx := &admissionpb.Transaction{
		Id:            txID,
		ApplicationId: req.ApplicationId,
		ActorId:       req.ActorId,
		ActionType:    req.ActionType,
		Metadata:      req.Metadata,
	}

	err := s.repo.UpdateApplicationProgress(ctx, req.ApplicationId, req.NewStageIndex, req.NewStatus, tx)
	if err != nil {
		return nil, err
	}

	// Cascade: if application is rejected, delete files from MinIO
	if req.NewStatus == "rejected" {
		go s.cascadeDeleteFiles(req.ApplicationId)
	}

	// Fetch updated state to return to client
	_, app, err := s.repo.GetApplicationHistory(ctx, req.ApplicationId)
	if err != nil {
		return nil, err
	}

	return &admissionpb.TransactionResponse{
		Transaction: tx,
		Application: app,
	}, nil
}

func (s *service) GetApplicationHistory(ctx context.Context, req *admissionpb.HistoryRequest) (*admissionpb.HistoryResponse, error) {
	txs, app, err := s.repo.GetApplicationHistory(ctx, req.ApplicationId)
	if err != nil {
		return nil, err
	}

	// Optionally load program details for richness
	if app.ProgramId != "" {
		prog, _ := s.repo.GetProgramByID(ctx, app.ProgramId)
		if prog != nil {
			app.Program = prog
		}
	}

	return &admissionpb.HistoryResponse{
		Transactions: txs,
		Application:  app,
	}, nil
}

func (s *service) GetUserApplications(ctx context.Context, req *admissionpb.UserApplicationsRequest) (*admissionpb.ApplicationListResponse, error) {
	apps, err := s.repo.GetUserApplications(ctx, req.UserId)
	if err != nil {
		return nil, err
	}

	// Populate Program Details for UI
	for _, app := range apps {
		if app.ProgramId != "" {
			prog, _ := s.repo.GetProgramByID(ctx, app.ProgramId)
			if prog != nil {
				app.Program = prog
			}
		}
	}

	return &admissionpb.ApplicationListResponse{Applications: apps}, nil
}

func (s *service) DeleteApplication(ctx context.Context, appID string) error {
	// Cascade delete files first
	go s.cascadeDeleteFiles(appID)
	return s.repo.DeleteApplication(ctx, appID)
}

func (s *service) GetInstituteApplications(ctx context.Context, req *admissionpb.InstituteApplicationsRequest) (*admissionpb.ApplicationListResponse, error) {
	apps, err := s.repo.GetInstituteApplications(ctx, req.InstituteId)
	if err != nil {
		return nil, err
	}

	for _, app := range apps {
		if app.ProgramId != "" {
			prog, _ := s.repo.GetProgramByID(ctx, app.ProgramId)
			if prog != nil {
				app.Program = prog
			}
		}
	}

	return &admissionpb.ApplicationListResponse{Applications: apps}, nil
}

// cascadeDeleteFiles extracts all file URLs from an application's transactions
// and calls user-service /s3/delete to remove them from MinIO.
func (s *service) cascadeDeleteFiles(appID string) {
	ctx := context.Background()

	txs, _, err := s.repo.GetApplicationHistory(ctx, appID)
	if err != nil {
		fmt.Printf("[cascade] Failed to get transactions for app %s: %v\n", appID, err)
		return
	}

	var allURLs []string
	for _, tx := range txs {
		if tx.Metadata == "" {
			continue
		}
		urls := extractURLsFromJSON(tx.Metadata)
		allURLs = append(allURLs, urls...)
	}

	if len(allURLs) == 0 {
		fmt.Printf("[cascade] No file URLs found for app %s\n", appID)
		return
	}

	// Deduplicate
	seen := make(map[string]bool)
	var uniqueURLs []string
	for _, u := range allURLs {
		if !seen[u] {
			seen[u] = true
			uniqueURLs = append(uniqueURLs, u)
		}
	}

	// Call user-service /s3/delete
	payload, _ := json.Marshal(map[string]interface{}{
		"file_urls": uniqueURLs,
	})

	userServiceURL := "http://user-service:8081/api/v1/user/s3/delete"
	resp, err := http.Post(userServiceURL, "application/json", bytes.NewReader(payload))
	if err != nil {
		fmt.Printf("[cascade] Failed to call user-service for cleanup: %v\n", err)
		return
	}
	defer resp.Body.Close()

	fmt.Printf("[cascade] Cleanup for app %s: sent %d file URLs, status: %s\n", appID, len(uniqueURLs), resp.Status)
}

// extractURLsFromJSON recursively finds all string values that look like MinIO URLs
func extractURLsFromJSON(jsonStr string) []string {
	var urls []string
	var data interface{}
	if err := json.Unmarshal([]byte(jsonStr), &data); err != nil {
		return urls
	}
	findURLs(data, &urls)
	return urls
}

func findURLs(data interface{}, urls *[]string) {
	switch v := data.(type) {
	case string:
		if strings.Contains(v, "tarang-user-service") && (strings.Contains(v, "http://") || strings.Contains(v, "https://")) {
			*urls = append(*urls, v)
		}
	case map[string]interface{}:
		for _, val := range v {
			findURLs(val, urls)
		}
	case []interface{}:
		for _, val := range v {
			findURLs(val, urls)
		}
	}
}

// ---------------------------------------------------------
// Background Cleanup
// ---------------------------------------------------------

// CleanAbandonedData handles 30-day abandoned program drafts and student applications.
func (s *service) CleanAbandonedData(ctx context.Context, cutoffTime time.Time) error {
	// 1. Delete abandoned program drafts
	deletedCount, err := s.repo.DeleteOldDrafts(ctx, cutoffTime)
	if err != nil {
		fmt.Printf("[cleanup] Failed to delete old drafts: %v\n", err)
	} else if deletedCount > 0 {
		fmt.Printf("[cleanup] Deleted %d abandoned program drafts older than 30 days\n", deletedCount)
	}

	// 2. Auto-delete abandoned applications
	apps, err := s.repo.GetAbandonedApplications(ctx, cutoffTime)
	if err != nil {
		fmt.Printf("[cleanup] Failed to fetch abandoned applications: %v\n", err)
		return err
	}

	if len(apps) == 0 {
		return nil
	}

	fmt.Printf("[cleanup] Found %d abandoned applications. Auto-deleting...\n", len(apps))

	for _, app := range apps {
		err := s.DeleteApplication(ctx, app.Id)
		if err != nil {
			fmt.Printf("[cleanup] Failed to auto-delete app %s: %v\n", app.Id, err)
		} else {
			fmt.Printf("[cleanup] Auto-deleted application %s\n", app.Id)
		}
	}
	return nil
}
