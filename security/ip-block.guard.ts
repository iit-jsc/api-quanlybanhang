import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common'

interface BlockedIP {
  blockedAt: number
  blockedUntil: number
  requestCount: number
  reason: string
}

interface RequestWindow {
  count: number
  windowStart: number
  lastRequest: number
}

@Injectable()
export class IpBlockGuard implements CanActivate {
  private readonly logger = new Logger(IpBlockGuard.name)
  private readonly MAX_REQUESTS = 100
  private readonly WINDOW_SIZE = 10 * 1000
  private readonly BLOCK_DURATION = 60 * 1000

  // In-memory storage
  private readonly blockedIPs = new Map<string, BlockedIP>()
  private readonly requestWindows = new Map<string, RequestWindow>()

  // Cleanup interval để giải phóng memory
  private cleanupInterval: NodeJS.Timeout
  constructor() {
    // Chạy cleanup mỗi 2 phút để giải phóng memory
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup()
      },
      2 * 60 * 1000
    )
  }
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const clientIp = this.getClientIp(request)
    const now = Date.now()

    // Log mỗi request để debug
    this.logger.log(`Processing request from IP: ${clientIp} to ${request.url}`)

    // Kiểm tra nếu IP đang bị block
    if (this.isBlocked(clientIp, now)) {
      const blockedInfo = this.blockedIPs.get(clientIp)!
      const remainingTime = Math.ceil((blockedInfo.blockedUntil - now) / 1000)

      this.logger.warn(
        `Blocked IP ${clientIp} attempted access. Remaining block time: ${remainingTime}s`
      )

      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: `IP của bạn đã bị tạm thời chặn do vi phạm giới hạn request. Vui lòng thử lại sau ${remainingTime} giây.`,
          error: 'IP Temporarily Blocked',
          blockedUntil: new Date(blockedInfo.blockedUntil).toISOString(),
          retryAfter: remainingTime,
          reason: blockedInfo.reason
        },
        HttpStatus.FORBIDDEN
      )
    }

    // Kiểm tra rate limiting
    if (this.shouldBlockIP(clientIp, now)) {
      this.blockIP(clientIp, now, 'Rate limit exceeded')

      this.logger.warn(
        `IP ${clientIp} has been blocked for ${this.BLOCK_DURATION / 1000}s due to rate limit violation`
      )

      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: `Bạn đã gửi quá nhiều request (${this.MAX_REQUESTS} requests trong ${this.WINDOW_SIZE / 1000}s). IP của bạn đã bị tạm thời chặn trong ${this.BLOCK_DURATION / 1000} giây.`,
          error: 'Rate Limit Exceeded - IP Blocked',
          maxRequests: this.MAX_REQUESTS,
          windowSize: `${this.WINDOW_SIZE / 1000}s`,
          blockDuration: `${this.BLOCK_DURATION / 1000}s`,
          retryAfter: this.BLOCK_DURATION / 1000
        },
        HttpStatus.FORBIDDEN
      )
    }

    return true
  }

  private isBlocked(ip: string, now: number): boolean {
    const blockedInfo = this.blockedIPs.get(ip)
    if (!blockedInfo) return false

    // Kiểm tra nếu thời gian block đã hết
    if (now >= blockedInfo.blockedUntil) {
      this.blockedIPs.delete(ip)
      this.logger.log(`IP ${ip} has been unblocked after serving block duration`)
      return false
    }

    return true
  }
  private shouldBlockIP(ip: string, now: number): boolean {
    const window = this.requestWindows.get(ip)

    if (!window || now - window.windowStart > this.WINDOW_SIZE) {
      // Tạo window mới
      this.requestWindows.set(ip, {
        count: 1,
        windowStart: now,
        lastRequest: now
      })
      return false
    }

    // Tăng counter
    window.count++
    window.lastRequest = now

    this.logger.debug(`IP ${ip}: ${window.count}/${this.MAX_REQUESTS} requests in current window`)

    return window.count > this.MAX_REQUESTS
  }

  private blockIP(ip: string, now: number, reason: string): void {
    const window = this.requestWindows.get(ip)
    const requestCount = window ? window.count : 0

    this.blockedIPs.set(ip, {
      blockedAt: now,
      blockedUntil: now + this.BLOCK_DURATION,
      requestCount,
      reason
    })

    // Xóa window sau khi block
    this.requestWindows.delete(ip)

    this.logger.warn(
      `IP ${ip} blocked for ${this.BLOCK_DURATION / 1000}s. Reason: ${reason}. Request count: ${requestCount}`
    )
  }

  private cleanup(): void {
    const now = Date.now()
    let cleanedBlocked = 0
    let cleanedWindows = 0

    // Cleanup expired blocked IPs
    for (const [ip, blockedInfo] of this.blockedIPs.entries()) {
      if (now >= blockedInfo.blockedUntil) {
        this.blockedIPs.delete(ip)
        cleanedBlocked++
      }
    }

    // Cleanup old request windows
    for (const [ip, window] of this.requestWindows.entries()) {
      if (now - window.lastRequest > this.WINDOW_SIZE * 2) {
        this.requestWindows.delete(ip)
        cleanedWindows++
      }
    }

    if (cleanedBlocked > 0 || cleanedWindows > 0) {
      this.logger.debug(
        `Cleanup completed: ${cleanedBlocked} blocked IPs, ${cleanedWindows} old windows removed`
      )
    }

    // Log memory usage
    this.logger.debug(
      `Current memory usage - Blocked IPs: ${this.blockedIPs.size}, Active windows: ${this.requestWindows.size}`
    )
  }

  private getClientIp(request: any): string {
    const ip =
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.headers['cf-connecting-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      'unknown'

    // Nếu x-forwarded-for chứa nhiều IP, lấy IP đầu tiên
    return typeof ip === 'string' ? ip.split(',')[0].trim() : String(ip)
  }

  // Method để admin có thể unblock IP thủ công
  public unblockIP(ip: string): boolean {
    if (this.blockedIPs.has(ip)) {
      this.blockedIPs.delete(ip)
      this.requestWindows.delete(ip)
      this.logger.log(`IP ${ip} has been manually unblocked by admin`)
      return true
    }
    return false
  }
  // Method để admin có thể xem danh sách IP bị block
  public getBlockedIPs(): Array<{ ip: string; info: BlockedIP }> {
    const result: Array<{ ip: string; info: BlockedIP }> = []
    for (const [ip, info] of this.blockedIPs.entries()) {
      result.push({ ip, info })
    }
    return result
  }

  // Method để admin có thể xem stats
  public getStats(): {
    blockedCount: number
    activeWindows: number
    memoryUsage: string
  } {
    return {
      blockedCount: this.blockedIPs.size,
      activeWindows: this.requestWindows.size,
      memoryUsage: `${this.blockedIPs.size + this.requestWindows.size} entries`
    }
  }

  // Cleanup khi service bị destroy
  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}
