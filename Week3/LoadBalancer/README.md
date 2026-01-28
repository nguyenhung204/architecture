# Load Balancer Demo với Node.js và Nginx

## Cấu trúc dự án
- `server1.js`: Server chạy trên port 3000
- `server2.js`: Server chạy trên port 3001
- `nginx.conf`: Cấu hình Nginx load balancing trên port 4000 (chạy local)
- `nginx-docker.conf`: Cấu hình Nginx cho Docker
- `docker-compose.yml`: Orchestrate các services
- `Dockerfile`: Build Node.js servers

## Cách chạy với Docker (Khuyến nghị)

### Chạy tất cả bằng Docker Compose
```bash
docker-compose up --build
```

Hoặc chạy ở chế độ detached (background):
```bash
docker-compose up -d --build
```

### Test load balancing
Truy cập `http://localhost:4000` hoặc dùng curl:
```bash
curl http://localhost:4000
curl http://localhost:4000
curl http://localhost:4000
```

Bạn sẽ thấy response luân phiên từ Server 1 và Server 2.

### Xem logs
```bash
# Xem logs tất cả services
docker-compose logs -f

# Xem logs từng service
docker-compose logs -f server1
docker-compose logs -f server2
docker-compose logs -f nginx
```

### Dừng và xóa containers
```bash
docker-compose down
```

---

## Cách chạy trực tiếp (không dùng Docker)

### 1. Cài đặt dependencies (nếu muốn chạy cả 2 server cùng lúc)
```bash
npm install
```

### 2. Chạy các server

**Cách 1: Chạy từng server riêng biệt (mở 2 terminal)**
```bash
# Terminal 1
node server1.js

# Terminal 2
node server2.js
```

**Cách 2: Chạy cả 2 server cùng lúc (sau khi cài đặt dependencies)**
```bash
npm start
```

### 3. Chạy Nginx với cấu hình load balancing

Đảm bảo bạn đã cài đặt Nginx, sau đó chạy:
```bash
nginx -c "d:\Thiết kế kiến trúc\Week3\LoadBalancer\nginx.conf"
```

Hoặc trên Windows:
```bash
nginx.exe -c "d:/Thiết kế kiến trúc/Week3/LoadBalancer/nginx.conf"
```

### 4. Test load balancing

Mở trình duyệt hoặc dùng curl để gửi request đến:
```bash
http://localhost:4000
```

Mỗi request sẽ được phân phối luân phiên (round robin) giữa Server 1 (port 3000) và Server 2 (port 3001).

**Dùng curl:**
```bash
curl http://localhost:4000
curl http://localhost:4000
curl http://localhost:4000
```

Bạn sẽ thấy response luân phiên từ Server 1 và Server 2.

## Dừng Nginx
```bash
nginx -s stop
```

## Test CURL để thấy rõ


```bash
for i in {1..5}; do echo "Request $i:"; curl -s http://localhost:4000 | grep -i "server [12]"; done
```
