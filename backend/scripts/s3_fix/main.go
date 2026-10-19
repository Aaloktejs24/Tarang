package main

import (
	"context"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

func main() {
	bucket := "tarang-user-service"
	region := "ap-south-1"
	accessKey := "AKIAX3DNHUKBQDF3BUVU"
	secretKey := "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"

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	)
	if err != nil {
		log.Fatalf("unable to load SDK config, %v", err)
	}

	client := s3.NewFromConfig(cfg)

	corsConfig := &s3.PutBucketCorsInput{
		Bucket: aws.String(bucket),
		CORSConfiguration: &types.CORSConfiguration{
			CORSRules: []types.CORSRule{
				{
					AllowedHeaders: []string{"*"},
					AllowedMethods: []string{"GET", "PUT", "POST", "DELETE", "HEAD"},
					AllowedOrigins: []string{"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://localhost:8080", "http://localhost:8000"},
					ExposeHeaders:  []string{"ETag", "Content-Type"},
					MaxAgeSeconds:  aws.Int32(3000),
				},
			},
		},
	}

	_, err = client.PutBucketCors(context.TODO(), corsConfig)
	if err != nil {
		log.Fatalf("failed to put bucket cors, %v", err)
	}

	fmt.Printf("Successfully updated CORS for bucket %s\n", bucket)
}
