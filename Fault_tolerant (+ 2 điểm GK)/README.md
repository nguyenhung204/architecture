# Fault Tolerance Patterns - Lý Thuyết và Kiến Trúc

## Giới Thiệu

Trong hệ thống phân tán hiện đại, các service thường phụ thuộc lẫn nhau và giao tiếp qua mạng. Điều này tạo ra nhiều điểm có thể xảy ra lỗi (failure points). Fault Tolerance Patterns là tập hợp các kỹ thuật thiết kế giúp hệ thống có khả năng phục hồi và tiếp tục hoạt động ngay cả khi một phần của nó gặp sự cố.

Bốn patterns được trình bày trong tài liệu này là những mẫu thiết kế cơ bản và quan trọng nhất trong việc xây dựng hệ thống resilient (khả năng phục hồi).

---

## 1. RETRY Pattern

### Khái Niệm

Retry Pattern là kỹ thuật tự động thực hiện lại một thao tác đã thất bại với hy vọng rằng lần thử tiếp theo sẽ thành công. Pattern này dựa trên giả định rằng nhiều lỗi trong hệ thống phân tán là tạm thời (transient) và có thể tự phục hồi sau một khoảng thời gian ngắn.

### Các Loại Lỗi Tạm Thời (Transient Failures)

**Lỗi tạm thời** là những lỗi xuất hiện trong thời gian ngắn và có thể tự khắc phục mà không cần can thiệp:

- **Network hiccups**: Mất gói tin tạm thời, độ trễ cao đột ngột
- **Timeout ngắn hạn**: Service phản hồi chậm do spike tải đột ngột
- **Resource momentarily unavailable**: Database connection pool đầy tạm thời
- **Service restart**: Service đang khởi động lại sau deployment

### Chiến Lược Retry

#### 1. Immediate Retry (Thử lại ngay lập tức)
Thực hiện retry ngay sau khi gặp lỗi, không có delay. Phù hợp khi lỗi có thể khắc phục rất nhanh.

**Ưu điểm**: Độ trễ tối thiểu khi thành công  
**Nhược điểm**: Có thể làm tăng tải lên service đang gặp vấn đề

#### 2. Fixed Interval Retry (Thử lại theo khoảng thời gian cố định)
Chờ một khoảng thời gian cố định giữa các lần retry.

**Ưu điểm**: Đơn giản, dễ hiểu và implement  
**Nhược điểm**: Không tối ưu cho mọi tình huống

#### 3. Exponential Backoff (Lùi lui theo cấp số nhân)
Khoảng thời gian chờ tăng theo cấp số nhân sau mỗi lần thất bại (ví dụ: 1s, 2s, 4s, 8s).

**Ưu điểm**: Giảm tải cho service đang gặp vấn đề, tăng khả năng phục hồi  
**Nhược điểm**: Độ trễ tăng lên với mỗi lần retry

#### 4. Exponential Backoff with Jitter
Tương tự Exponential Backoff nhưng thêm yếu tố ngẫu nhiên (jitter) để tránh thundering herd problem.

**Thundering Herd Problem**: Khi nhiều clients retry cùng lúc sau cùng một khoảng thời gian, tạo ra spike tải mới.

### Các Tham Số Quan Trọng

**Maximum Retry Attempts**: Số lần retry tối đa trước khi từ bỏ. Cần cân bằng giữa khả năng phục hồi và user experience.

**Timeout per Attempt**: Thời gian chờ tối đa cho mỗi lần thử. Ngăn chặn việc chờ đợi vô thời hạn.

**Retry Condition**: Không phải tất cả lỗi đều nên retry. Chỉ retry với:
- Network errors (connection refused, timeout)
- HTTP 5xx errors (server errors)
- HTTP 429 (rate limit)

**Không nên retry với**:
- HTTP 4xx errors (client errors) như 400 Bad Request, 401 Unauthorized, 404 Not Found
- Business logic errors
- Validation errors

### Rủi Ro và Cân Nhắc

**1. Retry Storm (Bão Retry)**  
Khi nhiều clients đồng thời retry có thể làm tình hình tồi tệ hơn, tạo thêm tải cho service đã quá tải.

**2. Idempotency Requirement**  
Operation phải là idempotent (thực hiện nhiều lần cho cùng kết quả) để tránh side effects không mong muốn như duplicate transactions.

**3. Cost Amplification**  
Mỗi lần retry tốn thêm tài nguyên (network, CPU, memory). Với external API calls có thể tốn thêm chi phí.

