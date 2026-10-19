#!/bin/bash

# Exit on error
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
cd "$BACKEND_DIR"

# Detect docker and docker-compose
DOCKER=$(command -v docker || echo "/usr/local/bin/docker")
if command -v docker-compose &> /dev/null; then
  COMPOSE="docker-compose"
else
  COMPOSE="$DOCKER compose"
fi

echo "Starting Backend Services with Docker..."
$COMPOSE down --remove-orphans
echo "Building backend services sequentially to prevent memory exhaustion..."
SERVICES=(
  auth-service
  user-service
  admission-service
  lms-service
  notification-service
  streaming-api
  streaming-worker
  viewer-api
  viewer-worker
)
for service in "${SERVICES[@]}"; do
  echo "--> Building $service..."
  $COMPOSE build "$service"
done
$COMPOSE up -d --force-recreate

echo "Waiting for Postgres to be ready..."
until $DOCKER exec backend-postgres-1 pg_isready -U tarang -d postgres; do
  sleep 2
done

echo "Creating Databases (if not exist)..."
$DOCKER exec backend-postgres-1 psql -U tarang -d postgres -c "CREATE DATABASE user_db;" || true
$DOCKER exec backend-postgres-1 psql -U tarang -d postgres -c "CREATE DATABASE auth_db;" || true
$DOCKER exec backend-postgres-1 psql -U tarang -d postgres -c "CREATE DATABASE admission_db;" || true

echo "Running Migrations..."
# Assuming 'migrate' tool is installed locally, otherwise you can use docker
# But we can also use the Makefile if it's setup
make migrate-up

echo "Backend services are up and running!"
echo "API Gateway (Krakend): http://localhost:8000"
echo "Auth Service: http://localhost:8080"
echo "Jaeger UI: http://localhost:16686"
echo "RabbitMQ Management: http://localhost:15672"
echo "Prometheus: http://localhost:9090"