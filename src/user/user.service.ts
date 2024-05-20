import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateUserDTO } from './dto/create-user-dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDTO) {
    return this.prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        type: data.type,
        accounts: {
          create: {
            password: bcrypt.hashSync(data.account.password, 10),
            status: data.account.status,
          },
        },
      },
    });
  }

  async getByAccountId(id: number) {
    return this.prisma.user.findFirst({
      where: {
        isPublic: true,
        accounts: {
          some: {
            id,
          },
        },
      },
    });
  }

  async findByPhoneWithType(phone: string, type: number) {
    return this.prisma.user.findFirst({
      where: {
        isPublic: true,
        type,
        phone,
      },
    });
  }
}
