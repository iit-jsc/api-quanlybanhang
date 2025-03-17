import { DynamicModule, Module, Global } from '@nestjs/common'
import { TrashController } from 'src/trash/trash.controller'
import { TrashService } from 'src/trash/trash.service'

@Global()
@Module({
  controllers: [TrashController],
  providers: [TrashService]
})
export class TrashModule {
  static forRoot(options?: { isGlobal?: boolean }): DynamicModule {
    return {
      module: TrashModule,
      global: options?.isGlobal ?? false,
      providers: [TrashService],
      exports: [TrashService],
      controllers: [TrashController]
    }
  }
}
