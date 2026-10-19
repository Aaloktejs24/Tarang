package client

import (
	"context"
	"log"
	"time"

	"backend/proto/userpb"
	auth "backend/services/auth/internal/auth"

	"github.com/google/uuid"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/protobuf/encoding/protojson"
)

type UserClient struct {
	conn   *grpc.ClientConn
	client userpb.UserServiceClient
}

func NewUserClient(addr string) (*UserClient, error) {

	conn, err := grpc.Dial(
		addr,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithStatsHandler(otelgrpc.NewClientHandler()),
	)

	if err != nil {
		return nil, err
	}

	return &UserClient{
		conn:   conn,
		client: userpb.NewUserServiceClient(conn),
	}, nil
}

func (c *UserClient) Close() error {
	return c.conn.Close()
}

/////////////////////////////////////////////////////
//// ExistsByEmail
/////////////////////////////////////////////////////

func (c *UserClient) ExistsByEmail(ctx context.Context, email string) (bool, error) {

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	resp, err := c.client.ExistsByEmail(ctx, &userpb.EmailRequest{
		Email: email,
	})

	if err != nil {
		return false, err
	}

	return resp.Exists, nil
}

/////////////////////////////////////////////////////
//// GetByEmail
/////////////////////////////////////////////////////

func (c *UserClient) GetByEmail(ctx context.Context, email string) (*auth.User, error) {

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	resp, err := c.client.GetByEmail(ctx, &userpb.EmailRequest{
		Email: email,
	})

	if err != nil {
		return nil, err
	}

	id, err := uuid.Parse(resp.Id)
	if err != nil {
		return nil, err
	}

	return &auth.User{
		ID:            id,
		Email:         resp.Email,
		Username:      resp.Username,
		Role:          resp.Role,
		Phone:         resp.Phone,
		PhoneVerified: resp.PhoneVerified,
		KycVerified:   resp.KycVerified,
		MFAPreference: resp.MfaPreference,
		TOTPSecret:    resp.TotpSecret,
		FullName:      resp.FullName,
		DOB:           resp.Dob,
		Gender:        resp.Gender,
		ProfilePicURL: resp.ProfilePicUrl,
		BannerURL:     resp.BannerUrl,
	}, nil
}

/////////////////////////////////////////////////////
//// GetByUsername
/////////////////////////////////////////////////////

func (c *UserClient) GetByUsername(ctx context.Context, username string) (*auth.User, error) {

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	resp, err := c.client.GetByUsername(ctx, &userpb.UsernameRequest{
		Username: username,
	})

	if err != nil {
		return nil, err
	}

	id, err := uuid.Parse(resp.Id)
	if err != nil {
		return nil, err
	}

	return &auth.User{
		ID:            id,
		Email:         resp.Email,
		Username:      resp.Username,
		Role:          resp.Role,
		Phone:         resp.Phone,
		PhoneVerified: resp.PhoneVerified,
		KycVerified:   resp.KycVerified,
		MFAPreference: resp.MfaPreference,
		TOTPSecret:    resp.TotpSecret,
		FullName:      resp.FullName,
		DOB:           resp.Dob,
		Gender:        resp.Gender,
		ProfilePicURL: resp.ProfilePicUrl,
		BannerURL:     resp.BannerUrl,
	}, nil
}

/////////////////////////////////////////////////////
//// GetByPhone
/////////////////////////////////////////////////////

func (c *UserClient) GetByPhone(ctx context.Context, phone string) (*auth.User, error) {

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	resp, err := c.client.GetByPhone(ctx, &userpb.PhoneRequest{
		Phone: phone,
	})

	if err != nil {
		return nil, err
	}

	id, err := uuid.Parse(resp.Id)
	if err != nil {
		return nil, err
	}

	return &auth.User{
		ID:            id,
		Email:         resp.Email,
		Username:      resp.Username,
		Role:          resp.Role,
		Phone:         resp.Phone,
		PhoneVerified: resp.PhoneVerified,
		KycVerified:   resp.KycVerified,
		MFAPreference: resp.MfaPreference,
		TOTPSecret:    resp.TotpSecret,
		FullName:      resp.FullName,
		DOB:           resp.Dob,
		Gender:        resp.Gender,
		ProfilePicURL: resp.ProfilePicUrl,
		BannerURL:     resp.BannerUrl,
	}, nil
}


