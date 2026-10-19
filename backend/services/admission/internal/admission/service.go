package admission

import (
	"context"
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
		WorkflowTitle: req.WorkflowTitle,
		WorkflowDesc:  req.WorkflowDesc,
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
		WorkflowTitle: req.WorkflowTitle,
		WorkflowDesc:  req.WorkflowDesc,
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
	appID := uuid.New().String()
	txID := uuid.New().String()

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
		ActorId:       req.UserId, // User applies, so they are the actor
		ActionType:    "APPLICATION_STARTED",
		Metadata:      req.Metadata,
	}

	err := s.repo.ApplyForProgram(ctx, app, tx)
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

