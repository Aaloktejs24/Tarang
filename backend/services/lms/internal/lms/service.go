package lms

import (
	"context"
	"time"
	"github.com/google/uuid"
	"backend/proto/lmspb"
	"backend/shared/config"
)

type Service interface {
	CreateCourse(ctx context.Context, req *lmspb.CreateCourseRequest) (*lmspb.CreateCourseResponse, error)
	GetCourse(ctx context.Context, req *lmspb.GetCourseRequest) (*lmspb.GetCourseResponse, error)
	ListCourses(ctx context.Context, req *lmspb.ListCoursesRequest) (*lmspb.ListCoursesResponse, error)
	UpdateCourse(ctx context.Context, req *lmspb.UpdateCourseRequest) (*lmspb.UpdateCourseResponse, error)
	DeleteCourse(ctx context.Context, req *lmspb.DeleteCourseRequest) (*lmspb.DeleteCourseResponse, error)
	EnrollCourse(ctx context.Context, req *lmspb.EnrollCourseRequest) (*lmspb.EnrollCourseResponse, error)
	GetEnrolledCourses(ctx context.Context, req *lmspb.GetEnrolledCoursesRequest) (*lmspb.GetEnrolledCoursesResponse, error)
	GetCourseStudents(ctx context.Context, req *lmspb.GetCourseStudentsRequest) (*lmspb.GetCourseStudentsResponse, error)
}

type service struct {
	repo Repository
	cfg  *config.Config
}

func NewService(repo Repository, cfg *config.Config) Service {
	return &service{
		repo: repo,
		cfg:  cfg,
	}
}

func (s *service) CreateCourse(ctx context.Context, req *lmspb.CreateCourseRequest) (*lmspb.CreateCourseResponse, error) {
	course := req.Course
	course.Id = uuid.New().String()
	now := time.Now().UTC().Format(time.RFC3339)
	course.CreatedAt = now
	course.UpdatedAt = now

	// Generate IDs for modules and topics if empty
	for _, mod := range course.Modules {
		if mod.Id == "" {
			mod.Id = uuid.New().String()
		}
		for _, topic := range mod.Children {
			if topic.Id == "" {
				topic.Id = uuid.New().String()
			}
		}
	}

	err := s.repo.CreateCourse(ctx, course)
	if err != nil {
		return nil, err
	}

	return &lmspb.CreateCourseResponse{
		Id: course.Id,
	}, nil
}

func (s *service) GetCourse(ctx context.Context, req *lmspb.GetCourseRequest) (*lmspb.GetCourseResponse, error) {
	course, err := s.repo.GetCourseByID(ctx, req.Id)
	if err != nil {
		return nil, err
	}
	return &lmspb.GetCourseResponse{
		Course: course,
	}, nil
}

func (s *service) ListCourses(ctx context.Context, req *lmspb.ListCoursesRequest) (*lmspb.ListCoursesResponse, error) {
	courses, err := s.repo.ListCourses(ctx)
	if err != nil {
		return nil, err
	}
	return &lmspb.ListCoursesResponse{
		Courses: courses,
	}, nil
}

func (s *service) UpdateCourse(ctx context.Context, req *lmspb.UpdateCourseRequest) (*lmspb.UpdateCourseResponse, error) {
	course := req.Course
	course.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	for _, mod := range course.Modules {
		if mod.Id == "" {
			mod.Id = uuid.New().String()
		}
		for _, topic := range mod.Children {
			if topic.Id == "" {
				topic.Id = uuid.New().String()
			}
		}
	}

	err := s.repo.UpdateCourse(ctx, course)
	if err != nil {
		return nil, err
	}

	return &lmspb.UpdateCourseResponse{
		Success: true,
	}, nil
}

func (s *service) DeleteCourse(ctx context.Context, req *lmspb.DeleteCourseRequest) (*lmspb.DeleteCourseResponse, error) {
	err := s.repo.DeleteCourse(ctx, req.Id)
	if err != nil {
		return nil, err
	}

	return &lmspb.DeleteCourseResponse{
		Success: true,
	}, nil
}

func (s *service) EnrollCourse(ctx context.Context, req *lmspb.EnrollCourseRequest) (*lmspb.EnrollCourseResponse, error) {
	err := s.repo.EnrollCourse(ctx, req.CourseId, req.StudentId, req.StudentName, req.StudentEmail, req.ProfilePic)
	if err != nil {
		return nil, err
	}
	// Also increment students count in course
	course, err := s.repo.GetCourseByID(ctx, req.CourseId)
	if err == nil && course != nil {
		course.Students += 1
		s.repo.UpdateCourse(ctx, course)
	}

	return &lmspb.EnrollCourseResponse{
		Success: true,
	}, nil
}

func (s *service) GetEnrolledCourses(ctx context.Context, req *lmspb.GetEnrolledCoursesRequest) (*lmspb.GetEnrolledCoursesResponse, error) {
	courses, err := s.repo.GetEnrolledCourses(ctx, req.StudentId)
	if err != nil {
		return nil, err
	}
	return &lmspb.GetEnrolledCoursesResponse{
		Courses: courses,
	}, nil
}

func (s *service) GetCourseStudents(ctx context.Context, req *lmspb.GetCourseStudentsRequest) (*lmspb.GetCourseStudentsResponse, error) {
	students, err := s.repo.GetCourseStudents(ctx, req.CourseId)
	if err != nil {
		return nil, err
	}
	return &lmspb.GetCourseStudentsResponse{
		Students: students,
	}, nil
}

