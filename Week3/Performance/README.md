# Redis Cache Demo - Simple API

2 endpoints đơn giản để demo Redis cache với file I/O

## Chạy server

```bash
# 1. Start Redis
docker-compose up -d

# 2. Install dependencies
npm install

# 3. Start server
npm start
```

## API Endpoints

### 1. GET /api/data - Đọc dữ liệu

**Flow:**
- Kiểm tra Redis trước
- Nếu có → Trả về từ Redis (~2ms)
- Nếu không → Đọc file (~500ms) → Cache vào Redis

**Postman:**
```
GET http://localhost:3000/api/data
```

**Response khi đọc từ file:**
```json
{
  "source": "file",
  "responseTime": "502ms",
  "data": "..."
}
```

**Response khi đọc từ Redis:**
```json
{
  "source": "redis",
  "responseTime": "2ms",
  "data": "..."
}
```

### 2. POST /api/data - Ghi dữ liệu

**Flow:**
- Ghi vào Redis trước (~1ms)
- Sau đó ghi vào file (~300ms)

**Postman:**
```
POST http://localhost:3000/api/data
Content-Type: application/json

{
  "data": "Nội dung mới cần lưu"
}
```

**Response:**
```json
{
  "success": true,
  "responseTime": "305ms",
  "message": "Data written to Redis and file"
}
```

## Test Flow với Postman

1. **GET /api/data** → Lần đầu đọc từ file (~500ms)
2. **GET /api/data** → Lần sau đọc từ Redis (~2ms) 
3. **POST /api/data** với body mới → Ghi vào Redis + File
4. **GET /api/data** → Đọc dữ liệu mới từ Redis

