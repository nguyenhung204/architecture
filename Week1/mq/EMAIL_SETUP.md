# 📧 Hướng dẫn cấu hình gửi Email THẬT

## 🚀 Quick Start (Khuyên dùng Mailtrap cho testing)

### Option 1: Mailtrap.io (Recommended - Miễn phí, dễ nhất)

Mailtrap là dịch vụ email sandbox, nhận email thật nhưng không gửi ra ngoài internet (an toàn cho testing).

1. **Đăng ký tài khoản miễn phí**: https://mailtrap.io/
2. **Lấy thông tin SMTP**:
   - Đăng nhập → Email Testing → Inboxes
   - Click inbox → SMTP Settings
   - Copy Username và Password

3. **Tạo file `.env`** ở root project:
```bash
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
```

4. **Chạy lại Consumer Service**:
```bash
pnpm run start:dev consumer-service
```

5. **Test gửi email**:
```bash
curl -X POST http://localhost:3000/orders/async \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "email": "test@example.com",
    "items": ["Product 1", "Product 2"],
    "totalAmount": 1000000
  }'
```

6. **Xem email** trên Mailtrap inbox (refresh trang)

---

### Option 2: Gmail (Production - Gửi email thật ra ngoài)

⚠️ **Lưu ý**: Cần tạo App Password, không dùng mật khẩu Gmail thông thường.

1. **Bật 2-Step Verification**:
   - Vào: https://myaccount.google.com/security
   - Bật "2-Step Verification"

2. **Tạo App Password**:
   - Vào: https://myaccount.google.com/apppasswords
   - Chọn "Mail" và thiết bị của bạn
   - Click "Generate"
   - Copy password 16 ký tự (dạng: `abcd efgh ijkl mnop`)

3. **Tạo file `.env`**:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop  # App Password (không có dấu cách)
```

4. **Test**: Email sẽ được gửi thật đến địa chỉ trong request body

---

### Option 3: Outlook/Hotmail

```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

---

## 🧪 Cách test

### 1. Start services

```bash
# Terminal 1: Consumer Service (Email Worker)
pnpm run start:dev consumer-service

# Terminal 2: Producer Service (Order API)
pnpm run start:dev producer-service
```

### 2. Gửi order (email sẽ được gửi thật)

```bash
# Thay "your-real-email@gmail.com" bằng email thật của bạn
curl -X POST http://localhost:3000/orders/async \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Nguyễn Văn A",
    "email": "your-real-email@gmail.com",
    "items": ["iPhone 15 Pro", "AirPods Pro"],
    "totalAmount": 35000000
  }'
```

### 3. Kiểm tra email

- **Mailtrap**: Vào inbox trên web
- **Gmail**: Kiểm tra hộp thư đến
- **Logs**: Xem terminal Consumer Service

---

## 📧 Mẫu email sẽ nhận được

Email có format đẹp với:
- ✅ Header gradient màu
- 📦 Danh sách sản phẩm
- 💰 Tổng tiền định dạng VNĐ
- 🎨 Responsive design

---

## 🔧 Troubleshooting

### Lỗi: "Invalid login"
- **Gmail**: Kiểm tra đã bật 2FA và tạo App Password chưa
- **Mailtrap**: Kiểm tra username/password có đúng không

### Lỗi: "Connection timeout"
- Kiểm tra firewall/antivirus có block port 587 không
- Thử đổi `SMTP_PORT=465` và `SMTP_SECURE=true`

### Không thấy email
- **Mailtrap**: Refresh trang inbox
- **Gmail**: Kiểm tra Spam/Promotions folder
- **Logs**: Xem console có báo lỗi không

### Email bị vào Spam (Gmail)
- Bình thường cho email test
- Production cần setup SPF, DKIM, DMARC records

---

## 🎯 So sánh các options

| Feature | Mailtrap | Gmail | Outlook |
|---------|----------|-------|---------|
| 🆓 Miễn phí | ✅ Yes | ✅ Yes | ✅ Yes |
| 🔧 Dễ setup | ✅✅✅ Rất dễ | ⚠️ Cần App Password | ⚠️ Trung bình |
| 📨 Gửi thật ra ngoài | ❌ No (Sandbox) | ✅ Yes | ✅ Yes |
| 🛡️ An toàn cho test | ✅✅✅ Rất an toàn | ⚠️ Có thể spam người khác | ⚠️ Có thể spam người khác |
| 📊 Email UI/Logs | ✅✅✅ Đẹp, đầy đủ | ❌ Không có | ❌ Không có |
| 💼 Dùng cho Production | ❌ No | ⚠️ Có (hạn chế 500/day) | ⚠️ Có (hạn chế) |

**Khuyến nghị**: 
- 🧪 **Development/Testing**: Dùng Mailtrap (dễ nhất, an toàn nhất)
- 🚀 **Production**: Dùng SendGrid, AWS SES, hoặc Mailgun (chuyên nghiệp hơn)
