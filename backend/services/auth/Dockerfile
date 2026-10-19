FROM golang:1.25-alpine3.23 AS builder

WORKDIR /app

# Copy the go.mod and go.sum from the absolute root of the backend
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the entire backend source
COPY . .

# Build the auth service
RUN CGO_ENABLED=0 GOOS=linux GOMAXPROCS=1 go build -p 1 -o /app/auth-service ./services/auth/cmd/server

# Final stage
FROM alpine:latest

WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/auth-service .

# Copy config

EXPOSE 8080

CMD ["./auth-service"]
