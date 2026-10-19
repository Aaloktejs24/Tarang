#!/bin/bash
set -e

# Detect docker executable
DOCKER=$(command -v docker || echo "/usr/local/bin/docker")

echo "Starting full data wipe for Tarang Local Dev Environment..."

# 1. Clear PostgreSQL Databases
echo ""
echo "[PostgreSQL] Truncating tables in databases (preserving schema_migrations)..."
PG_DATABASES=("user_db" "auth_db" "admission_db" "tarang_auth")

for db in "${PG_DATABASES[@]}"; do
  echo "Clearing database: $db..."
  $DOCKER exec backend-postgres-1 psql -U tarang -d "$db" -q -c "
  DO \$\$ DECLARE
      r RECORD;
  BEGIN
      FOR r IN (
          SELECT tablename 
          FROM pg_tables 
          WHERE schemaname = 'public' 
            AND tablename != 'schema_migrations'
      ) LOOP
          EXECUTE 'TRUNCATE TABLE \"' || r.tablename || '\" RESTART IDENTITY CASCADE;';
      END LOOP;
  END \$\$;" 2>/dev/null || echo "Warning: Could not truncate $db (might not exist yet)"
done

# 2. Clear MongoDB Databases & Collections
echo ""
echo "[MongoDB] Clearing MongoDB collections..."
$DOCKER exec backend-mongodb-1 mongosh -u root -p password --quiet --eval '
  const clearDB = (dbName, collections) => {
    const db = db.getSiblingDB(dbName);
    collections.forEach(c => {
      const col = db.getCollection(c);
      if (col) {
        col.deleteMany({});
      }
    });
  };

  clearDB("lms_db", ["enrollments", "courses"]);
  clearDB("admissions_db", ["applications", "programs", "transactions"]);
  clearDB("tarang_user_db", ["academic_achievements"]);
  print("  ✔ MongoDB collections cleared (lms_db, admissions_db, tarang_user_db)");
' 2>/dev/null || echo "Warning: MongoDB clear failed or container not ready"

# 3. Clear Redis Cache
echo ""
echo "[Redis] Flushing cache..."
$DOCKER exec backend-redis-1 redis-cli flushall > /dev/null 2>&1 && echo "Redis cache flushed" || echo "Warning: Redis flush failed"

# 4. Clear RabbitMQ Queues
echo ""
echo "[RabbitMQ] Purging queues..."
$DOCKER exec backend-rabbitmq-1 bash -c '
  for q in $(rabbitmqctl list_queues -q name 2>/dev/null); do
    rabbitmqctl purge_queue "$q" > /dev/null 2>&1
  done
' 2>/dev/null && echo "RabbitMQ queues purged" || echo "Warning: RabbitMQ purge skipped"

# 5. Clear MinIO Storage Buckets
echo ""
echo "[MinIO] Clearing media and document buckets..."
$DOCKER exec backend-minio-1 /usr/bin/mc rm --recursive --force myminio/tarang-media-raw/ 2>/dev/null || true
$DOCKER exec backend-minio-1 /usr/bin/mc rm --recursive --force myminio/tarang-media-processed/ 2>/dev/null || true
$DOCKER exec backend-minio-1 /usr/bin/mc rm --recursive --force myminio/tarang-docs-raw/ 2>/dev/null || true
$DOCKER exec backend-minio-1 /usr/bin/mc rm --recursive --force myminio/tarang-docs-processed/ 2>/dev/null || true
echo "  ✔ MinIO buckets cleared"

# 6. Clear streaming worker temp files
$DOCKER exec backend-streaming-worker-1 rm -rf /tmp/raw /tmp/proc 2>/dev/null || true

echo ""
echo "All local development data cleared successfully!"

