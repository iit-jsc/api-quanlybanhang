import { Module, Global } from '@nestjs/common'
import { ThrottlerModule } from '@nestjs/throttler'
import { AntiSpamGuard } from './anti-spam.guard'
import { IpWhitelistGuard } from './ip-whitelist.guard'
import { SecurityInterceptor } from './security.interceptor'

@Global()
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100 // 100 requests per minute per IP
      }
    ])
  ],
  providers: [AntiSpamGuard, IpWhitelistGuard, SecurityInterceptor],
  exports: [AntiSpamGuard, IpWhitelistGuard, SecurityInterceptor]
})
export class SecurityModule {}
