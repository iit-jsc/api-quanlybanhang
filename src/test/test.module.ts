import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { TestController } from './test.controller'
import { TestService } from './test.service'

@Module({
  imports: [HttpModule],
  controllers: [TestController],
  providers: [TestService],
  exports: [TestService]
})
export class TestModule {}
