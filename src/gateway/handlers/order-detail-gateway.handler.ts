import { Server } from 'socket.io'
import { PrismaService } from 'nestjs-prisma'
import { WebSocketServer } from '@nestjs/websockets'

export class OrderDetailGatewayHandler {
  @WebSocketServer()
  private server: Server

  constructor(private readonly prisma: PrismaService) {}

  setServer(server: Server) {
    this.server = server
  }

  private async emitOrderDetailsEvent(
    event: string,
    payload: any,
    branchId: string,
    deviceId?: string
  ) {
    const emitData = Array.isArray(payload) ? payload : [payload]
    const target = this.server.to(branchId)

    if (deviceId) {
      const accountSocket = await this.prisma.accountSocket.findUnique({
        where: { deviceId }
      })

      if (accountSocket?.socketId) {
        target.except(accountSocket.socketId).emit(event, emitData)
        return
      }
    }

    target.emit(event, emitData)
  }

  async handleCreateOrderDetails(payload: any, branchId: string, deviceId?: string) {
    await this.emitOrderDetailsEvent('create-order-details', payload, branchId, deviceId)
  }

  async handleDeleteOrderDetails(payload: any, branchId: string, deviceId?: string) {
    await this.emitOrderDetailsEvent('delete-order-details', payload, branchId, deviceId)
  }

  async handleUpdateOrderDetails(payload: any, branchId: string, deviceId?: string) {
    await this.emitOrderDetailsEvent('update-order-details', payload, branchId, deviceId)
  }

  async handleCancelOrderDetails(payload: any, branchId: string, deviceId?: string) {
    await this.emitOrderDetailsEvent('cancel-order-details', payload, branchId, deviceId)
  }
}
