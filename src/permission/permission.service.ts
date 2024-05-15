import { Injectable } from '@nestjs/common';
import { TokenPayload } from 'interfaces/common.interface';
import { PrismaService } from 'nestjs-prisma';
import { CreatePermissionDTO } from './dto/create-permission.dto';

@Injectable()
export class PermissionService {
  private readonly prisma: PrismaService;

  async create(data: CreatePermissionDTO, tokenPayload: TokenPayload) {
    // return this.prisma.permission.create({
    // });
  }
}
