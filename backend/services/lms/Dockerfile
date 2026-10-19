FROM golang:1.25-alpine3.23 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY shared/ shared/
COPY proto/ proto/
COPY services/lms/ services/lms/

RUN CGO_ENABLED=0 GOOS=linux go build -o lms-service services/lms/cmd/server/main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/lms-service .

EXPOSE 8085
EXPOSE 50055

CMD ["./lms-service"]
