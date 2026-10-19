FROM golang:1.26-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o viewer-api ./services/viewer-api/cmd/server

FROM alpine:latest
WORKDIR /root/

# Install tzdata and TeX Live packages for compilation
RUN apk add --no-cache tzdata texlive texlive-xetex texlive-luatex

COPY --from=builder /app/viewer-api .
EXPOSE 8081

CMD ["./viewer-api"]
