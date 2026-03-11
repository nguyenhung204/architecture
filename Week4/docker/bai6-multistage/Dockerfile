# Bài 6: Multi-stage Build cho Node.js

# ---- Stage 1: Build ----
# Dùng node:18 đầy đủ để cài đặt dependencies và build
FROM node:18 AS builder

WORKDIR /app

# Copy package.json và cài đặt tất cả dependencies (bao gồm devDependencies)
COPY package.json .
RUN npm install

# Copy mã nguồn và chạy bước build
COPY . .
RUN npm run build

# ---- Stage 2: Production ----
# Dùng node:18-alpine nhẹ hơn để chạy ứng dụng đã build
FROM node:18-alpine

WORKDIR /app

# Chỉ copy package.json và cài đặt production dependencies
COPY package.json .
RUN npm install --omit=dev

# Copy kết quả build từ stage 1
COPY --from=builder /app/app.js .

# Expose cổng 3000
EXPOSE 3000

# Chạy ứng dụng
CMD ["node", "app.js"]
