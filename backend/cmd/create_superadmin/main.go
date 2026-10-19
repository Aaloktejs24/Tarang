package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/alexedwards/argon2id"
	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load("../../.env"); err != nil {
		fmt.Println("Warning: No .env file found in backend root, relying on system env vars")
	}

	authDbURL := os.Getenv("AUTH_DATABASE_URL")
	userDbURL := os.Getenv("USER_DATABASE_URL")

	if authDbURL == "" || userDbURL == "" {
		log.Fatal("AUTH_DATABASE_URL and USER_DATABASE_URL must be set")
	}

	ctx := context.Background()

	// 1. Hash the password
	password := os.Getenv("SUPER_ADMIN_PASSWORD")
	if password == "" {
		log.Fatal("SUPER_ADMIN_PASSWORD must be set in .env")
	}

	hash, err := argon2id.CreateHash(password, argon2id.DefaultParams)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	// 2. Insert into auth DB (accounts table)
	authConn, err := pgx.Connect(ctx, authDbURL)
	if err != nil {
		log.Fatalf("Failed to connect to auth DB: %v", err)
	}
	defer authConn.Close(ctx)

	var accountID string
	err = authConn.QueryRow(ctx, `
		INSERT INTO accounts (username, email, password_hash, disabled)
		VALUES ($1, $2, $3, false)
		ON CONFLICT (email) DO UPDATE SET password_hash = $3
		RETURNING id
	`, "super_admin", "super_admin@tarang.com", hash).Scan(&accountID)

	if err != nil {
		log.Fatalf("Failed to insert/update account in auth DB: %v", err)
	}

	// 3. Insert into user DB (users table)
	userConn, err := pgx.Connect(ctx, userDbURL)
	if err != nil {
		log.Fatalf("Failed to connect to user DB: %v", err)
	}
	defer userConn.Close(ctx)

	_, err = userConn.Exec(ctx, `
		INSERT INTO users (id, username, email, role)
		VALUES ($1, $2, $3, 'super_admin')
		ON CONFLICT (email) DO UPDATE SET role = 'super_admin'
	`, accountID, "super_admin", "super_admin@tarang.com")

	if err != nil {
		log.Fatalf("Failed to insert/update user in user DB: %v", err)
	}

	fmt.Printf("Successfully created/updated super_admin account! ID: %s\n", accountID)
	fmt.Printf("Username: super_admin\nEmail: super_admin@tarang.com\nPassword: %s\n", password)
}
