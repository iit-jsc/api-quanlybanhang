# 📋 Hướng Dẫn Tích Hợp Hóa Đơn Điện Tử VNPT - Máy Tính Tiền

## 🎯 Tổng Quan

Hệ thống tích hợp hóa đơn điện tử VNPT theo chuẩn máy tính tiền (Nghị định 123/2020/NĐ-CP, Thông tư 78/2021/TT-BTC) cho web bán hàng POS.

**Dải số hóa đơn mới nhất:**
- **Mẫu số:** 2/001
- **Ký hiệu:** C25MIT  
- **Phạm vi:** 0000001 đến 0001000 (1000 số hóa đơn)
- **Cập nhật:** 20/12/2024

## 🔧 Quy Trình 2 Bước Chuẩn VNPT

### Bước 1: Lấy Base64Hash
```
API: GetHashInvMTTNoRangeByToken
Mục đích: Lấy hash hóa đơn để chuẩn bị ký số
```

### Bước 2: Gửi Hóa Đơn Đã Ký
```
API: SendInvMTTNoRangeByToken  
Mục đích: Gửi hóa đơn đã ký số đến CQT
```

## 📁 Cấu Hình Môi Trường (.env)

```env
# VNPT E-Invoice Configuration
EINVOICE_BASE_URL=https://h2o-tt78admindemo.vnpt-invoice.com.vn
EINVOICE_ACCOUNT=nguyenvana
EINVOICE_AC_PASS=Vnpt@1234
EINVOICE_USERNAME=nguyenvana
EINVOICE_PASSWORD=Vnpt@1234
EINVOICE_PATTERN=2/001
EINVOICE_SERIAL=C25MIT
EINVOICE_SERIAL_CERT=540101014D8A1505AC9C7DC132A98455
```

## 🚀 API Endpoints

### 1. Gửi Hóa Đơn Điện Tử (Chính)
```http
POST /einvoice/send-to-tax
Content-Type: application/json

{
  "orderId": "ORDER_123",
  "invoiceNo": 1,
  "total": 100000,
  "customerName": "Nguyễn Văn A",
  "customerAddress": "123 Đường ABC, Quận 1, TP.HCM",
  "products": [
    {
      "name": "Cơm gà nướng",
      "quantity": 1,
      "price": 50000,
      "total": 50000
    },
    {
      "name": "Nước chanh",
      "quantity": 2,
      "price": 25000,
      "total": 50000
    }
  ]
}
```

**Response thành công:**
```json
{
  "success": true,
  "message": "✅ Gửi hóa đơn điện tử thành công!",
  "data": {
    "orderId": "ORDER_123",
    "invoiceNumber": "1",
    "messageId": "mtd_12345678",
    "timestamp": "2024-12-20T10:30:00.000Z"
  }
}
```

### 2. Lấy Hash Cho Số Hóa Đơn
```http
GET /einvoice/get-hash/5
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy hash thành công cho số hóa đơn 5",
  "data": {
    "invoiceNumber": 5,
    "base64Hash": "SGVsbG8gV29ybGQgSGFzaA==...",
    "hashLength": 256,
    "canProceedToSend": true
  }
}
```

### 3. Tìm Số Hóa Đơn Khả Dụng
```http
GET /einvoice/find-available
```

**Response:**
```json
{
  "success": true,
  "message": "Tìm thấy số hóa đơn khả dụng: 10",
  "data": {
    "invoiceNumber": 10,
    "pattern": "2/001",
    "serial": "C25MIT",
    "canUse": true,
    "range": {
      "min": 1,
      "max": 1000,
      "total": 1000,
      "description": "Lô hóa đơn từ 0000001 đến 0001000"
    }
  }
}
```

### 4. Test Toàn Bộ Quy Trình
```http
POST /einvoice/test-full-process
Content-Type: application/json

{
  "total": 150000,
  "customerName": "Khách hàng test",
  "customerAddress": "Địa chỉ test"
}
```

### 5. Kiểm Tra Trạng Thái Hóa Đơn
```http
GET /einvoice/check-status/mtd_12345678
```

**Response:**
```json
{
  "success": true,
  "message": "Trạng thái hóa đơn mtd_12345678",
  "data": {
    "messageId": "mtd_12345678",
    "status": "2",
    "statusText": "CQT đã tiếp nhận",
    "invoiceNumber": "12345678",
    "checkTime": "2024-12-20T10:35:00.000Z"
  }
}
```

### 6. Xem Cấu Hình Hiện Tại
```http
GET /einvoice/config
```

## 🎯 Quy Trình Tích Hợp Thực Tế

### Bước 1: Tạo Đơn Hàng
```javascript
// Trong hệ thống POS khi khách thanh toán
const orderData = {
  orderId: `ORDER_${Date.now()}`,
  total: calculateTotal(cartItems),
  customerName: customer.name,
  customerAddress: customer.address,
  products: cartItems.map(item => ({
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    total: item.quantity * item.price
  }))
}
```

