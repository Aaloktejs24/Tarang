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

	conn, err := grpc.NewClient(
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



/////////////////////////////////////////////////////
//// GetByEmail
/////////////////////////////////////////////////////


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
		Username:      resp.Username,
		Role:          resp.Role,
		KycVerified:   resp.KycVerified,
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



/////////////////////////////////////////////////////
//// Create
/////////////////////////////////////////////////////

func (c *UserClient) Create(ctx context.Context, u *auth.User) error {

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	log.Printf("[AuthClient] Mapping Request - ID: %s, Role: %s, FullName: %s", u.ID.String(), u.Role, u.FullName)
	req := &userpb.CreateUserRequest{}
	req.Id = u.ID.String()
	req.Username = u.Username
	req.FullName = u.FullName
	req.Role = u.Role
	req.Phone = u.Phone
	req.Dob = u.DOB
	req.Gender = u.Gender
	req.Email = u.Email

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
		Username:      resp.Username,
		Role:          resp.Role,
		KycVerified:   resp.KycVerified,
		ProfilePicURL: resp.ProfilePicUrl,
		BannerURL:     resp.BannerUrl,
	}, nil
}

/////////////////////////////////////////////////////
//// VerifyPhone
/////////////////////////////////////////////////////



/////////////////////////////////////////////////////
//// SetTOTPSecret
/////////////////////////////////////////////////////



/////////////////////////////////////////////////////
//// UpdateMFAPreference
/////////////////////////////////////////////////////



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
