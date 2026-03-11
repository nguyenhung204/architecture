-- Script khởi tạo database tự động khi PostgreSQL container chạy lần đầu
-- File này được đặt tại /docker-entrypoint-initdb.d/ trong container

-- Tạo database mới
CREATE DATABASE myappdb;

-- Kết nối vào database vừa tạo
\c myappdb;

-- Tạo bảng users
CREATE TABLE IF NOT EXISTS users (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(100) NOT NULL,
    email   VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chèn dữ liệu mẫu
INSERT INTO users (name, email) VALUES
    ('Alice', 'alice@example.com'),
    ('Bob',   'bob@example.com');
