import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('test-ip-blocking')
  testIpBlocking(): { message: string; timestamp: string } {
    return {
      message: 'IP Blocking test endpoint',
      timestamp: new Date().toISOString()
    }
  }
}