**4. Latency Accumulation**  
Tổng thời gian xử lý có thể vượt quá acceptable response time từ góc độ người dùng.

### Khi Nào Sử Dụng

- Giao tiếp với external services không nằm trong tầm kiểm soát
- Network không ổn định định kỳ
- Service downstream có SLA cao nhưng đôi khi có spike lỗi ngắn
- Database connection pool có thể bị exhausted tạm thời

### Khi Nào Không Nên Sử Dụng

- Operations không idempotent
- Lỗi là permanent (ví dụ: validation errors)
- Real-time systems yêu cầu response time nghiêm ngặt
- Khi retry có thể gây ra business logic issues

---

## 2. CIRCUIT BREAKER Pattern

### Khái Niệm

Circuit Breaker Pattern được lấy cảm hứng từ cầu dao điện trong hệ thống điện. Khi phát hiện một service downstream liên tục gặp lỗi, circuit breaker sẽ "mở mạch" để ngăn chặn các requests tiếp theo gọi đến service đó, thay vào đó trả về một fallback response hoặc lỗi nhanh chóng.

### Vấn Đề Cần Giải Quyết

**Cascading Failures (Lỗi Dây Chuyền)**  
Trong kiến trúc microservices, khi Service A gọi Service B, và Service B gọi Service C:
- Nếu Service C down, Service B sẽ timeout
- Service B giữ resources (threads, connections) chờ đợi
- Service A cũng timeout chờ Service B
- Toàn bộ hệ thống bị ảnh hưởng, resources bị cạn kiệt

**Resource Exhaustion**  
Các threads, connections, memory bị giữ lại trong trạng thái chờ đợi service downstream không phản hồi, dẫn đến thread pool exhaustion.

### Ba Trạng Thái của Circuit Breaker

#### 1. CLOSED (Đóng - Hoạt động bình thường)

Đây là trạng thái mặc định khi mọi thứ hoạt động tốt.

**Hành vi**:
- Tất cả requests được chuyển tiếp đến service downstream
- Thống kê số lượng failures trong một time window
- Khi tỷ lệ failure vượt quá threshold, chuyển sang OPEN

**Metrics được theo dõi**:
- Failure count
- Success count
- Failure percentage
- Response time

#### 2. OPEN (Mở - Chặn tất cả requests)

Khi số lỗi vượt ngưỡng, circuit breaker chuyển sang OPEN để bảo vệ hệ thống.

**Hành vi**:
- Tất cả requests bị chặn ngay lập tức
- Không gọi đến service downstream
- Trả về fallback response hoặc fail fast error
- Sau một khoảng thời gian (reset timeout), chuyển sang HALF_OPEN

**Lợi ích**:
- Giải phóng resources ngay lập tức
- Giảm tải cho service downstream, cho nó thời gian recovery
- Response time nhanh hơn (fail fast thay vì chờ timeout)

#### 3. HALF_OPEN (Nửa mở - Thử nghiệm)

Sau reset timeout, circuit breaker chuyển sang HALF_OPEN để kiểm tra service đã phục hồi chưa.

**Hành vi**:
- Cho phép một số lượng requests giới hạn đi qua (ví dụ: 1 hoặc 3 requests)
- Nếu requests này thành công: chuyển về CLOSED
- Nếu còn thất bại: quay lại OPEN và reset timer

**Mục đích**: Tránh việc đột ngột gửi toàn bộ traffic vào service vừa mới phục hồi.

### Các Tham Số Cấu Hình

**Failure Threshold**  
Tỷ lệ hoặc số lượng failures cần thiết để mở circuit (ví dụ: 50% requests thất bại trong 10 giây cuối).

**Reset Timeout**  
Thời gian circuit ở trạng thái OPEN trước khi chuyển sang HALF_OPEN (ví dụ: 30 giây).

**Timeout**  
Thời gian chờ tối đa cho mỗi request trước khi coi là failure.

**Volume Threshold**  
Số lượng requests tối thiểu trong time window trước khi tính toán failure rate (tránh mở circuit do sample size nhỏ).

**Success Threshold (Half-Open)**  
Số requests thành công cần thiết trong HALF_OPEN để đóng lại circuit.

### Fallback Strategies

