# Database Partitioning

Partitioning (phân vùng dữ liệu) là kỹ thuật chia nhỏ một bảng hoặc toàn bộ database thành nhiều phần nhỏ hơn, nhằm cải thiện hiệu năng, khả năng mở rộng và quản lý dữ liệu.

---

## 1. Vertical Partitioning (Phân vùng dọc)

### Khái niệm

Chia bảng theo **cột (column)**. Thay vì một bảng chứa tất cả các cột, ta tách một số cột ra thành bảng riêng. Các bảng vẫn dùng chung Primary Key để có thể JOIN lại khi cần.

### Khi nào dùng

- Một số cột bị truy vấn rất thường xuyên, một số cột hiếm khi dùng.
- Một số cột chứa dữ liệu lớn (BLOB, TEXT) làm chậm truy vấn thông thường.
- Muốn kiểm soát quyền truy cập theo nhóm cột (ví dụ: tách cột nhạy cảm).

### Ví dụ thực tế: Hệ thống người dùng (Users)

**Trước khi partition:**

```
Table: users
+----+----------+-------+--------+---------------------+---------------------+
| id | username | email | avatar | last_login          | created_at          |
+----+----------+-------+--------+---------------------+---------------------+
```

Vấn đề: Mỗi lần hiển thị danh sách user, hệ thống đọc cả cột `avatar` (dữ liệu lớn) dù không cần.

**Sau khi Vertical Partition:**

```
Table: users (truy vấn thường xuyên)
+----+----------+-------+---------------------+
| id | username | email | created_at          |
+----+----------+-------+---------------------+

Table: users_profile (truy vấn khi cần)
+----+--------+---------------------+
| id | avatar | last_login          |
+----+--------+---------------------+
```

Truy vấn danh sách user giờ chỉ đọc bảng `users` nhỏ gọn, nhanh hơn đáng kể.

### Lợi ích

- Giảm lượng dữ liệu đọc từ disk cho mỗi query thông thường.
- Cải thiện cache hiệu quả hơn vì bảng nhỏ hơn.

### Hạn chế

- Khi cần đầy đủ thông tin phải JOIN, tốn thêm chi phí.
- Tăng số lượng bảng, phức tạp hóa schema.

---

## 2. Horizontal Partitioning (Phân vùng ngang)

### Khái niệm

Chia bảng theo **hàng (row)**. Cùng một cấu trúc bảng, nhưng dữ liệu được phân chia vào nhiều bảng/partition khác nhau dựa trên một tiêu chí (partition key).

Đây là loại partitioning phổ biến nhất. Khi horizontal partitioning được thực hiện **trên nhiều máy chủ khác nhau**, nó được gọi là **Sharding**.

### Các chiến lược chia (Partition Strategy)

| Chiến lược   | Mô tả                                                                 |
|--------------|-----------------------------------------------------------------------|
| Range        | Chia theo khoảng giá trị (ngày tháng, ID từ 1-1000, 1001-2000...)    |
| Hash         | Dùng hàm hash trên partition key để phân phối đều                    |
| List         | Chia theo danh sách giá trị cụ thể (quốc gia, trạng thái...)        |
| Composite    | Kết hợp nhiều chiến lược trên                                         |

### Ví dụ thực tế: Bảng Orders (Đơn hàng)

Một sàn thương mại điện tử có hàng trăm triệu đơn hàng, truy vấn chậm dần.

**Partition by Range (theo năm):**

```sql
-- PostgreSQL example
CREATE TABLE orders (
    id          BIGINT,
    user_id     BIGINT,
    total       DECIMAL,
    created_at  TIMESTAMP
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2023
    PARTITION OF orders
    FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

CREATE TABLE orders_2024
    PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE orders_2025
    PARTITION OF orders
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

Khi query `WHERE created_at >= '2025-01-01'`, database chỉ quét `orders_2025` thay vì toàn bộ bảng.

**Partition by Hash (theo user_id):**

```sql
CREATE TABLE orders PARTITION BY HASH (user_id);

