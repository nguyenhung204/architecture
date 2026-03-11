# Bài 5: Go Application với Multi-stage Build
# Stage 1: Build ứng dụng Go
FROM golang:1.21-alpine AS builder

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy go.mod và tải dependencies
COPY go.mod .
RUN go mod download

# Copy mã nguồn và build binary
COPY . .
RUN go build -o server main.go

# Stage 2: Chạy binary trong image tối giản
FROM alpine:latest

# Cài đặt ca-certificates để hỗ trợ HTTPS (nếu cần)
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary từ stage builder
COPY --from=builder /app/server .

# Expose cổng 8080
EXPOSE 8080

# Chạy ứng dụng Go
CMD ["./server"]