**Static Response**: Trả về dữ liệu cố định, an toàn  
**Cached Data**: Sử dụng dữ liệu cũ từ cache  
**Default Values**: Giá trị mặc định hợp lý  
**Degraded Functionality**: Chức năng giảm nhẹ nhưng vẫn hoạt động  
**Fail Fast**: Trả về lỗi ngay lập tức thay vì chờ timeout

### Monitoring và Metrics

Circuit Breaker cần được monitor kỹ lưỡng:
- State transitions (CLOSED → OPEN → HALF_OPEN → CLOSED)
- Failure rates
- Circuit open duration
- Fallback invocation count
- Recovery time

### Khi Nào Sử Dụng

- Service downstream có history của intermittent failures
- Cần bảo vệ hệ thống khỏi cascading failures
- Có khả năng cung cấp fallback response hợp lý
- Service downstream nằm ngoài tầm kiểm soát trực tiếp

### Khi Nào Không Nên Sử Dụng

- Local in-process operations
- Accessing in-memory cache
- Operations không có fallback strategy phù hợp
- Business critical operations không thể dùng fallback

---

## 3. RATE LIMITER Pattern

### Khái Niệm

Rate Limiter là cơ chế kiểm soát số lượng requests mà một client hoặc toàn hệ thống có thể thực hiện trong một khoảng thời gian nhất định. Đây là công cụ quan trọng để bảo vệ service khỏi bị quá tải và đảm bảo fair usage.

### Mục Đích và Lợi Ích

**1. Bảo Vệ Khỏi Overload**  
Ngăn chặn service bị quá tải khi có traffic spike đột ngột hoặc bị tấn công DDoS.

**2. Cost Control**  
Kiểm soát chi phí khi sử dụng external APIs có tính phí theo số lượng calls.

**3. Fair Usage**  
Đảm bảo tài nguyên được phân bổ công bằng giữa các users/clients, tránh một client monopolize resources.

**4. Quality of Service (QoS)**  
Phân chia tài nguyên theo tier (free tier, premium tier) với limits khác nhau.

**5. Predictable Performance**  
Giữ hệ thống ở mức tải có thể dự đoán được, đảm bảo performance stability.

### Các Thuật Toán Rate Limiting

#### 1. Fixed Window Counter

Chia thời gian thành các windows cố định (ví dụ: mỗi phút). Đếm số requests trong window hiện tại.

**Cơ chế**: 
- Mỗi window có counter riêng
- Request đến: tăng counter
- Counter reset khi chuyển sang window mới

**Ưu điểm**: Đơn giản, memory-efficient  
**Nhược điểm**: Có burst problem ở boundary của windows (có thể có 2x requests vào cuối window này và đầu window tiếp theo)

#### 2. Sliding Window Log

Ghi lại timestamp của tất cả requests, tính toán số requests trong window trượt.

**Cơ chế**:
- Lưu timestamp của mỗi request
- Khi request mới đến, xóa các timestamps cũ hơn window size
- Đếm số timestamps còn lại

**Ưu điểm**: Chính xác, không có burst problem  
**Nhược điểm**: Memory-intensive (phải lưu tất cả timestamps)

#### 3. Sliding Window Counter

Kết hợp Fixed Window và Sliding Window, sử dụng weighted calculation.

**Cơ chế**:
- Duy trì counter cho window hiện tại và window trước
- Tính weighted average dựa trên vị trí trong current window

**Ưu điểm**: Cân bằng giữa accuracy và efficiency  
**Nhược điểm**: Phức tạp hơn về mặt implementation

#### 4. Token Bucket

Bucket chứa tokens, mỗi request tiêu thụ một token. Tokens được refill với tốc độ cố định.

**Cơ chế**:
- Bucket có capacity tối đa
- Tokens được thêm vào với rate cố định
- Request yêu cầu token, nếu không đủ thì reject

**Ưu điểm**: Cho phép burst traffic (trong giới hạn bucket size)  
**Nhược điểm**: Phức tạp hơn để hiểu và implement

#### 5. Leaky Bucket

Requests được xử lý với tốc độ cố định, giống như nước chảy ra từ bucket thủng.

**Cơ chế**:
- Requests vào bucket (queue)
- Xử lý với rate cố định
- Bucket đầy thì reject requests mới

**Ưu điểm**: Smooths out burst, traffic output đều đặn  
**Nhược điểm**: Có thể tăng latency do queueing

### Các Cấp Độ Rate Limiting

**1. Global Rate Limiting**  
Áp dụng cho toàn bộ service, bảo vệ infrastructure.

