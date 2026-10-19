FROM golang:1.26-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/streaming-api ./services/streaming-api/cmd/server

FROM gcr.io/distroless/static-debian12
WORKDIR /
COPY --from=builder /app/streaming-api /streaming-api
EXPOSE 8083
CMD ["/streaming-api"]