/////////////////////////////////////////////////////
//// Create
/////////////////////////////////////////////////////

func (c *UserClient) Create(ctx context.Context, u *auth.User) error {

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	log.Printf("[AuthClient] Mapping Request - ID: %s, Role: %s, FullName: %s", u.ID.String(), u.Role, u.FullName)
	req := &userpb.CreateUserRequest{}
	req.Id = u.ID.String()
	req.Email = u.Email
	req.Username = u.Username
	req.FullName = u.FullName
	req.Role = u.Role

	jsonBytes, _ := protojson.Marshal(req)
	log.Printf("[AuthClient] FINAL JSON TO SEND: %s", string(jsonBytes))

	resp, err := c.client.CreateUser(ctx, req)

	if err != nil {
		return err
	}

	id, err := uuid.Parse(resp.Id)
	if err != nil {
		return err
	}

	u.ID = id

	return nil
}



/////////////////////////////////////////////////////
//// GetByID
/////////////////////////////////////////////////////

func (c *UserClient) GetByID(ctx context.Context, id uuid.UUID) (*auth.User, error) {

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	resp, err := c.client.GetByID(ctx, &userpb.UserIDRequest{
		UserId: id.String(),
	})

	if err != nil {
		return nil, err
	}

	return &auth.User{
		ID:            id,
		Email:         resp.Email,
		Username:      resp.Username,
		Role:          resp.Role,
		Phone:         resp.Phone,
		PhoneVerified: resp.PhoneVerified,
		KycVerified:   resp.KycVerified,
		MFAPreference: resp.MfaPreference,
		TOTPSecret:    resp.TotpSecret,
		ProfilePicURL: resp.ProfilePicUrl,
		BannerURL:     resp.BannerUrl,
	}, nil
}

/////////////////////////////////////////////////////
//// VerifyPhone
/////////////////////////////////////////////////////

func (c *UserClient) VerifyPhone(ctx context.Context, id uuid.UUID) error {

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	_, err := c.client.VerifyPhone(ctx, &userpb.UserIDRequest{
		UserId: id.String(),
	})

	return err
}

/////////////////////////////////////////////////////
//// SetTOTPSecret
/////////////////////////////////////////////////////

func (c *UserClient) SetTOTPSecret(ctx context.Context, id uuid.UUID, secret string) error {

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	_, err := c.client.SetTOTPSecret(ctx, &userpb.TOTPSecretRequest{
		UserId: id.String(),
		Secret: secret,
	})

	return err
}

/////////////////////////////////////////////////////
//// UpdateMFAPreference
/////////////////////////////////////////////////////

func (c *UserClient) UpdateMFAPreference(ctx context.Context, id uuid.UUID, preference string) error {

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	_, err := c.client.UpdateMFAPreference(ctx, &userpb.MFAPreferenceRequest{
		UserId:     id.String(),
		Preference: preference,
	})

	return err
}

// MarkKYCVerified updates the KYC details
func (c *UserClient) MarkKYCVerified(ctx context.Context, id uuid.UUID, referenceID, aadhaarHash, fullName, dob, gender string) error {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	_, err := c.client.MarkKYCVerified(ctx, &userpb.MarkKYCVerifiedRequest{
		UserId:      id.String(),
		ReferenceId: referenceID,
		AadhaarHash: aadhaarHash,
		FullName:    fullName,
		Dob:         dob,
		Gender:      gender,
	})

	return err
}

func (c *UserClient) UpdateProfilePic(ctx context.Context, id uuid.UUID, url string) error {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	_, err := c.client.UpdateProfilePic(ctx, &userpb.UpdateImageRequest{
		UserId: id.String(),
		Url:    url,
	})
	return err
}

func (c *UserClient) UpdateBanner(ctx context.Context, id uuid.UUID, url string) error {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	_, err := c.client.UpdateBanner(ctx, &userpb.UpdateImageRequest{
		UserId: id.String(),
		Url:    url,
	})
	return err
}
