import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common'
import { Response, Request } from 'express'
import { LoginDto } from './dto/login.dto'
import { AuthService } from './auth.service'
import { AccessBranchDto } from './dto/access-branch.dto'
import { RequestJWT } from 'interfaces/common.interface'

import { AccessBranchGuard } from 'guards/access-branch.guard'
import { ChangeMyPasswordDto } from './dto/change-password.dto'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RegisterDto } from './dto/register.dto'
import { AntiSpamGuard, RateLimit } from '../../security'

@Controller('auth')
@UseGuards(AntiSpamGuard) // Sử dụng AntiSpamGuard đã cải thiện
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ limit: 5, ttl: 60000 }) // 5 attempts per minute for login
  login(@Body() data: LoginDto) {
    return this.authService.login(data)
  }

  @Post('/access-branch')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessBranchGuard)
  async accessBranch(
    @Body() data: AccessBranchDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: RequestJWT
  ) {
    const { accountId } = req

    return this.authService.accessBranch(accountId, data, res)
  }

  @Patch('/change-my-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  changeMyPassword(@Body() data: ChangeMyPasswordDto, @Req() req: RequestJWT) {
    const { accountId } = req

    return this.authService.changeMyPassword(data, accountId)
  }

  @Get('/get-me')
  @HttpCode(HttpStatus.OK)
  getMe(@Headers('authorization') authHeader: string) {
    if (!authHeader) throw new HttpException('Không tìm thấy auth header!', HttpStatus.UNAUTHORIZED)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, token] = authHeader.split(' ')

    if (!token) throw new HttpException('Không tìm thấy token!', HttpStatus.UNAUTHORIZED)

    return this.authService.getMe(token)
  }

  @Post('/refresh-token')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Req() req: Request) {
    const refreshToken = req.cookies['refreshToken']

    if (!refreshToken) throw new HttpException('Không tìm thấy token!', HttpStatus.UNAUTHORIZED)

    return this.authService.refreshToken(refreshToken)
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: RequestJWT) {
    const { deviceId } = req

    return this.authService.logout(deviceId)
  }

  @Post('/register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() data: RegisterDto) {
    return this.authService.register(data)
  }

  @Get('/test-rate-limit')
  @RateLimit({ limit: 3, ttl: 10000 }) // 3 requests per 10 seconds for testing
  testRateLimit() {
    return {
      message: 'Rate limit test endpoint',
      timestamp: new Date().toISOString(),
      count: Math.floor(Math.random() * 1000)
    }
  }
  @Get('/debug-ip')
  debugIp(@Req() req: Request) {
    return {
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
      'connection.remoteAddress': (req as any).connection?.remoteAddress,
      'socket.remoteAddress': (req as any).socket?.remoteAddress,
      ip: (req as any).ip,
      'user-agent': req.headers['user-agent'],
      headers: req.headers
    }
  }
}
