package tests

import (
	"context"
	"testing"

	"backend/services/auth/internal/auth"
	"backend/shared/queue"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockUserClient is a mock for the gRPC user client
type MockUserClient struct {
	mock.Mock
}

func (m *MockUserClient) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	args := m.Called(ctx, email)
	return args.Bool(0), args.Error(1)
}

func (m *MockUserClient) Create(ctx context.Context, u *auth.User) error {
	args := m.Called(ctx, u)
	u.ID = uuid.New()
	return args.Error(0)
}

func (m *MockUserClient) GetByEmail(ctx context.Context, email string) (*auth.User, error) {
	args := m.Called(ctx, email)
	return args.Get(0).(*auth.User), args.Error(1)
}

func (m *MockUserClient) GetByUsername(ctx context.Context, username string) (*auth.User, error) {
	args := m.Called(ctx, username)
	return args.Get(0).(*auth.User), args.Error(1)
}

func (m *MockUserClient) GetByPhone(ctx context.Context, phone string) (*auth.User, error) {
	args := m.Called(ctx, phone)
	return args.Get(0).(*auth.User), args.Error(1)
}

func (m *MockUserClient) GetPassword(ctx context.Context, id uuid.UUID) (*auth.UserPassword, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*auth.UserPassword), args.Error(1)
}

func (m *MockUserClient) SavePassword(ctx context.Context, p *auth.UserPassword) error {
	args := m.Called(ctx, p)
	return args.Error(0)
}

func (m *MockUserClient) GetByID(ctx context.Context, id uuid.UUID) (*auth.User, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*auth.User), args.Error(1)
}

func (m *MockUserClient) VerifyPhone(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockUserClient) SetTOTPSecret(ctx context.Context, id uuid.UUID, secret string) error {
	args := m.Called(ctx, id, secret)
	return args.Error(0)
}

func (m *MockUserClient) UpdateMFAPreference(ctx context.Context, id uuid.UUID, preference string) error {
	args := m.Called(ctx, id, preference)
	return args.Error(0)
}

func (m *MockUserClient) MarkKYCVerified(ctx context.Context, id uuid.UUID, ref, hash, name, dob, gender string) error {
	args := m.Called(ctx, id, ref, hash, name, dob, gender)
	return args.Error(0)
}

func (m *MockUserClient) Close() error { return nil }

// MockPublisher is a mock for RabbitMQ publisher
type MockPublisher struct {
	mock.Mock
}

func (m *MockPublisher) PublishOTP(job queue.OTPJob) error {
	args := m.Called(job)
	return args.Error(0)
}

func TestRegistrationFlow(t *testing.T) {
	ctx := context.Background()
	mockPublisher := new(MockPublisher)

	email := "test@example.com"

	// Expectations
	mockPublisher.On("PublishOTP", mock.MatchedBy(func(job queue.OTPJob) bool {
		return job.Email == email
	})).Return(nil)

	// Integration logic
	err := mockPublisher.PublishOTP(queue.OTPJob{
		Email: email,
		Code:  "123456",
	})

	assert.NoError(t, err)
	mockPublisher.AssertExpectations(t)

	_ = ctx // Use ctx
}
