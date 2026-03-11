# Bài 3: React Application
# Sử dụng node:18-alpine làm base image

# ---- Stage Build ----
FROM node:18-alpine AS build

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package.json .
RUN npm install

# Copy toàn bộ mã nguồn và build
COPY . .
RUN npm run build

# ---- Stage Serve ----
FROM nginx:alpine

# Copy kết quả build sang nginx để phục vụ trang web
COPY --from=build /app/build /usr/share/nginx/html

# Expose cổng 80
EXPOSE 80

# Chạy nginx
CMD ["nginx", "-g", "daemon off;"]
