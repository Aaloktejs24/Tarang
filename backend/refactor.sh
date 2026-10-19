#!/bin/bash
set -e

FILE="services/user/internal/http/v1/user_handler.go"

gofmt -r '"unauthorized" -> errors.ErrUnauthorized' -w $FILE
gofmt -r '"user not found" -> errors.ErrUserNotFound' -w $FILE
gofmt -r '"username is required" -> errors.ErrUsernameIsRequired' -w $FILE
gofmt -r '"user_id, type, and mime are required" -> errors.ErrFileMetadataRequired' -w $FILE
gofmt -r '"unsupported file type" -> errors.ErrUnsupportedFileType' -w $FILE
gofmt -r '"failed to generate upload url" -> errors.ErrFailedToGenerateUploadURL' -w $FILE
gofmt -r '"invalid payload" -> errors.ErrInvalidPayload' -w $FILE
gofmt -r '"invalid user id" -> errors.ErrInvalidUserIdentifier' -w $FILE
gofmt -r '"failed to update profile pic" -> errors.ErrFailedToUpdateProfilePic' -w $FILE
gofmt -r '"failed to update banner" -> errors.ErrFailedToUpdateBanner' -w $FILE
gofmt -r '"failed to update bio" -> errors.ErrFailedToUpdateBio' -w $FILE
gofmt -r '"failed to update profile" -> errors.ErrFailedToUpdateProfile' -w $FILE
gofmt -r '"failed to fetch institutes" -> errors.ErrFailedToFetchInstitutes' -w $FILE
gofmt -r '"institute_type is required" -> errors.ErrInstituteTypeRequired' -w $FILE
gofmt -r '"established_year is invalid" -> errors.ErrEstablishedYearInvalid' -w $FILE
gofmt -r '"registration_number is required" -> errors.ErrRegistrationNumberRequired' -w $FILE
gofmt -r '"courses_offered is required" -> errors.ErrCoursesOfferedRequired' -w $FILE
gofmt -r '"counts cannot be negative" -> errors.ErrCountsCannotBeNegative' -w $FILE

echo "Done replacing strings in $FILE"
go build ./services/user/cmd/server
echo "Build succeeded!"
