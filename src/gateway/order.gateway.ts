import { WebSocketGateway } from '@nestjs/websockets'
import { PrismaService } from 'nestjs-prisma'
import { BaseGateway } from './base.gateway'
import { JwtService } from '@nestjs/jwt'
@WebSocketGateway()
export class OrderGateway extends BaseGateway {
  constructor(prisma: PrismaService, jwtService: JwtService) {
    super(prisma, jwtService)
  }

  async handleCreateOrder(payload: any, branchId: string, deviceId: string) {
    const target = this.server.to(branchId)

    if (deviceId) {
      const accountSocket = await this.prisma.accountSocket.findUnique({ where: { deviceId } })
      if (accountSocket?.socketId) {
        target.except(accountSocket.socketId).emit('create-order', payload)
        return
      }
    }

    target.emit('create-order', payload)
  }

  async handleUpdateOrder(payload: any, branchId: string, deviceId: string) {
    const target = this.server.to(branchId)

    if (deviceId) {
      const accountSocket = await this.prisma.accountSocket.findUnique({ where: { deviceId } })
      if (accountSocket?.socketId) {
        target.except(accountSocket.socketId).emit('update-order', payload)
        return
      }
    }

    target.emit('update-order', payload)
  }

  async handleDeleteOrder(payload: any, branchId: string, deviceId: string) {
    const target = this.server.to(branchId)

    if (deviceId) {
      const accountSocket = await this.prisma.accountSocket.findUnique({ where: { deviceId } })
      if (accountSocket?.socketId) {
        target.except(accountSocket.socketId).emit('delete-order', payload)
        return
      }
    }

    target.emit('delete-order', payload)
  }

  async handleCancelOrder(payload: any, branchId: string, deviceId: string) {
    const target = this.server.to(branchId)

    if (deviceId) {
      const accountSocket = await this.prisma.accountSocket.findUnique({ where: { deviceId } })
      if (accountSocket?.socketId) {
        target.except(accountSocket.socketId).emit('cancel-order', payload)
        return
      }
    }

    target.emit('cancel-order', payload)
  }
}
