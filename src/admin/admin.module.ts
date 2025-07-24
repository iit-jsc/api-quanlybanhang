import { Module } from '@nestjs/common'
import { AdminSecurityController } from './admin-security.controller'
import { SecurityModule } from '../../security'

@Module({
  imports: [SecurityModule],
  controllers: [AdminSecurityController]
})
export class AdminModule {}
