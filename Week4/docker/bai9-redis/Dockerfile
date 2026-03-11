# Bài 9: Redis với cấu hình tùy chỉnh
# Sử dụng redis:latest làm base image
FROM redis:latest

# Copy file cấu hình tùy chỉnh vào container
COPY redis.conf /usr/local/etc/redis/redis.conf

# Expose cổng Redis mặc định
EXPOSE 6379

# Chạy Redis với file cấu hình tùy chỉnh
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
