import { Server } from 'socket.io'
import { WebSocketServer } from '@nestjs/websockets'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class TableGatewayHandler {
  @WebSocketServer()
  private server: Server

  private isServerReady = false

  setServer(server: Server) {
    this.server = server
    this.isServerReady = true
  }

  private async emitTableDishEvent(
    event: string,
    payload: any,
    branchId: string,
    deviceId?: string
  ) {
    // Check if server is initialized

    const emitData = Array.isArray(payload) ? payload : [payload]
    const target = this.server.to(branchId)

    if (deviceId) {
      try {
        const accountSocket = await prisma.accountSocket.findUnique({
          where: { deviceId }
        })

        if (accountSocket?.socketId) {
          target.except(accountSocket.socketId).emit(event, emitData)
          return
        }
      } catch (error) {
        console.error('Error finding account socket:', error)
      }
    }

    target.emit(event, emitData)
  }

  async handleAddDish(payload: any, branchId: string, deviceId?: string) {
    await this.emitTableDishEvent('add-dish-to-table', payload, branchId, deviceId)
  }

  async handleUpdateTable(payload: any, branchId: string, deviceId?: string) {
    await this.emitTableDishEvent('update-table', payload, branchId, deviceId)
  }
}
