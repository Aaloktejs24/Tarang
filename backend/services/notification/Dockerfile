FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copy go.mod and go.sum from the root
COPY go.mod go.sum ./
RUN go mod download

# Copy the entire backend
COPY . .

# Build the worker
RUN go build -p 1 -o notification-worker ./services/notification/cmd/worker/main.go

# Final stage
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/notification-worker .

# Run the worker
CMD ["./notification-worker"]
