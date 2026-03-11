# Bài 8: PostgreSQL tùy chỉnh với script khởi tạo
# Sử dụng PostgreSQL 15 làm base image
FROM postgres:15

# Thiết lập biến môi trường cho PostgreSQL
ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=secret123
ENV POSTGRES_DB=defaultdb

# Copy file SQL khởi tạo vào thư mục entrypoint
# PostgreSQL tự động chạy tất cả .sql, .sh trong thư mục này khi container khởi động lần đầu
COPY init.sql /docker-entrypoint-initdb.d/init.sql

# Expose cổng PostgreSQL mặc định
EXPOSE 5432
