import { WebSocketGateway } from '@nestjs/websockets'
import { PrismaService } from 'nestjs-prisma'
import { Table } from '@prisma/client'
import { BaseGateway } from './base.gateway'
import { JwtService } from '@nestjs/jwt'

@WebSocketGateway()
export class TableGateway extends BaseGateway {
  constructor(prisma: PrismaService, jwtService: JwtService) {
    super(prisma, jwtService)
  }

  async handleModifyTable(payload: Table | Table[], branchId: string, deviceId?: string) {
    try {
      // Chuẩn hóa dữ liệu thành mảng
      const emitData = Array.isArray(payload) ? payload : [payload]

      // Tìm accountSocket nếu deviceId được cung cấp
      const accountSocket = deviceId
        ? await this.prisma.accountSocket.findUnique({ where: { deviceId } })
        : null

      // Gửi sự kiện 'tables' đến tất cả client trong branchId
      const socket = this.server.to(branchId)

      // Nếu có accountSocket, loại trừ socketId của nó
      if (accountSocket?.socketId) {
        socket.except(accountSocket.socketId).emit('tables', emitData)
      } else {
        socket.emit('tables', emitData)
      }
    } catch (error) {
      console.error('Error in handleModifyTable:', error)
    }
  }
}
