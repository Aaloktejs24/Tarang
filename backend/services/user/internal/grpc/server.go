package grpc

import (
	"context"

	"backend/proto/userpb"
	"backend/services/user/internal/user"

	"google.golang.org/protobuf/types/known/emptypb"

	"github.com/google/uuid"
)

type Server struct {
	userpb.UnimplementedUserServiceServer
	service *user.Service
}

func NewServer(s *user.Service) *Server {
	return &Server{
		service: s,
	}
}

func mapToResponse(u *user.User) *userpb.UserResponse {
	

	

	fullName := ""
	if u.FullName != nil {
		fullName = *u.FullName
	}

	institutionName := ""
	if u.InstitutionName != nil {
		institutionName = *u.InstitutionName
	}

	dob := ""
	if u.DOB != nil {
		dob = u.DOB.Format("2006-01-02")
	}

	gender := ""
	if u.Gender != nil {
		gender = *u.Gender
	}

	profilePicURL := ""
	if u.ProfilePicURL != nil {
		profilePicURL = *u.ProfilePicURL
	}

	bannerURL := ""
	if u.BannerURL != nil {
		bannerURL = *u.BannerURL
	}

	bio := ""
	if u.Bio != nil {
		bio = *u.Bio
	}

	location := ""
	if u.Location != nil {
		location = *u.Location
	}

	demographic := ""
	if u.Demographic != nil {
		demographic = *u.Demographic
	}

	isCompleted := fullName != "" && bio != "" && location != "" && len(u.Languages) > 0 && demographic != ""

	return &userpb.UserResponse{
		Id:            u.ID.String(),
		Username:      u.Username,
		KycVerified:   u.KycVerifiedAt != nil,
		Role:          u.Role,
		FullName:      fullName,
		Dob:           dob,
		Gender:        gender,
		ProfilePicUrl: profilePicURL,
		BannerUrl:     bannerURL,
		Bio:           bio,
		SocialLinks:   u.SocialLinks,
		Skills:        u.Skills,
		Recognitions:  u.Recognitions,
		InstitutionName: institutionName,
		IsProfileCompleted: isCompleted,
		Location:      location,
		Languages:     u.Languages,
		Demographic:   demographic,
			}
}



/////////////////////////////////////////////////////
//// CreateUser
/////////////////////////////////////////////////////

func (s *Server) CreateUser(ctx context.Context, req *userpb.CreateUserRequest) (*userpb.UserResponse, error) {
	u, err := s.service.Create(ctx, req.Id, req.Username, req.FullName, req.Role, req.Phone, req.Dob, req.Gender)
	if err != nil {
		return nil, err
	}

	return mapToResponse(u), nil
}




// SetTOTPSecret

// UpdateMFAPreference

/////////////////////////////////////////////////////
//// GetByID
/////////////////////////////////////////////////////

func (s *Server) GetByID(ctx context.Context, req *userpb.UserIDRequest) (*userpb.UserResponse, error) {

	id, err := uuid.Parse(req.UserId)
	if err != nil {
		return nil, err
	}

	u, err := s.service.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return mapToResponse(u), nil
}

/////////////////////////////////////////////////////


// MarkKYCVerified updates the KYC status of the user
func (s *Server) MarkKYCVerified(ctx context.Context, req *userpb.MarkKYCVerifiedRequest) (*emptypb.Empty, error) {
	uid, err := uuid.Parse(req.UserId)
	if err != nil {
		return nil, err
	}

	err = s.service.MarkKYCVerified(ctx, uid, req.ReferenceId, req.AadhaarHash, req.FullName, req.Dob, req.Gender)
	if err != nil {
		return nil, err
	}

	return &emptypb.Empty{}, nil
}

func (s *Server) UpdateProfilePic(ctx context.Context, req *userpb.UpdateImageRequest) (*emptypb.Empty, error) {
	uid, err := uuid.Parse(req.UserId)
	if err != nil {
		return nil, err
	}

	if err := s.service.UpdateProfilePic(ctx, uid, req.Url); err != nil {
		return nil, err
	}

	return &emptypb.Empty{}, nil
}

func (s *Server) UpdateBanner(ctx context.Context, req *userpb.UpdateImageRequest) (*emptypb.Empty, error) {
	uid, err := uuid.Parse(req.UserId)
	if err != nil {
		return nil, err
	}

	if err := s.service.UpdateBanner(ctx, uid, req.Url); err != nil {
		return nil, err
	}

	return &emptypb.Empty{}, nil
}

func (s *Server) UpdateBio(ctx context.Context, req *userpb.UpdateBioRequest) (*emptypb.Empty, error) {
	uid, err := uuid.Parse(req.UserId)
	if err != nil {
		return nil, err
	}

	if err := s.service.UpdateBio(ctx, uid, req.Bio); err != nil {
		return nil, err
	}

	return &emptypb.Empty{}, nil
}

func (s *Server) UpdateProfile(ctx context.Context, req *userpb.UpdateProfileRequest) (*emptypb.Empty, error) {
	uid, err := uuid.Parse(req.UserId)
	if err != nil {
		return nil, err
	}

	if err := s.service.UpdateProfile(ctx, uid, req.FullName, "", "", req.Bio, req.SocialLinks, req.Skills, req.Recognitions, req.Location, req.Languages, req.Demographic, req.InstitutionName, nil); err != nil {
		return nil, err
	}

	if err := s.service.UpdateInstitution(ctx, uid, req.InstitutionName); err != nil {
		return nil, err
	}

	return &emptypb.Empty{}, nil
}

func (s *Server) CreateInstitute(ctx context.Context, req *userpb.CreateInstituteRequest) (*userpb.InstituteResponse, error) {
	ownerID, err := uuid.Parse(req.OwnerUserId)
	if err != nil {
		return nil, err
	}

	i, err := s.service.CreateInstitute(ctx, req.Name, req.GetInstituteType(), int(req.EstablishedYear), ownerID)
	if err != nil {
		return nil, err
	}

	estYear := int32(0)
	if i.EstablishedYear != nil {
		estYear = int32(*i.EstablishedYear)
	}

	return &userpb.InstituteResponse{
		Institute: &userpb.Institute{
			Id: i.ID.String(),
			Name: i.Name,
			InstituteType: ptrToString(i.InstituteType),
			EstablishedYear: estYear,
			RegistrationNumber: ptrToString(i.RegistrationNumber),
			WebsiteUrl: ptrToString(i.WebsiteURL),
			TaxId: ptrToString(i.TaxID),
			ShortDescription: ptrToString(i.ShortDescription),
		},
	}, nil
}

func (s *Server) GetInstitute(ctx context.Context, req *userpb.InstituteIDRequest) (*userpb.InstituteResponse, error) {
	id, err := uuid.Parse(req.InstituteId)
	if err != nil {
		return nil, err
	}

	i, err := s.service.GetInstitute(ctx, id)
	if err != nil {
		return nil, err
	}

	estYear := int32(0)
	if i.EstablishedYear != nil {
		estYear = int32(*i.EstablishedYear)
	}

	return &userpb.InstituteResponse{
		Institute: &userpb.Institute{
			Id: i.ID.String(),
			Name: i.Name,
			InstituteType: ptrToString(i.InstituteType),
			EstablishedYear: estYear,
			RegistrationNumber: ptrToString(i.RegistrationNumber),
			WebsiteUrl: ptrToString(i.WebsiteURL),
			TaxId: ptrToString(i.TaxID),
			ShortDescription: ptrToString(i.ShortDescription),
		},
	}, nil
}

func ptrToString(p *string) string {
	if p == nil {
		return ""
	}
	return *p
}
