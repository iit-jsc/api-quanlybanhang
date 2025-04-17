import { WebSocketGateway } from '@nestjs/websockets'
import { PrismaService } from 'nestjs-prisma'
import { BaseGateway } from './base.gateway'
import { JwtService } from '@nestjs/jwt'
@WebSocketGateway()
export class OrderDetailGateway extends BaseGateway {
  constructor(prisma: PrismaService, jwtService: JwtService) {
    super(prisma, jwtService)
  }

  async handleCreateOrderDetails(payload: any, branchId: string, deviceId: string) {
    const emitData = Array.isArray(payload) ? payload : [payload]

    const target = this.server.to(branchId)

    if (deviceId) {
      const accountSocket = await this.prisma.accountSocket.findUnique({ where: { deviceId } })
      if (accountSocket?.socketId) {
        target.except(accountSocket.socketId).emit('create-order-details', emitData)
        return
      }
    }

    target.emit('create-order-details', emitData)
  }

  async handleDeleteOrderDetails(payload: any, branchId: string, deviceId: string) {
    const emitData = Array.isArray(payload) ? payload : [payload]

    const target = this.server.to(branchId)

    if (deviceId) {
      const accountSocket = await this.prisma.accountSocket.findUnique({ where: { deviceId } })
      if (accountSocket?.socketId) {
        target.except(accountSocket.socketId).emit('delete-order-details', emitData)
        return
      }
    }

    target.emit('delete-order-details', emitData)
  }

  async handleUpdateOrderDetails(payload: any, branchId: string, deviceId: string) {
    const emitData = Array.isArray(payload) ? payload : [payload]

    const target = this.server.to(branchId)

    if (deviceId) {
      const accountSocket = await this.prisma.accountSocket.findUnique({ where: { deviceId } })
      if (accountSocket?.socketId) {
        target.except(accountSocket.socketId).emit('update-order-details', emitData)
        return
      }
    }

    target.emit('update-order-details', emitData)
  }

  async handleCancelOrderDetails(payload: any, branchId: string, deviceId: string) {
    const emitData = Array.isArray(payload) ? payload : [payload]

    const target = this.server.to(branchId)

    if (deviceId) {
      const accountSocket = await this.prisma.accountSocket.findUnique({ where: { deviceId } })
      if (accountSocket?.socketId) {
        target.except(accountSocket.socketId).emit('cancel-order-details', emitData)
        return
      }
    }

    target.emit('cancel-order-details', emitData)
  }
}
