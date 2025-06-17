import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SecurityInterceptor.name)
  private readonly suspiciousPatterns = [
    /script/i,
    /javascript/i,
    /onload/i,
    /onerror/i,
    /eval\(/i,
    /union.*select/i,
    /drop.*table/i,
    /insert.*into/i,
    /delete.*from/i,
    /<.*>/,
    /\.\.\//,
    /etc\/passwd/,
    /cmd\.exe/,
    /powershell/i
  ]

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const { method, url, body, query, headers } = request
    const clientIp = this.getClientIp(request)

    // Kiểm tra patterns nghi ngờ trong URL, body, query
    const checkData = JSON.stringify({ url, body, query })
    const hasSuspiciousContent = this.suspiciousPatterns.some(pattern => pattern.test(checkData))

    if (hasSuspiciousContent) {
      this.logger.warn(`Suspicious request detected from IP: ${clientIp}`, {
        method,
        url,
        body,
        query,
        userAgent: headers['user-agent'],
        timestamp: new Date().toISOString()
      })
    }

    // Log tất cả requests tới sensitive endpoints
    const sensitiveEndpoints = ['/auth', '/admin', '/setup', '/config']
    if (sensitiveEndpoints.some(endpoint => url.includes(endpoint))) {
      this.logger.log(`Access to sensitive endpoint: ${method} ${url} from IP: ${clientIp}`)
    }

    return next.handle().pipe(
      tap(() => {
        // Log thành công
      }),
      tap({
        error: error => {
          this.logger.error(`Request failed: ${method} ${url} from IP: ${clientIp}`, error.stack)
        }
      })
    )
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0].trim() ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      'unknown'
    )
  }
}
