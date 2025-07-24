import { Module, Global } from '@nestjs/common'
import { IpWhitelistGuard } from './ip-whitelist.guard'
import { IpBlockGuard } from './ip-block.guard'
import { SecurityInterceptor } from './security.interceptor'

@Global()
@Module({
  providers: [IpWhitelistGuard, IpBlockGuard, SecurityInterceptor],
  exports: [IpWhitelistGuard, IpBlockGuard, SecurityInterceptor]
})
export class SecurityModule {}
