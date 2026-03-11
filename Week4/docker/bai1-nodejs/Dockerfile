# Bài 1: Node.js Hello Docker
# Sử dụng Node.js 18 làm base image
FROM node:18

# Thiết lập thư mục làm việc bên trong container
WORKDIR /app

# Copy file package.json vào container
COPY package.json .

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Expose cổng 3000
EXPOSE 3000

# Lệnh chạy ứng dụng
CMD ["node", "app.js"]
