package grpc

import (
	"context"
	"backend/proto/admissionpb"
	"backend/services/admission/internal/admission"
	"google.golang.org/protobuf/types/known/emptypb"
)

type Server struct {
	admissionpb.UnimplementedAdmissionServiceServer
	service admission.Service
}

func NewServer(service admission.Service) *Server {
	return &Server{service: service}
}

func (s *Server) CreateProgram(ctx context.Context, req *admissionpb.CreateProgramRequest) (*admissionpb.ProgramResponse, error) {
	return s.service.CreateProgram(ctx, req)
}

func (s *Server) GetProgramByID(ctx context.Context, req *admissionpb.ProgramIDRequest) (*admissionpb.ProgramResponse, error) {
	return s.service.GetProgramByID(ctx, req)
}

func (s *Server) GetProgramsByInstitute(ctx context.Context, req *admissionpb.InstituteIDRequest) (*admissionpb.ProgramListResponse, error) {
	return s.service.GetProgramsByInstitute(ctx, req)
}

func (s *Server) UpdateProgram(ctx context.Context, req *admissionpb.UpdateProgramRequest) (*admissionpb.ProgramResponse, error) {
	return s.service.UpdateProgram(ctx, req)
}

func (s *Server) DeleteProgram(ctx context.Context, req *admissionpb.DeleteProgramRequest) (*emptypb.Empty, error) {
	return s.service.DeleteProgram(ctx, req)
}

// Drafts
func (s *Server) SaveDraft(ctx context.Context, req *admissionpb.SaveDraftRequest) (*admissionpb.DraftResponse, error) {
	return s.service.SaveDraft(ctx, req)
}

func (s *Server) GetDrafts(ctx context.Context, req *admissionpb.GetDraftsRequest) (*admissionpb.DraftListResponse, error) {
	return s.service.GetDrafts(ctx, req)
}

func (s *Server) DeleteDraft(ctx context.Context, req *admissionpb.DeleteDraftRequest) (*emptypb.Empty, error) {
	return s.service.DeleteDraft(ctx, req)
}

// Applications & Progress Tracking
func (s *Server) ApplyForProgram(ctx context.Context, req *admissionpb.ApplyRequest) (*admissionpb.TransactionResponse, error) {
	return s.service.ApplyForProgram(ctx, req)
}

func (s *Server) UpdateApplicationProgress(ctx context.Context, req *admissionpb.UpdateProgressRequest) (*admissionpb.TransactionResponse, error) {
	return s.service.UpdateApplicationProgress(ctx, req)
}

func (s *Server) GetApplicationHistory(ctx context.Context, req *admissionpb.HistoryRequest) (*admissionpb.HistoryResponse, error) {
	return s.service.GetApplicationHistory(ctx, req)
}

func (s *Server) GetUserApplications(ctx context.Context, req *admissionpb.UserApplicationsRequest) (*admissionpb.ApplicationListResponse, error) {
	return s.service.GetUserApplications(ctx, req)
}

func (s *Server) GetInstituteApplications(ctx context.Context, req *admissionpb.InstituteApplicationsRequest) (*admissionpb.ApplicationListResponse, error) {
	return s.service.GetInstituteApplications(ctx, req)
}

