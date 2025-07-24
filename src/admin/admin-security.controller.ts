import { Controller, Get, Post, Param, Delete, UseGuards } from '@nestjs/common'
import { IpBlockGuard } from '../../security/ip-block.guard'
import { JwtAuthGuard } from '../../guards/jwt-auth.guard'
import { RolesGuard } from '../../guards/roles.guard'
import { Roles } from '../../guards/roles.decorator'

@Controller('admin/security')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminSecurityController {
  constructor(private readonly ipBlockGuard: IpBlockGuard) {}

  @Get('blocked-ips')
  getBlockedIPs() {
    const blockedIPs = this.ipBlockGuard.getBlockedIPs()
    return {
      statusCode: 200,
      message: 'Danh sách IP bị chặn',
      data: {
        totalBlocked: blockedIPs.length,
        blockedIPs: blockedIPs.map(({ ip, info }) => ({
          ip,
          blockedAt: new Date(info.blockedAt).toISOString(),
          blockedUntil: new Date(info.blockedUntil).toISOString(),
          requestCount: info.requestCount,
          reason: info.reason,
          remainingTime: Math.max(0, Math.ceil((info.blockedUntil - Date.now()) / 1000))
        }))
      }
    }
  }

  @Get('stats')
  getSecurityStats() {
    const stats = this.ipBlockGuard.getStats()
    return {
      statusCode: 200,
      message: 'Thống kê bảo mật',
      data: {
        ...stats,
        timestamp: new Date().toISOString()
      }
    }
  }

  @Delete('unblock/:ip')
  unblockIP(@Param('ip') ip: string) {
    const success = this.ipBlockGuard.unblockIP(ip)

    if (success) {
      return {
        statusCode: 200,
        message: `IP ${ip} đã được bỏ chặn thành công`,
        data: { ip, unblockedAt: new Date().toISOString() }
      }
    } else {
      return {
        statusCode: 404,
        message: `IP ${ip} không tồn tại trong danh sách chặn`,
        data: { ip }
      }
    }
  }

  @Post('test-block/:ip')
  testBlockIP(@Param('ip') ip: string) {
    // Chỉ dùng để test - không nên sử dụng trong production
    return {
      statusCode: 200,
      message: `Đây là endpoint test để kiểm tra IP blocking cho ${ip}`,
      data: {
        ip,
        timestamp: new Date().toISOString(),
        note: 'Endpoint này chỉ dành cho testing'
      }
    }
  }
}
