#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Backend Services with Docker..."
/usr/local/bin/docker-compose down --remove-orphans
/usr/local/bin/docker-compose build
/usr/local/bin/docker-compose up -d --force-recreate

echo "⏳ Waiting for Postgres to be ready..."
until /usr/local/bin/docker exec backend-postgres-1 pg_isready -U tarang -d postgres; do
  sleep 2
done

echo "📂 Creating Databases (if not exist)..."
/usr/local/bin/docker exec backend-postgres-1 psql -U tarang -d postgres -c "CREATE DATABASE user_db;" || true
/usr/local/bin/docker exec backend-postgres-1 psql -U tarang -d postgres -c "CREATE DATABASE auth_db;" || true

echo "⚙️ Running Migrations..."
# Assuming 'migrate' tool is installed locally, otherwise you can use docker
# But we can also use the Makefile if it's setup
make migrate-up

echo "✅ Backend services are up and running!"
echo "📍 API Gateway (Krakend): http://localhost:8000"
echo "📍 Auth Service: http://localhost:8080"
echo "📍 Jaeger UI: http://localhost:16686"
echo "📍 RabbitMQ Management: http://localhost:15672"
echo "📍 Prometheus: http://localhost:9090"