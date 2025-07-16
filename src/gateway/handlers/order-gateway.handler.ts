import { Server } from 'socket.io'
import { WebSocketServer } from '@nestjs/websockets'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class OrderGatewayHandler {
  @WebSocketServer()
  private server: Server

  setServer(server: Server) {
    this.server = server
  }

  private async emitToBranch(event: string, payload: any, branchId: string, deviceId?: string) {
    const target = this.server.to(branchId)

    if (deviceId) {
      const accountSocket = await prisma.accountSocket.findUnique({
        where: { deviceId }
      })

      if (accountSocket?.socketId) {
        target.except(accountSocket.socketId).emit(event, payload)
        return
      }
    }

    target.emit(event, payload)
  }

  async handleCreateOrder(payload: any, branchId: string, deviceId?: string) {
    await this.emitToBranch('create-order', payload, branchId, deviceId)
  }

  async handleUpdateOrder(payload: any, branchId: string, deviceId?: string) {
    await this.emitToBranch('update-order', payload, branchId, deviceId)
  }

  async handleDeleteOrder(payload: any, branchId: string, deviceId?: string) {
    await this.emitToBranch('delete-order', payload, branchId, deviceId)
  }

  async handleCancelOrder(payload: any, branchId: string, deviceId?: string) {
    await this.emitToBranch('cancel-order', payload, branchId, deviceId)
  }
  async handlePaymentSuccessfully(payload: any, deviceId: string) {
    // Chỉ emit tới socketId của account có deviceId cụ thể
    const accountSocket = await prisma.accountSocket.findUnique({
      where: { deviceId }
    })

    if (accountSocket?.socketId)
      this.server.to(accountSocket.socketId).emit('payment-successfully', payload)
  }
}