### Bước 2: Tìm Số Hóa Đơn Khả Dụng
```javascript
const availableResult = await fetch('/einvoice/find-available')
const availableData = await availableResult.json()

if (availableData.success) {
  orderData.invoiceNo = availableData.data.invoiceNumber
} else {
  throw new Error('Không tìm thấy số hóa đơn khả dụng')
}
```

### Bước 3: Gửi Hóa Đơn Điện Tử
```javascript
const result = await fetch('/einvoice/send-to-tax', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData)
})

const data = await result.json()
if (data.success) {
  console.log('✅ Hóa đơn điện tử đã được gửi:', data.data.messageId)
  // Lưu messageId để kiểm tra trạng thái sau
  await saveInvoiceInfo(orderData.orderId, data.data)
} else {
  console.error('❌ Lỗi gửi hóa đơn:', data.error)
}
```

### Bước 4: Kiểm Tra Trạng Thái (Tùy Chọn)
```javascript
// Kiểm tra sau 5-10 phút
setTimeout(async () => {
  const statusResult = await fetch(`/einvoice/check-status/${messageId}`)
  const statusData = await statusResult.json()
  
  if (statusData.success) {
    console.log('📊 Trạng thái hóa đơn:', statusData.data.statusText)
  }
}, 300000) // 5 phút
```

## ⚠️ Lưu Ý Quan Trọng

### 1. Concurrency (Đồng Thời)
- **Vấn đề:** Nhiều đơn hàng cùng lúc có thể tạo trùng số hóa đơn
- **Giải pháp:** Sử dụng database lock hoặc Redis để đảm bảo tính duy nhất

```javascript
// Ví dụ với Redis lock
const lockKey = `invoice_lock:${pattern}:${serial}`
const lock = await redis.set(lockKey, '1', 'PX', 5000, 'NX')

if (lock) {
  const nextNumber = await getNextInvoiceNumber()
  // Sử dụng nextNumber
  await redis.del(lockKey)
} else {
  throw new Error('Hệ thống đang bận, vui lòng thử lại')
}
```

### 2. Xử Lý Lỗi
```javascript
// Các mã lỗi thường gặp từ VNPT
const errorHandling = {
  'ERR:6': 'Không đủ số lượng hóa đơn → Liên hệ VNPT cấp lô mới',
  'ERR:21': 'Trùng số hóa đơn → Tìm số khác',
  'ERR:20': 'Pattern/Serial không đúng → Kiểm tra cấu hình',
  'ERR:1': 'Tài khoản không hợp lệ → Kiểm tra username/password'
}
```

### 3. Ký Số Thực Tế
```javascript
// TODO: Thay thế hàm signHash demo bằng SDK thực tế
async function signHashReal(base64Hash) {
  // Sử dụng Token USB hoặc SmartCA từ VNPT
  const tokenSDK = new VNPTTokenSDK(config)
  return await tokenSDK.signData(base64Hash)
}
```

### 4. Lưu Trữ Database
```sql
-- Bảng lưu thông tin hóa đơn điện tử
CREATE TABLE einvoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id VARCHAR(50) NOT NULL,
  invoice_number INT NOT NULL,
  pattern VARCHAR(10) NOT NULL,
  serial VARCHAR(10) NOT NULL,
  message_id VARCHAR(100),
  status VARCHAR(10),
  total_amount DECIMAL(15,2),
  customer_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_invoice (pattern, serial, invoice_number),
  INDEX idx_order_id (order_id),
  INDEX idx_message_id (message_id)
);
```

## 🧪 Testing

### Test Local
```bash
# Test API endpoints
curl -X GET http://localhost:3000/einvoice/config
curl -X GET http://localhost:3000/einvoice/find-available
curl -X POST http://localhost:3000/einvoice/test-full-process
```

### Test với Postman
Import collection với các endpoint trên và test từng bước:
1. GET config → Kiểm tra cấu hình
2. GET find-available → Tìm số khả dụng  
3. POST test-full-process → Test toàn bộ quy trình
4. GET check-status → Kiểm tra trạng thái

## 📞 Hỗ Trợ

- **VNPT Hotline:** 18001091
- **Email:** support@vnpt-invoice.com.vn
- **Tài liệu:** [VNPT E-Invoice Documentation](https://vnpt-invoice.com.vn)

## 📝 Changelog

### v2.0.0 (20/12/2024)
- ✅ Cập nhật dải số mới: Pattern 2/001, Serial C25MIT, Range 1-1000
- ✅ Thêm API kiểm tra trạng thái hóa đơn
- ✅ Cải thiện logic tìm số hóa đơn khả dụng
- ✅ Cập nhật documentation chi tiết

### v1.0.0 (19/12/2024)
- ✅ Tích hợp quy trình 2 bước chuẩn VNPT
- ✅ API gửi hóa đơn điện tử
- ✅ API lấy hash và test quy trình
- ✅ Hỗ trợ cấu hình động từ .env
