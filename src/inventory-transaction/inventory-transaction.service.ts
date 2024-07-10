import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class InventoryTransactionService {
  constructor(private readonly prisma: PrismaService) {}
}
