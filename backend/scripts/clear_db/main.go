package main

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5"
)

func main() {
	userDB := "postgresql://apple@localhost:5432/user_db?sslmode=disable"
	authDB := "postgresql://apple@localhost:5432/auth_db?sslmode=disable"

	if val := os.Getenv("USER_DATABASE_URL"); val != "" {
		userDB = val
	}
	if val := os.Getenv("AUTH_DATABASE_URL"); val != "" {
		authDB = val
	}

	ctx := context.Background()

	// 1. Clear User DB
	connUser, err := pgx.Connect(ctx, userDB)
	if err != nil {
		fmt.Printf("Error connecting to User DB: %v\n", err)
	} else {
		defer func() { _ = connUser.Close(ctx) }()
		_, err = connUser.Exec(ctx, "TRUNCATE users, user_passwords RESTART IDENTITY CASCADE;")
		if err != nil {
			fmt.Printf("Error truncating User DB: %v\n", err)
		} else {
			fmt.Println("User DB cleared successfully.")
		}
	}

	// 2. Clear Auth DB
	connAuth, err := pgx.Connect(ctx, authDB)
	if err != nil {
		fmt.Printf("Error connecting to Auth DB: %v\n", err)
	} else {
		defer func() { _ = connAuth.Close(ctx) }()
		_, err = connAuth.Exec(ctx, "TRUNCATE user_tokens, user_recovery_codes, auth_audits RESTART IDENTITY CASCADE;")
		if err != nil {
			fmt.Printf("Error truncating Auth DB: %v\n", err)
		} else {
			fmt.Println("Auth DB cleared successfully.")
		}
	}
}
