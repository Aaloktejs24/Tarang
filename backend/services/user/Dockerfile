FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copy the go.mod and go.sum from the absolute root of the backend
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the entire backend source
COPY . .

# Build the user service
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/user-service ./services/user/cmd/server

# Final stage
FROM alpine:latest

WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/user-service .

# Copy migrations and config
COPY ./services/user/migrations ./migrations
COPY .env .env

EXPOSE 50051

CMD ["./user-service"]