**2. Per-User Rate Limiting**  
Mỗi user có quota riêng, đảm bảo fair usage.

**3. Per-API Endpoint Rate Limiting**  
Các endpoints khác nhau có limits khác nhau tùy theo độ resource-intensive.

**4. Geographic Rate Limiting**  
Limits khác nhau cho các regions khác nhau.

### Response Khi Vượt Limit

**HTTP 429 Too Many Requests**: Status code chuẩn cho rate limiting

**Headers quan trọng**:
- `X-RateLimit-Limit`: Tổng số requests allowed trong window
- `X-RateLimit-Remaining`: Số requests còn lại
- `X-RateLimit-Reset`: Timestamp khi quota được reset
- `Retry-After`: Thời gian client nên đợi trước khi retry

### Distributed Rate Limiting

Trong môi trường distributed (multiple instances), cần shared state:

**Centralized Storage**:
- Redis: In-memory, fast, supports atomic operations
- Memcached: Simple, fast, nhưng ít features hơn Redis

**Challenges**:
- Network latency đến shared storage
- Storage availability (single point of failure?)
- Consistency across instances

### Khi Nào Sử Dụng

- Public APIs cần bảo vệ khỏi abuse
- Freemium models với tiered access
- Bảo vệ expensive operations (ví dụ: search, analytics)
- Integration với third-party APIs có rate limits

### Khi Nào Không Nên Sử Dụng

- Internal microservices trong trusted environment
- Operations không resource-intensive
- Real-time collaborative systems cần instant responses
- Systems với SLA đảm bảo unlimited access

---

## 4. BULKHEAD Pattern

### Khái Niệm

Bulkhead Pattern được đặt tên theo vách ngăn trong tàu thủy. Trên tàu, các bulkheads (vách ngăn) chia tàu thành các compartments riêng biệt. Nếu một compartment bị thủng và ngập nước, các compartments khác vẫn còn nguyên vẹn và tàu không bị chìm hoàn toàn.

Tương tự, trong software architecture, Bulkhead Pattern cách ly các resources thành các pools riêng biệt để lỗi trong một phần không làm sập toàn bộ hệ thống.

### Vấn Đề Cần Giải Quyết

**Resource Exhaustion và System-Wide Failure**

Trong hệ thống không có bulkhead:
- Service A có 100 threads để xử lý requests
- Service A calls Service B (fast) và Service C (slow)
- Nếu Service C bị slow/hang, tất cả 100 threads có thể bị block chờ Service C
- Requests đến Service B (vẫn healthy) cũng không thể xử lý vì hết threads
- Toàn bộ Service A bị ảnh hưởng dù chỉ một dependency có vấn đề

### Các Loại Bulkhead

#### 1. Thread Pool Bulkhead (Semaphore-based)

Phân chia thread pools riêng cho từng dependency.

**Cơ chế**:
- Service B có dedicated thread pool (ví dụ: 20 threads)
- Service C có dedicated thread pool riêng (ví dụ: 30 threads)
- Service C slow không ảnh hưởng threads của Service B
- Main application threads không bị block

**Ưu điểm**:
- Isolation hoàn toàn giữa các dependencies
- Một dependency fail không ảnh hưởng những dependency khác

**Nhược điểm**:
- Overhead của việc quản lý multiple thread pools
- Cần tuning kỹ lưỡng số threads cho mỗi pool

#### 2. Semaphore Bulkhead

Sử dụng semaphores để giới hạn concurrent requests thay vì thread pools riêng.

**Cơ chế**:
- Mỗi dependency có một semaphore với permits giới hạn
- Request acquire permit trước khi execute
- Không có permit available thì reject ngay

**Ưu điểm**:
- Lightweight hơn thread pool isolation
- Không có context switching overhead

**Nhược điểm**:
- Không isolation hoàn toàn về thread level
- Caller thread vẫn bị block khi waiting

#### 3. Connection Pool Bulkhead

Phân chia connection pools riêng cho các database/external services.

**Cơ chế**:
- Database A có connection pool riêng (10 connections)
- Database B có connection pool riêng (15 connections)
- Issues với DB A không exhaust connections của DB B

### Sizing và Tuning

**Thread Pool Size Calculation**:

Công thức cơ bản: `Pool Size = (Core Count × Target CPU Utilization × (1 + Wait Time / Compute Time))`

