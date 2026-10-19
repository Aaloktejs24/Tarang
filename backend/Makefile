# Database URLs (Sirf wahi jo zaroori hain)
USER_DB = postgresql://tarang:password@localhost:5432/user_db?sslmode=disable
AUTH_DB = postgresql://tarang:password@localhost:5432/auth_db?sslmode=disable

# Migration Paths
USER_PATH = ./services/user/migrations
AUTH_PATH = ./services/auth/migrations

# --- Migration Commands ---

# 1. Sabhi databases ko migrate up karne ke liye (With extensions)
migrate-up:
	@echo "--- Migrating User Database ---"
	docker exec backend-postgres-1 psql -U tarang -d user_db -c 'CREATE EXTENSION IF NOT EXISTS "citext"; CREATE EXTENSION IF NOT EXISTS "pgcrypto";'
	migrate -path $(USER_PATH) -database "$(USER_DB)" up
	
	@echo "--- Migrating Auth Database ---"
	docker exec backend-postgres-1 psql -U tarang -d auth_db -c 'CREATE EXTENSION IF NOT EXISTS "citext"; CREATE EXTENSION IF NOT EXISTS "pgcrypto";'
	migrate -path $(AUTH_PATH) -database "$(AUTH_DB)" up

# 2. Saare databases ko reset karne ke liye
migrate-reset:
	-migrate -path $(AUTH_PATH) -database "$(AUTH_DB)" down
	-migrate -path $(USER_PATH) -database "$(USER_DB)" down

# 3. Nayi migration files banane ke liye
migrate-new-user:
ifndef name
	$(error name is not set, usage: make migrate-new-user name=migration_name)
endif
	migrate create -ext sql -dir $(USER_PATH) -seq $(name)

migrate-new-auth:
ifndef name
	$(error name is not set, usage: make migrate-new-auth name=migration_name)
endif
	migrate create -ext sql -dir $(AUTH_PATH) -seq $(name)

# --- Troubleshooting Commands ---

# Dirty state fix karne ke liye (Usage: make force-user v=0)
force-user:
	migrate -path $(USER_PATH) -database "$(USER_DB)" force $(v)

force-auth:
	migrate -path $(AUTH_PATH) -database "$(AUTH_DB)" force $(v)

# Database drop aur recreate karne ke liye (Bilkul fresh start)
db-recreate:
	@echo "--- Recreating Databases in Docker ---"
	docker exec backend-postgres-1 psql -U tarang -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'user_db' AND pid <> pg_backend_pid();" || true
	docker exec backend-postgres-1 psql -U tarang -d postgres -c "DROP DATABASE IF EXISTS user_db;" || true
	docker exec backend-postgres-1 psql -U tarang -d postgres -c "CREATE DATABASE user_db;"
	docker exec backend-postgres-1 psql -U tarang -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'auth_db' AND pid <> pg_backend_pid();" || true
	docker exec backend-postgres-1 psql -U tarang -d postgres -c "DROP DATABASE IF EXISTS auth_db;" || true
	docker exec backend-postgres-1 psql -U tarang -d postgres -c "CREATE DATABASE auth_db;"
	@echo "Databases recreated. Now run 'make migrate-up'."