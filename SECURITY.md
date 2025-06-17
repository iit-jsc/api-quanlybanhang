# Hướng dẫn bảo mật API

## Các biện pháp bảo mật đã áp dụng:

### 1. Rate Limiting & Anti-Spam
- **AntiSpamGuard**: Giới hạn 60 requests/phút cho mỗi IP
- **ThrottlerModule**: Rate limiting cho toàn bộ ứng dụng
- **Login Rate Limiting**: Chỉ cho phép 5 lần login/phút

### 2. Security Headers (Helmet)
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: no-referrer

### 3. Request Validation
- **whitelist: true**: Chỉ cho phép các field được định nghĩa trong DTO
- **forbidNonWhitelisted: true**: Từ chối request có field không mong muốn

### 4. Security Monitoring
- **SecurityInterceptor**: Log và phát hiện các request nghi ngờ
- Phát hiện XSS, SQL Injection, Path Traversal
- Log truy cập vào các endpoint nhạy cảm

### 5. IP Whitelist (Tùy chọn)
- **IpWhitelistGuard**: Chỉ cho phép IP được phép truy cập
- **@RequireWhitelist()**: Decorator để bảo vệ route admin

### 6. CORS Security
- Chỉ cho phép origins được cấu hình
- Giới hạn methods và headers được phép

## Cách sử dụng:

### 1. Áp dụng Rate Limiting cho endpoint cụ thể:
```typescript
@Post('/login')
@Throttle({ default: { limit: 5, ttl: 60000 } })
async login(@Body() data: LoginDto) {
  // ...
}
```

### 2. Bảo vệ endpoint admin với IP whitelist:
```typescript
@Get('/admin/users')
@RequireWhitelist()
@UseGuards(IpWhitelistGuard)
async getUsers() {
  // ...
}
```

### 3. Áp dụng Anti-spam cho controller:
```typescript
@Controller('auth')
@UseGuards(AntiSpamGuard)
export class AuthController {
  // ...
}
```

## Cấu hình Environment:

Cập nhật file `.env` với các biến sau:
```env
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
VNP_IPN_SECRET_KEY=your_secret_key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Monitoring và Logs:

Hệ thống sẽ log các sự kiện sau:
- Requests nghi ngờ (XSS, SQL Injection, etc.)
- Truy cập vào endpoints nhạy cảm
- Rate limit violations
- Errors và exceptions

## Khuyến nghị bổ sung:

1. **HTTPS**: Luôn sử dụng HTTPS trong production
2. **WAF**: Cân nhắc sử dụng Web Application Firewall
3. **API Key**: Implement API key cho external integrations
4. **2FA**: Thêm two-factor authentication cho admin
5. **Audit Logs**: Log tất cả actions quan trọng
6. **Database Security**: Encrypt sensitive data
7. **Regular Updates**: Cập nhật dependencies thường xuyên
