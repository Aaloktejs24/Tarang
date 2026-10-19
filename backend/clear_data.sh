#!/bin/bash
echo "Clearing Databases..."
/usr/local/bin/docker exec backend-postgres-1 psql -U tarang -d user_db -c "TRUNCATE users RESTART IDENTITY CASCADE;"
/usr/local/bin/docker exec backend-postgres-1 psql -U tarang -d auth_db -c "TRUNCATE accounts, registration_sessions, user_tokens, user_recovery_codes, auth_audits RESTART IDENTITY CASCADE;"
/usr/local/bin/docker exec backend-postgres-1 psql -U tarang -d admission_db -c "TRUNCATE admission_programs, admission_stages RESTART IDENTITY CASCADE;"
echo "Clearing Redis Cache..."
/usr/local/bin/docker exec backend-redis-1 redis-cli flushall
echo "All data cleared successfully!"
