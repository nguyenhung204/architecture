# Bài 7: Biến môi trường trong Dockerfile
# Sử dụng Python 3.9 làm base image
FROM python:3.9

# Khai báo biến môi trường mặc định
ENV APP_ENV=development

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy mã nguồn vào container
COPY app.py .

# Chạy script Python khi container khởi động
CMD ["python", "app.py"]
