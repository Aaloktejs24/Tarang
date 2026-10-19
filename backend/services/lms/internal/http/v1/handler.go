package v1

import (
	"encoding/json"
	"net/http"

	"backend/proto/lmspb"
	"backend/services/lms/internal/lms"
	"github.com/go-chi/chi/v5"
)

type LMSHandler struct {
	service lms.Service
}

func NewLMSHandler(service lms.Service) *LMSHandler {
	return &LMSHandler{service: service}
}

func RegisterRoutes(r chi.Router, h *LMSHandler) {
	r.Post("/courses", h.CreateCourse)
	r.Get("/courses", h.ListCourses)
	r.Get("/courses/{id}", h.GetCourse)
	r.Put("/courses/{id}", h.UpdateCourse)
	r.Delete("/courses/{id}", h.DeleteCourse)
	
	r.Post("/courses/{id}/enroll", h.EnrollCourse)
	r.Get("/students/{studentId}/courses", h.GetEnrolledCourses)
	r.Get("/courses/{id}/students", h.GetCourseStudents)
}

func (h *LMSHandler) CreateCourse(w http.ResponseWriter, r *http.Request) {
	var course lmspb.Course
	if err := json.NewDecoder(r.Body).Decode(&course); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	req := &lmspb.CreateCourseRequest{Course: &course}
	resp, err := h.service.CreateCourse(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

func (h *LMSHandler) ListCourses(w http.ResponseWriter, r *http.Request) {
	req := &lmspb.ListCoursesRequest{}
	resp, err := h.service.ListCourses(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp.Courses)
}

func (h *LMSHandler) GetCourse(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	req := &lmspb.GetCourseRequest{Id: id}
	resp, err := h.service.GetCourse(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp.Course)
}

func (h *LMSHandler) UpdateCourse(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	var course lmspb.Course
	if err := json.NewDecoder(r.Body).Decode(&course); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	course.Id = id

	req := &lmspb.UpdateCourseRequest{Course: &course}
	resp, err := h.service.UpdateCourse(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *LMSHandler) DeleteCourse(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	req := &lmspb.DeleteCourseRequest{Id: id}
	resp, err := h.service.DeleteCourse(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *LMSHandler) EnrollCourse(w http.ResponseWriter, r *http.Request) {
	courseID := chi.URLParam(r, "id")
	var reqData struct {
		StudentID    string `json:"student_id"`
		StudentName  string `json:"student_name"`
		StudentEmail string `json:"student_email"`
		ProfilePic   string `json:"profile_pic"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	req := &lmspb.EnrollCourseRequest{
		CourseId:     courseID,
		StudentId:    reqData.StudentID,
		StudentName:  reqData.StudentName,
		StudentEmail: reqData.StudentEmail,
		ProfilePic: reqData.ProfilePic,
	}
	resp, err := h.service.EnrollCourse(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *LMSHandler) GetEnrolledCourses(w http.ResponseWriter, r *http.Request) {
	studentID := chi.URLParam(r, "studentId")
	if studentID == "" {
		http.Error(w, "missing studentId", http.StatusBadRequest)
		return
	}

	req := &lmspb.GetEnrolledCoursesRequest{StudentId: studentID}
	resp, err := h.service.GetEnrolledCourses(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp.Courses)
}

func (h *LMSHandler) GetCourseStudents(w http.ResponseWriter, r *http.Request) {
	courseID := chi.URLParam(r, "id")
	req := &lmspb.GetCourseStudentsRequest{CourseId: courseID}
	
	resp, err := h.service.GetCourseStudents(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
