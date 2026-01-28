const express = require('express');
const redis = require('redis');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.txt');
const CACHE_KEY = 'file:data';

// Tạo Redis client
const redisClient = redis.createClient({
    host: 'localhost',
    port: 6379
});

redisClient.on('error', (err) => console.log('Redis Error:', err));
redisClient.on('connect', () => console.log('✓ Redis connected'));

app.use(express.json());

// 1. ENDPOINT ĐỌC - GET /api/data
// Đọc từ Redis trước, nếu không có thì đọc file và cache lại
app.get('/api/data', async (req, res) => {
    const startTime = Date.now();
    
    try {
        // Kiểm tra Redis cache trước
        const cachedData = await redisClient.get(CACHE_KEY);
        
        if (cachedData) {
            return res.json({
                source: 'redis',
                data: cachedData
            });
        }
        
        // Cache miss - đọc từ file
        console.log('Cache miss - Reading from file...');
        
        const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
        
        // Lưu vào Redis cache (TTL 60 giây)
        await redisClient.setEx(CACHE_KEY, 60, fileContent);
    
        
        res.json({
            source: 'file',
            data: fileContent
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. ENDPOINT GHI - POST /api/data
// Ghi vào Redis trước, sau đó cập nhật file
app.post('/api/data', async (req, res) => {
    const startTime = Date.now();
    const { data } = req.body;
    
    if (!data) {
        return res.status(400).json({ error: 'Missing data field' });
    }
    
    try {
        // Bước 1: Ghi vào Redis trước (nhanh)
        await redisClient.setEx(CACHE_KEY, 60, data);
        console.log('Written to Redis');
        
        // Bước 2: Ghi vào file (chậm)
        await fs.writeFile(DATA_FILE, data, 'utf-8');
        console.log('Written to file');
        
        res.json({
            success: true,
            message: 'Data written to Redis and file'
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
(async () => {
    await redisClient.connect();
    app.listen(PORT, () => {
        console.log(`\nServer running on http://localhost:${PORT}`);
       
    });
})();
