#!/bin/sh

# Wait for MinIO to start
echo "Waiting for MinIO to be ready..."
sleep 5

# Configure MinIO client
mc alias set myminio http://localhost:9000 minioadmin minioadmin

# Set ILM Policy for Auto-Deletion on raw buckets
echo "Setting Lifecycle Policies (ILM) for 7-day expiry on raw buckets..."

# Delete objects after 7 days, and abort incomplete multipart uploads after 7 days
mc ilm add myminio/tarang-media-raw --expiry-days 7 --expire-multipart-days 7
mc ilm add myminio/tarang-docs-raw --expiry-days 7 --expire-multipart-days 7

echo "Lifecycle Policies configured successfully!"