**Các yếu tố cần xem xét**:
- **Request rate**: Số requests per second cho dependency đó
- **Response time**: Average latency của dependency
- **Timeout**: Maximum time willing to wait
- **Peak traffic**: Capacity cần thiết cho peak load

**Ví dụ**: 
- Service C: 100 req/s, latency 200ms → Cần ~20 threads
- Service D: 50 req/s, latency 500ms → Cần ~25 threads

### Queue Management

**Bounded Queues**: Mỗi thread pool có queue giới hạn

**Rejection Policies**:
- **Abort**: Throw exception ngay lập tức
- **Caller Runs**: Caller thread tự xử lý
- **Discard Oldest**: Bỏ task cũ nhất trong queue
- **Discard**: Bỏ task mới

### Monitoring và Metrics

Metrics quan trọng cho mỗi bulkhead:
- **Active threads/requests**: Số đang xử lý
- **Queue size**: Số tasks đang chờ
- **Rejection count**: Số tasks bị reject
- **Thread pool utilization**: % threads đang busy
- **Wait time in queue**: Latency do queueing

### Kết Hợp Với Circuit Breaker

Bulkhead và Circuit Breaker bổ trợ cho nhau:

**Bulkhead alone**: Giới hạn damage nhưng vẫn waste resources vào failing service

**Circuit Breaker alone**: Ngăn calls đến failing service nhưng trước khi mở có thể đã exhaust resources

**Combined approach**:
1. Bulkhead giới hạn resources cho mỗi dependency
2. Circuit Breaker detect failures nhanh và fail fast
3. Kết hợp tạo ra defense-in-depth strategy

### Use Cases Thực Tế

**Multi-Database System**:
- Read database pool: 50 connections
- Write database pool: 20 connections
- Analytics database pool: 10 connections
- Vấn đề với analytics không ảnh hưởng transactional operations

**API Gateway với Multiple Backends**:
- Auth service pool: 30 threads
- Payment service pool: 20 threads
- Notification service pool: 10 threads
- Notification slow không block payments

**Microservices Communication**:
- Mỗi downstream service có dedicated resources
- Một service down không làm toàn bộ upstream service unusable

### Khi Nào Sử Dụng

- Multiple dependencies với reliability/performance characteristics khác nhau
- Critical services cần được protect khỏi less critical services
- Có risk của resource exhaustion từ slow/failing dependencies
- Cần predictable degradation thay vì complete failure

### Khi Nào Không Nên Sử Dụng

- Simple applications với single dependency
- Resources không phải là bottleneck
- Overhead của isolation lớn hơn benefits
- Dependencies đều có reliability tương đương cao

---

## So Sánh và Kết Hợp Các Patterns

### Tổng Quan So Sánh

| Khía Cạnh | Retry | Circuit Breaker | Rate Limiter | Bulkhead |
|-----------|-------|-----------------|--------------|----------|
| **Mục đích chính** | Phục hồi từ transient failures | Ngăn cascading failures | Kiểm soát throughput | Cách ly resources |
| **Scope** | Per-request | Per-dependency | Per-client/global | Per-dependency |
| **Response khi active** | Increased latency | Fail fast | HTTP 429 | Queue/reject |
| **Resource usage** | Tăng (do retries) | Giảm (stop calling) | Controlled | Bounded |
| **Complexity** | Thấp | Trung bình | Trung bình-Cao | Cao |

### Khi Nào Kết Hợp

**Retry + Circuit Breaker**:
- Retry xử lý transient failures
- Circuit Breaker ngăn retry storm khi có permanent failure
- Best practice: Wrap retry logic bên ngoài circuit breaker

**Rate Limiter + Bulkhead**:
- Rate Limiter kiểm soát inbound traffic
- Bulkhead cách ly resource pools
- Protection cả inbound và outbound

**Circuit Breaker + Bulkhead**:
- Bulkhead giới hạn blast radius
- Circuit Breaker detect và fail fast
- Defense-in-depth strategy

**All Four Together**:
Trong production system phức tạp, cả 4 patterns thường được sử dụng đồng thời ở các layers khác nhau:
1. Rate Limiter ở API Gateway
2. Circuit Breaker cho mỗi external dependency
3. Bulkhead để isolate resource pools
4. Retry cho transient failures

---

## Nguyên Tắc Thiết Kế Chung

### 1. Fail Fast Philosophy

Thất bại nhanh tốt hơn chờ đợi lâu. Users có thể retry, nhưng hung threads/connections gây hại toàn hệ thống.

