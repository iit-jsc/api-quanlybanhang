# Rate Limiting Test Guide

## Vấn đề hiện tại
Rate limiting cho `/auth/login` không hoạt động như mong đợi - có thể gọi quá 5 lần mà không bị chặn.

## Các thay đổi đã thực hiện

1. **Cải thiện AntiSpamGuard**:
   - Thêm logging debug chi tiết
   - Cải thiện IP detection 
   - Chỉ áp dụng rate limiting khi có `@RateLimit` decorator
   - Sử dụng `request.url` thay vì `request.route?.path` để đảm bảo endpoint key đúng

2. **Cập nhật Auth Controller**:
   - Loại bỏ ThrottlerGuard cũ
   - Thêm endpoint `/auth/test-rate-limit` để test (3 requests/10s)
   - Thêm endpoint `/auth/debug-ip` để debug IP detection

3. **Cập nhật Main.ts**:
   - Bật debug logging
   - Cải thiện CORS config để support header IP forwarding

## Cách test

### 1. Chạy server
```bash
npm run start:dev
```

### 2. Test rate limiting bằng PowerShell (Windows)
```powershell
.\test-rate-limit.ps1
```

### 3. Test bằng curl hoặc script bash
```bash
./test-rate-limit.sh
```

### 4. Test thủ công bằng browser/Postman

#### Kiểm tra IP detection:
```
GET http://localhost:3000/auth/debug-ip
```

#### Test rate limit endpoint:
```
GET http://localhost:3000/auth/test-rate-limit
```
Gọi 4 lần liên tiếp - lần thứ 4 sẽ bị rate limit (429)

#### Test login rate limit:
```
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "username": "test_user",
  "password": "test_password"
}
```
Gọi 6 lần liên tiếp - từ lần thứ 6 sẽ bị rate limit (429)

## Debug logs

Khi server chạy với debug mode, bạn sẽ thấy logs như:
```
[AntiSpamGuard] Rate limiting check for 127.0.0.1 on POST:/auth/login, limit: 5, window: 60000ms
[AntiSpamGuard] First request for 127.0.0.1 on POST:/auth/login
[AntiSpamGuard] Request count for 127.0.0.1 on POST:/auth/login: 2/5
...
[AntiSpamGuard] Rate limit exceeded for 127.0.0.1 on POST:/auth/login: 6/5. Retry after 58s
```

## Có thể nguyên nhân

1. **IP Detection**: Nếu IP không được detect đúng, mỗi request có thể được coi là từ IP khác nhau
2. **Endpoint Key**: Route path có thể không khớp giữa các request
3. **Guard không được áp dụng**: AntiSpamGuard có thể không được trigger đúng cách
4. **Memory**: Map lưu trữ rate limit có thể bị reset

## Lưu ý

- Rate limit được tính theo IP + endpoint
- Window time được reset khi hết thời gian TTL
- Chỉ endpoint có `@RateLimit` decorator mới bị giới hạn
- Debug logs giúp theo dõi quá trình rate limiting
