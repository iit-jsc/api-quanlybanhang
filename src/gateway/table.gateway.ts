import { UseGuards } from '@nestjs/common';
import { WebSocketGateway } from '@nestjs/websockets';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import { Table } from '@prisma/client';
import { BaseGateway } from './base.gateway'; // Import BaseGateway

@UseGuards(JwtAuthGuard)
@WebSocketGateway()
export class TableGateway extends BaseGateway {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  async handleModifyTable(payload: Table) {
    const accountOnline = await this.getAccountsOnline(payload.branchId);

    const socketIds = accountOnline.map((account) => account.socketId);

    if (socketIds.length > 0) {
      console.log(
        `#1 handleModifyTable - Bàn ${payload.id} đã gửi socket cho: ${socketIds}`,
      );

      this.server.to(socketIds).emit('table', payload);
    }
  }
}