### 2. Graceful Degradation

Hệ thống nên degraded một cách graceful thay vì fail hoàn toàn. Cung cấp reduced functionality tốt hơn no functionality.

### 3. Timeouts Everywhere

Mỗi network call phải có timeout. Timeout là first line of defense against hung operations.

### 4. Monitoring và Observability

Không thể cải thiện những gì không đo được. Metrics, logs, và tracing là essential.

### 5. Test Chaos

Regularly test failure scenarios. Chaos engineering giúp phát hiện weaknesses trước khi production incidents.

### 6. Defense in Depth

Sử dụng multiple layers of protection. Một pattern không đủ, cần combination strategy.

---

## Thách Thức Trong Implementation

### Distributed Systems Challenges

**State Management**: Trong distributed environment, maintaining consistent state across instances là khó khăn.

**Clock Synchronization**: Rate limiting và timeouts dựa vào clocks, clock skew có thể gây issues.

**Network Partitions**: CAP theorem - phải chọn giữa consistency và availability.

### Configuration Management

**Over-tuning Risk**: Quá nhiều parameters có thể làm system khó config và maintain.

**Dynamic Adjustment**: Ideal configuration thay đổi theo load patterns, cần adaptive mechanisms.

### Testing Difficulties

**Reproducing Failures**: Transient failures khó reproduce trong test environment.

**Load Testing**: Cần realistic load tests để validate thresholds.

**Integration Testing**: Testing interactions giữa multiple patterns là complex.

---

## Kết Luận

Fault Tolerance Patterns không phải là silver bullets mà là các building blocks để xây dựng resilient systems. Hiểu rõ nguyên lý, trade-offs, và appropriate use cases của mỗi pattern là crucial cho việc thiết kế hệ thống phân tán reliable và scalable.

Successful implementation đòi hỏi:
- Hiểu biết sâu về system behavior và failure modes
- Careful tuning của parameters
- Comprehensive monitoring và alerting
- Regular testing including failure scenarios
- Iterative improvement dựa trên production experience

Trong thế giới microservices và cloud-native applications, các patterns này không còn là optional mà là fundamental requirements để đảm bảo system reliability và user satisfaction.

---

## Tài Liệu Tham Khảo

**Sách và Tài Liệu Nền Tảng**:
- "Release It! Design and Deploy Production-Ready Software" - Michael T. Nygard
- "Building Microservices" - Sam Newman
- "Site Reliability Engineering" - Google
- "Designing Data-Intensive Applications" - Martin Kleppmann

**Online Resources**:
- Microsoft Azure Architecture Center - Cloud Design Patterns
- AWS Well-Architected Framework
- Martin Fowler's Blog về Microservices Patterns
- Netflix Tech Blog về Resilience Engineering

**Academic Papers**:
- "Toward Robust Distributed Systems" - Eric Brewer (CAP Theorem)
- "Chaos Engineering: Building Confidence in System Behavior" - Netflix
- "Timeouts, Retries, and Backoff" - Marc Brooker (AWS)

---

## Ứng Dụng Trong Thực Tế

**Netflix**:
Sử dụng comprehensive resilience patterns với Hystrix library (Circuit Breaker + Bulkhead). Chaos Monkey để test failures continuously.

**Amazon**:
Extensive use của timeouts, retries với exponential backoff across all services. Rate limiting cho API Gateway.

**Google**:
SRE practices với error budgets. Adaptive rate limiting và load shedding trong infrastructure.

**Microsoft Azure**:
Built-in resilience patterns trong Azure services. Standardized retry policies và circuit breaker patterns.

---

## Glossary

**Cascading Failure**: Lỗi lan truyền từ một component đến toàn hệ thống

**Fail Fast**: Chiến lược thất bại nhanh thay vì chờ đợi timeout

**Fallback**: Phương án dự phòng khi primary operation thất bại

**Graceful Degradation**: Giảm chức năng một cách controlled thay vì fail hoàn toàn

**Idempotency**: Tính chất operation có thể thực hiện nhiều lần với cùng kết quả

**Resilience**: Khả năng hệ thống phục hồi từ failures

**SLA (Service Level Agreement)**: Cam kết về mức độ service availability

**Thundering Herd**: Hiện tượng nhiều clients retry đồng thời gây spike tải

**Transient Failure**: Lỗi tạm thời có thể tự phục hồi

**TTL (Time To Live)**: Thời gian tồn tại của một resource hoặc cache entry
