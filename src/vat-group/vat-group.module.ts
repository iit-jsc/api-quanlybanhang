import { Module } from '@nestjs/common'
import { VatGroupService } from './vat-group.service'
import { VatGroupController } from './vat-group.controller'
import { TrashModule } from 'src/trash/trash.module'
import { ActivityLogModule } from 'src/activity-log/activity-log.module'

@Module({
  imports: [TrashModule, ActivityLogModule],
  controllers: [VatGroupController],
  providers: [VatGroupService],
  exports: [VatGroupService]
})
export class VatGroupModule {}
