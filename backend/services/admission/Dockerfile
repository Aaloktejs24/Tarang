FROM golang:1.26-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /admission-service ./services/admission/cmd/server/main.go

FROM alpine:latest
WORKDIR /

COPY --from=builder /admission-service /admission-service

EXPOSE 50052
EXPOSE 8082

CMD ["/admission-service"]
