package grpc

import (
	"context"
	"log"

	"backend/proto/userpb"
	"backend/services/user/internal/user"

	"google.golang.org/protobuf/types/known/emptypb"

	"github.com/google/uuid"
	"google.golang.org/protobuf/encoding/protojson"
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
	totpSecret := ""
	if u.TOTPSecret != nil {
		totpSecret = *u.TOTPSecret
	}

	phone := ""
	if u.Phone != nil {
		phone = *u.Phone
	}

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
		dob = *u.DOB
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
		Email:         u.Email,
		Username:      u.Username,
		Phone:         phone,
		PhoneVerified: u.PhoneVerifiedAt != nil,
		KycVerified:   u.KycVerifiedAt != nil,
		MfaPreference: u.MFAPreference,
		TotpSecret:    totpSecret,
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
		InstituteProfile: mapInstituteProfileToProto(u.InstituteProfile),
	}
}

func mapInstituteProfileToProto(p *user.InstituteProfile) *userpb.InstituteProfile {
	if p == nil {
		return nil
	}
	strVal := func(s *string) string { if s == nil { return "" }; return *s }
	intVal := func(i *int32) int32 { if i == nil { return 0 }; return *i }

	return &userpb.InstituteProfile{
		InstituteType:             strVal(p.InstituteType),
		EstablishedYear:           intVal(p.EstablishedYear),
		RegistrationNumber:        strVal(p.RegistrationNumber),
		PrimaryContactName:        strVal(p.PrimaryContactName),
		PrimaryContactDesignation: strVal(p.PrimaryContactDesignation),
		OfficialPhone:             strVal(p.OfficialPhone),
		OfficialEmail:             strVal(p.OfficialEmail),
		WebsiteUrl:                strVal(p.WebsiteURL),
		AlternateContact:          strVal(p.AlternateContact),
		CoursesOffered:            string(p.CoursesOffered),
		EducationLevels:           string(p.EducationLevels),
		StudentCount:              intVal(p.StudentCount),
		FacultyCount:              intVal(p.FacultyCount),
		CampusType:                strVal(p.CampusType),
		OperatingHours:            strVal(p.OperatingHours),
		AccreditationDocs:         string(p.AccreditationDocs),
		LicenseCertificateUrl:     strVal(p.LicenseCertificateURL),
		TaxId:                     strVal(p.TaxID),
		Certifications:            string(p.Certifications),
		BankAccountName:           strVal(p.BankAccountName),
		BankAccountNumber:         strVal(p.BankAccountNumber),
		BankIfsc:                  strVal(p.BankIFSC),
		BillingAddress:            strVal(p.BillingAddress),
		ShortDescription:          strVal(p.ShortDescription),
		Facilities:                string(p.Facilities),
		SocialLinks:               string(p.SocialLinks),
		AuthorizedSignatoryName:   strVal(p.AuthorizedSignatoryName),
	}
}

func mapInstituteProfileToModel(p *userpb.InstituteProfile) *user.InstituteProfile {
	if p == nil {
		return nil
	}
	strPtr := func(s string) *string { if s == "" { return nil }; return &s }
	intPtr := func(i int32) *int32 { if i == 0 { return nil }; return &i }

	return &user.InstituteProfile{
		InstituteType:             strPtr(p.InstituteType),
		EstablishedYear:           intPtr(p.EstablishedYear),
		RegistrationNumber:        strPtr(p.RegistrationNumber),
		PrimaryContactName:        strPtr(p.PrimaryContactName),
		PrimaryContactDesignation: strPtr(p.PrimaryContactDesignation),
		OfficialPhone:             strPtr(p.OfficialPhone),
		OfficialEmail:             strPtr(p.OfficialEmail),
		WebsiteURL:                strPtr(p.WebsiteUrl),
		AlternateContact:          strPtr(p.AlternateContact),
		CoursesOffered:            []byte(p.CoursesOffered),
		EducationLevels:           []byte(p.EducationLevels),
		StudentCount:              intPtr(p.StudentCount),
		FacultyCount:              intPtr(p.FacultyCount),
		CampusType:                strPtr(p.CampusType),
		OperatingHours:            strPtr(p.OperatingHours),
		AccreditationDocs:         []byte(p.AccreditationDocs),
		LicenseCertificateURL:     strPtr(p.LicenseCertificateUrl),
		TaxID:                     strPtr(p.TaxId),
		Certifications:            []byte(p.Certifications),
		BankAccountName:           strPtr(p.BankAccountName),
		BankAccountNumber:         strPtr(p.BankAccountNumber),
		BankIFSC:                  strPtr(p.BankIfsc),
		BillingAddress:            strPtr(p.BillingAddress),
		ShortDescription:          strPtr(p.ShortDescription),
		Facilities:                []byte(p.Facilities),
		SocialLinks:               []byte(p.SocialLinks),
		AuthorizedSignatoryName:   strPtr(p.AuthorizedSignatoryName),
	}
}