CREATE TABLE orders_p0 PARTITION OF orders FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE orders_p1 PARTITION OF orders FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE orders_p2 PARTITION OF orders FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE orders_p3 PARTITION OF orders FOR VALUES WITH (MODULUS 4, REMAINDER 3);
```

Mỗi user_id sẽ luôn rơi vào cùng một partition, đảm bảo phân phối đều.

### Sharding - Horizontal Partition trên nhiều server

```
Server 1 (Shard A): users có ID từ 1        -> 10,000,000
Server 2 (Shard B): users có ID từ 10,000,001 -> 20,000,000
Server 3 (Shard C): users có ID từ 20,000,001 -> 30,000,000
```

Ví dụ thực tế: Instagram dùng sharding để phân tán hàng tỷ bức ảnh. Facebook dùng sharding cho bảng user với hàng tỷ tài khoản.

### Lợi ích

- Giảm kích thước bảng mỗi partition, tăng tốc query.
- Có thể đặt các partition trên các disk/server khác nhau.
- Dễ xóa dữ liệu cũ (drop cả partition thay vì DELETE từng row).

### Hạn chế

- Query không dùng partition key sẽ phải quét tất cả partition (full scan).
- Sharding làm phức tạp việc JOIN cross-shard và transaction phân tán.
- Cần thiết kế partition key cẩn thận để tránh hotspot (một partition bị quá tải).

---

## 3. Functional Partitioning (Phân vùng theo chức năng)

### Khái niệm

Chia dữ liệu theo **nghiệp vụ (domain/function)**. Thay vì một database duy nhất chứa tất cả, ta tách thành nhiều database riêng biệt, mỗi database phục vụ một tính năng hoặc domain cụ thể.

Đây là nền tảng của kiến trúc **Microservices** — mỗi service sở hữu database riêng của mình.

### Ví dụ thực tế: Hệ thống thương mại điện tử

**Trước khi phân vùng — Monolithic Database:**

```
Database: ecommerce_db
  - users
  - products
  - categories
  - orders
  - order_items
  - payments
  - reviews
  - inventory
  - notifications
  - shipping
```

Vấn đề:
- Một migration nhỏ có thể ảnh hưởng toàn bộ hệ thống.
- Team phát triển tính năng Payment phải deploy cùng với team Product.
- Không thể scale riêng từng phần.

**Sau khi Functional Partition:**

```
DB: user_service_db          DB: product_service_db
  - users                      - products
  - user_profiles               - categories
  - addresses                   - inventory

DB: order_service_db         DB: payment_service_db
  - orders                      - payments
  - order_items                 - transactions
  - shipping                    - refunds

DB: notification_service_db  DB: review_service_db
  - notifications               - reviews
  - templates                   - ratings
```

Mỗi database có thể dùng công nghệ phù hợp nhất:

```
user_service_db       -> PostgreSQL  (dữ liệu quan hệ, cần ACID)
product_service_db    -> PostgreSQL + Elasticsearch (full-text search)
notification_db       -> MongoDB    (schema linh hoạt, ghi nhiều)
review_service_db     -> Cassandra  (write-heavy, scale lớn)
session_store         -> Redis      (key-value, cần tốc độ cao)
```

### Ví dụ thực tế khác: Netflix

Netflix chia hệ thống thành hàng trăm microservices, mỗi service có database riêng:
- User preferences -> Cassandra
- Billing -> MySQL
- Streaming metadata -> MySQL + EVCache (Redis)
- Recommendations -> custom in-memory store

### Lợi ích

- Scale độc lập từng service theo nhu cầu thực tế.
- Lỗi ở một database không làm sập toàn bộ hệ thống.
- Mỗi team sở hữu hoàn toàn database của mình, deploy độc lập.
- Chọn được công nghệ database phù hợp nhất cho từng use case.

### Hạn chế

- Mất đi khả năng JOIN trực tiếp giữa các domain.
- Distributed transaction rất phức tạp (cần Saga pattern hoặc 2PC).
- Data consistency giữa các service khó đảm bảo hơn.
- Tăng overhead vận hành (nhiều database cần monitor và backup).

---

## So sánh tổng quan

| Tiêu chí              | Vertical                     | Horizontal                      | Functional                        |
|-----------------------|------------------------------|---------------------------------|-----------------------------------|
| Đơn vị chia           | Cột (column)                 | Hàng (row)                      | Domain / nghiệp vụ                |
| Cùng server?          | Thường là có                 | Có thể không (Sharding)         | Thường không                      |
| Schema thay đổi?      | Có (tách bảng)               | Không (cùng cấu trúc)           | Có (database riêng biệt)          |
| Dùng khi nào          | Bảng có nhiều cột ít dùng    | Bảng có quá nhiều row           | Hệ thống lớn, nhiều team          |
| Ví dụ điển hình       | Tách profile khỏi user       | Chia orders theo năm/region     | Microservices architecture        |
| Độ phức tạp           | Thấp                         | Trung bình                      | Cao                               |

---

## Tóm tắt cách nhớ

- **Vertical**: Cắt bảng theo chiều **dọc** (chia cột) — tách những thứ ít dùng ra.
- **Horizontal**: Cắt bảng theo chiều **ngang** (chia hàng) — phân tán dữ liệu lớn ra nhiều partition.
- **Functional**: Cắt toàn bộ **database** theo nghiệp vụ — mỗi tính năng tự quản lý data của mình.

Trong thực tế, ba loại này không loại trừ nhau. Một hệ thống lớn thường áp dụng cả ba: Functional partition để tách microservices, Horizontal partition để scale từng service, Vertical partition để tối ưu schema bên trong mỗi service.
