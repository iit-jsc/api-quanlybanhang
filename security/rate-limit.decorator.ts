import { SetMetadata } from '@nestjs/common'

export interface RateLimitOptions {
  limit: number
  ttl: number // time to live in milliseconds
}

export const RATE_LIMIT_KEY = 'rateLimit'
export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options)
