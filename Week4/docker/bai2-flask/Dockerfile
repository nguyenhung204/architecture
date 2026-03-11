# Bài 2: Python Flask
# Sử dụng Python 3.9 làm base image
FROM python:3.9

# Thiết lập thư mục làm việc bên trong container
WORKDIR /app

# Copy file requirements.txt vào container
COPY requirements.txt .

# Cài đặt các thư viện Python
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ mã nguồn vào container
COPY . .

# Expose cổng 5000
EXPOSE 5000

# Lệnh chạy ứng dụng Flask
CMD ["python", "app.py"]
