package lms

import (
	"context"
	"fmt"

	"backend/proto/lmspb"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository interface {
	CreateCourse(ctx context.Context, course *lmspb.Course) error
	GetCourseByID(ctx context.Context, id string) (*lmspb.Course, error)
	ListCourses(ctx context.Context) ([]*lmspb.Course, error)
	UpdateCourse(ctx context.Context, course *lmspb.Course) error
	DeleteCourse(ctx context.Context, id string) error
	EnrollCourse(ctx context.Context, courseID string, studentID string, studentName string, studentEmail string, profilePic string) error
	GetCourseStudents(ctx context.Context, courseID string) ([]*lmspb.Student, error)
	GetEnrolledCourses(ctx context.Context, studentID string) ([]*lmspb.Course, error)
}

type repository struct {
	db *mongo.Database
}

type Enrollment struct {
	CourseID     string `bson:"course_id"`
	StudentID    string `bson:"student_id"`
	StudentName  string `bson:"student_name"`
	StudentEmail string `bson:"student_email"`
	ProfilePic   string `bson:"profile_pic"`
	EnrolledAt   string `bson:"enrolled_at"`
}

func NewRepository(db *mongo.Database) Repository {
	return &repository{db: db}
}

func (r *repository) CreateCourse(ctx context.Context, course *lmspb.Course) error {
	col := r.db.Collection("courses")
	_, err := col.InsertOne(ctx, course)
	return err
}

func (r *repository) GetCourseByID(ctx context.Context, id string) (*lmspb.Course, error) {
	col := r.db.Collection("courses")
	var course lmspb.Course
	err := col.FindOne(ctx, bson.M{"id": id}).Decode(&course)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("course not found")
		}
		return nil, err
	}
	return &course, nil
}

func (r *repository) ListCourses(ctx context.Context) ([]*lmspb.Course, error) {
	col := r.db.Collection("courses")
	cursor, err := col.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var courses []*lmspb.Course
	if err = cursor.All(ctx, &courses); err != nil {
		return nil, err
	}
	if courses == nil {
		courses = []*lmspb.Course{}
	}
	return courses, nil
}

func (r *repository) UpdateCourse(ctx context.Context, course *lmspb.Course) error {
	col := r.db.Collection("courses")
	filter := bson.M{"id": course.Id}
	update := bson.M{"$set": course}
	
	res, err := col.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return fmt.Errorf("course not found")
	}
	return nil
}

func (r *repository) DeleteCourse(ctx context.Context, id string) error {
	col := r.db.Collection("courses")
	_, err := col.DeleteOne(ctx, bson.M{"id": id})
	return err
}

func (r *repository) EnrollCourse(ctx context.Context, courseID string, studentID string, studentName string, studentEmail string, profilePic string) error {
	col := r.db.Collection("enrollments")
	filter := bson.M{"course_id": courseID, "student_id": studentID}
	count, _ := col.CountDocuments(ctx, filter)
	if count == 0 {
		_, err := col.InsertOne(ctx, Enrollment{
			CourseID:     courseID,
			StudentID:    studentID,
			StudentName:  studentName,
			StudentEmail: studentEmail,
			ProfilePic:   profilePic,
			EnrolledAt:   "now",
		})
		return err
	}
	return nil
}

func (r *repository) GetEnrolledCourses(ctx context.Context, studentID string) ([]*lmspb.Course, error) {
	col := r.db.Collection("enrollments")
	cursor, err := col.Find(ctx, bson.M{"student_id": studentID})
	if err != nil {
		return nil, err
	}
	var enrollments []Enrollment
	if err = cursor.All(ctx, &enrollments); err != nil {
		return nil, err
	}
	var courses []*lmspb.Course
	for _, e := range enrollments {
		course, _ := r.GetCourseByID(ctx, e.CourseID)
		if course != nil {
			courses = append(courses, course)
		}
	}
	if courses == nil {
		courses = []*lmspb.Course{}
	}
	return courses, nil
}

func (r *repository) GetCourseStudents(ctx context.Context, courseID string) ([]*lmspb.Student, error) {
	col := r.db.Collection("enrollments")
	cursor, err := col.Find(ctx, bson.M{"course_id": courseID})
	if err != nil {
		return nil, err
	}
	var enrollments []Enrollment
	if err = cursor.All(ctx, &enrollments); err != nil {
		return nil, err
	}
	var students []*lmspb.Student
	for _, e := range enrollments {
		students = append(students, &lmspb.Student{
			Id:    e.StudentID,
			Name:  e.StudentName,
			Email: e.StudentEmail,
			ProfilePic: e.ProfilePic,
		})
	}
	if students == nil {
		students = []*lmspb.Student{}
	}
	return students, nil
}
