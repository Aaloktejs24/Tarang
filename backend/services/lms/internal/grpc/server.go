package grpc

import (
	"context"

	"backend/proto/lmspb"
	"backend/services/lms/internal/lms"
)

type Server struct {
	lmspb.UnimplementedLMSServiceServer
	service lms.Service
}

func NewServer(service lms.Service) *Server {
	return &Server{service: service}
}

func (s *Server) CreateCourse(ctx context.Context, req *lmspb.CreateCourseRequest) (*lmspb.CreateCourseResponse, error) {
	return s.service.CreateCourse(ctx, req)
}

func (s *Server) GetCourse(ctx context.Context, req *lmspb.GetCourseRequest) (*lmspb.GetCourseResponse, error) {
	return s.service.GetCourse(ctx, req)
}

func (s *Server) ListCourses(ctx context.Context, req *lmspb.ListCoursesRequest) (*lmspb.ListCoursesResponse, error) {
	return s.service.ListCourses(ctx, req)
}

func (s *Server) UpdateCourse(ctx context.Context, req *lmspb.UpdateCourseRequest) (*lmspb.UpdateCourseResponse, error) {
	return s.service.UpdateCourse(ctx, req)
}

func (s *Server) DeleteCourse(ctx context.Context, req *lmspb.DeleteCourseRequest) (*lmspb.DeleteCourseResponse, error) {
	return s.service.DeleteCourse(ctx, req)
}

func (s *Server) EnrollCourse(ctx context.Context, req *lmspb.EnrollCourseRequest) (*lmspb.EnrollCourseResponse, error) {
	return s.service.EnrollCourse(ctx, req)
}

func (s *Server) GetEnrolledCourses(ctx context.Context, req *lmspb.GetEnrolledCoursesRequest) (*lmspb.GetEnrolledCoursesResponse, error) {
	return s.service.GetEnrolledCourses(ctx, req)
}

func (s *Server) GetCourseStudents(ctx context.Context, req *lmspb.GetCourseStudentsRequest) (*lmspb.GetCourseStudentsResponse, error) {
	return s.service.GetCourseStudents(ctx, req)
}
