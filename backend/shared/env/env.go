package env

import (
	"log"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

// Load attempts to find and load the .env file by travelling up the directory tree.
func Load() {
	// 1. Try current directory
	if err := godotenv.Load(); err == nil {
		log.Println("Loaded .env from current directory")
		return
	}

	// 2. Travel up until we find .env or reach root
	dir, err := os.Getwd()
	if err != nil {
		log.Println("Error getting working directory:", err)
		return
	}

	for {
		path := filepath.Join(dir, ".env")
		if _, err := os.Stat(path); err == nil {
			if err := godotenv.Load(path); err == nil {
				log.Println("Loaded .env from:", path)
				return
			}
		}

		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}

	log.Println("No .env file found in directory tree, using system environment")
}
