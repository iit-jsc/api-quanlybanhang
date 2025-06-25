# Security Module

Thư mục này chứa tất cả các components liên quan đến bảo mật của ứng dụng.

## Cấu trúc

```
security/
├── anti-spam.guard.ts          # Guard chống spam với rate limiting
├── ip-whitelist.guard.ts       # Guard kiểm tra IP whitelist
├── security.interceptor.ts     # Interceptor phát hiện threats
├── whitelist.decorator.ts      # Decorator cho IP whitelist
├── security.module.ts          # Module chính
├── index.ts                    # Export file
└── README.md                   # Documentation
```

## Components

### 1. AntiSpamGuard
- **Mục đích**: Chống spam và DDoS attacks
- **Giới hạn**: 60 requests/minute per IP
- **Sử dụng**: `@UseGuards(AntiSpamGuard)`

### 2. IpWhitelistGuard  
- **Mục đích**: Chỉ cho phép IP được phép truy cập
- **Sử dụng**: `@UseGuards(IpWhitelistGuard)` + `@RequireWhitelist()`

### 3. SecurityInterceptor
- **Mục đích**: Monitor và log suspicious activities
- **Phát hiện**: XSS, SQL Injection, Path Traversal
- **Auto-apply**: Toàn bộ ứng dụng

### 4. RequireWhitelist Decorator
- **Mục đích**: Mark routes cần IP whitelist
- **Sử dụng**: `@RequireWhitelist()`

## Sử dụng

### Import từ security module:
```typescript
import { AntiSpamGuard, IpWhitelistGuard, RequireWhitelist } from '../security'
```

### Áp dụng cho controller:
```typescript
@Controller('api')
@UseGuards(AntiSpamGuard)
export class ApiController {
  
  @Get('/admin')
  @RequireWhitelist()
  @UseGuards(IpWhitelistGuard)
  async getAdminData() {
    // Chỉ IP được whitelist mới truy cập được
  }
}
```

### Cấu hình IP Whitelist:
Cập nhật `WHITELIST_IPS` trong `ip-whitelist.guard.ts`:
```typescript
private readonly WHITELIST_IPS = [
  '127.0.0.1',
  '::1', 
  'your-office-ip',
  'admin-ip'
]
```

## Lợi ích của việc tách riêng

1. **Separation of Concerns**: Tách biệt logic bảo mật
2. **Reusability**: Có thể reuse cho projects khác  
3. **Maintainability**: Dễ maintain và update
4. **Testing**: Dễ viết unit tests
5. **Documentation**: Tập trung documentation về security
6. **Version Control**: Track changes về security riêng biệt
