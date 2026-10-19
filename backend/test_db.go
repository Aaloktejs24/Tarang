package main

import (
	"context"
	"fmt"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	db, err := pgxpool.New(context.Background(), "postgresql://tarang:password@localhost:5432/tarang_auth?sslmode=disable")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	uid := "66bd5e10-e84a-4c96-b2f9-4a9ee44bedc7"
	var u struct {
		ID              uuid.UUID
		FullName        *string
		DOB             *string
		Gender          *string
		Bio             *string
		SocialLinks     map[string]string
		Skills          []string
		Recognitions    []string
		InstitutionName *string
		Location        *string
		Languages       []string
		Demographic     *string
	}
	u.ID = uuid.MustParse(uid)

	_, err = db.Exec(context.Background(), `
        UPDATE users 
        SET full_name=$1, dob=$2, gender=$3, bio=$4, 
            social_links=$5, skills=$6, recognitions=$7, 
            institution_name=$8, location=$9, languages=$10, demographic=$11,
            updated_at=NOW()
        WHERE id=$12
    `, u.FullName, u.DOB, u.Gender, u.Bio,
		u.SocialLinks, u.Skills, u.Recognitions, u.InstitutionName,
		u.Location, u.Languages, u.Demographic, u.ID)

	if err != nil {
		fmt.Println("ERROR:", err)
	} else {
		fmt.Println("SUCCESS")
	}
}
