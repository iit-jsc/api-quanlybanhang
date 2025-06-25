import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RATE_LIMIT_KEY, RateLimitOptions } from './rate-limit.decorator'

@Injectable()
export class AntiSpamGuard implements CanActivate {
  private readonly logger = new Logger(AntiSpamGuard.name)
  private readonly requestCounts = new Map<
    string,
    Map<string, { count: number; timestamp: number }>
  >()
  private readonly DEFAULT_LIMIT = 60
  private readonly DEFAULT_WINDOW = 60 * 1000 // 1 minute

  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const clientIp = this.getClientIp(request)
    const now = Date.now()

    // Get rate limit config for this endpoint
    const rateLimitConfig = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler()
    )

    // Skip rate limiting if no config found
    if (!rateLimitConfig) {
      return true
    }

    const limit = rateLimitConfig.limit || this.DEFAULT_LIMIT
    const windowMs = rateLimitConfig.ttl || this.DEFAULT_WINDOW

    // Create endpoint-specific key (IP + path + method)
    const endpointKey = `${request.method}:${request.route?.path || request.url}`

    this.logger.debug(
      `Rate limiting check for ${clientIp} on ${endpointKey}, limit: ${limit}, window: ${windowMs}ms`
    )

    // Get or create IP-specific map
    if (!this.requestCounts.has(clientIp)) {
      this.requestCounts.set(clientIp, new Map())
    }
    const ipCounts = this.requestCounts.get(clientIp)!

    // Get endpoint-specific count
    const requestInfo = ipCounts.get(endpointKey)

    if (!requestInfo) {
      // First request for this IP + endpoint
      ipCounts.set(endpointKey, { count: 1, timestamp: now })
      this.logger.debug(`First request for ${clientIp} on ${endpointKey}`)
      return true
    }

    // Check if window has expired
    if (now - requestInfo.timestamp > windowMs) {
      // Reset counter for new window
      ipCounts.set(endpointKey, { count: 1, timestamp: now })
      this.logger.debug(
        `Rate limit window expired for ${clientIp} on ${endpointKey}, resetting counter`
      )
      return true
    }

    // Increment counter
    requestInfo.count++
    this.logger.debug(
      `Request count for ${clientIp} on ${endpointKey}: ${requestInfo.count}/${limit}`
    )

    // Check if limit exceeded
    if (requestInfo.count > limit) {
      const retryAfter = Math.ceil((windowMs - (now - requestInfo.timestamp)) / 1000)
      this.logger.warn(
        `Rate limit exceeded for ${clientIp} on ${endpointKey}: ${requestInfo.count}/${limit}. Retry after ${retryAfter}s`
      )

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Quá nhiều yêu cầu. Vui lòng thử lại sau ${retryAfter} giây.`,
          error: 'Too Many Requests',
          endpoint: endpointKey,
          limit: limit,
          window: `${windowMs / 1000}s`,
          retryAfter
        },
        HttpStatus.TOO_MANY_REQUESTS
      )
    }

    return true
  }

  private getClientIp(request: any): string {
    const ip =
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      'unknown'

    // If x-forwarded-for contains multiple IPs, get the first one
    return typeof ip === 'string' ? ip.split(',')[0].trim() : String(ip)
  }
}