/////////////////////////////////////////////////////
//// ExistsByEmail
/////////////////////////////////////////////////////

func (s *Server) ExistsByEmail(ctx context.Context, req *userpb.EmailRequest) (*userpb.ExistsResponse, error) {

	exists, err := s.service.ExistsByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}

	return &userpb.ExistsResponse{
		Exists: exists,
	}, nil
}

/////////////////////////////////////////////////////
//// GetByEmail
/////////////////////////////////////////////////////

func (s *Server) GetByEmail(ctx context.Context, req *userpb.EmailRequest) (*userpb.UserResponse, error) {

	u, err := s.service.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}

	return mapToResponse(u), nil
}

/////////////////////////////////////////////////////
//// GetByUsername
/////////////////////////////////////////////////////

func (s *Server) GetByUsername(ctx context.Context, req *userpb.UsernameRequest) (*userpb.UserResponse, error) {

	u, err := s.service.GetUserByEmailOrUsername(ctx, req.Username)
	if err != nil {
		return nil, err
	}

	return mapToResponse(u), nil
}

/////////////////////////////////////////////////////
//// GetByPhone
/////////////////////////////////////////////////////

func (s *Server) GetByPhone(ctx context.Context, req *userpb.PhoneRequest) (*userpb.UserResponse, error) {

	u, err := s.service.GetUserByEmailOrPhone(ctx, req.Phone)
	if err != nil {
		return nil, err
	}

	return mapToResponse(u), nil
}

/////////////////////////////////////////////////////
//// CreateUser
/////////////////////////////////////////////////////

func (s *Server) CreateUser(ctx context.Context, req *userpb.CreateUserRequest) (*userpb.UserResponse, error) {
	jsonBytes, _ := protojson.Marshal(req)
	log.Printf("[gRPC] CreateUser - INCOMING JSON: %s", string(jsonBytes))

	if req.Id == "" {
		log.Printf("[gRPC] ERROR: Received empty ID in CreateUser")
	}
	u, err := s.service.Create(ctx, req.Id, req.Email, req.Username, req.FullName, req.Role)
	if err != nil {
		return nil, err
	}

	return mapToResponse(u), nil
}



// SetTOTPSecret
func (s *Server) SetTOTPSecret(
	ctx context.Context,
	req *userpb.TOTPSecretRequest,
) (*emptypb.Empty, error) {

	id, err := uuid.Parse(req.UserId)
	if err != nil {
		return nil, err
	}

	err = s.service.SetTOTPSecret(ctx, id, req.Secret)
	if err != nil {
		return nil, err
	}

	return &emptypb.Empty{}, nil
}

// UpdateMFAPreference
func (s *Server) UpdateMFAPreference(
	ctx context.Context,
	req *userpb.MFAPreferenceRequest,
) (*emptypb.Empty, error) {

	id, err := uuid.Parse(req.UserId)
	if err != nil {
		return nil, err
	}

	err = s.service.UpdateMFAPreference(ctx, id, req.Preference)
	if err != nil {
		return nil, err
	}

	return &emptypb.Empty{}, nil
}

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
//// VerifyPhone
/////////////////////////////////////////////////////

func (s *Server) VerifyPhone(ctx context.Context, req *userpb.UserIDRequest) (*emptypb.Empty, error) {
	err := s.service.VerifyPhone(ctx, req.UserId)
	if err != nil {
		return nil, err
	}

	return &emptypb.Empty{}, nil
}

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

	if err := s.service.UpdateProfile(ctx, uid, req.FullName, "", "", req.Bio, req.SocialLinks, req.Skills, req.Recognitions, req.Location, req.Languages, req.Demographic, req.InstitutionName, mapInstituteProfileToModel(req.InstituteProfile)); err != nil {
		return nil, err
	}

	if err := s.service.UpdateInstitution(ctx, uid, req.InstitutionName); err != nil {
		return nil, err
	}

	return &emptypb.Empty{}, nil
}
