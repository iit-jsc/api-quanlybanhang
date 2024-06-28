import { Injectable } from '@nestjs/common';

import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class BusinessTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.businessType.findMany();
  }
}
