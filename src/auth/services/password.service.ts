import * as bcrypt from 'bcrypt'
import { Injectable } from '@nestjs/common'
import { HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { ChangeMyPasswordDto } from '../dto/change-password.dto'
import { accountShortSelect } from 'responses/account.response'

@Injectable()
export class PasswordService {
  constructor(private readonly prisma: PrismaService) {}

  async changePassword(data: ChangeMyPasswordDto, accountId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId }
    })

    if (!account || !bcrypt.compareSync(data.oldPassword, account.password)) {
      throw new HttpException('Mật khẩu cũ không chính xác!', HttpStatus.CONFLICT)
    }

    return await this.prisma.account.update({
      where: { id: accountId },
      data: {
        password: bcrypt.hashSync(data.newPassword, 10)
      },
      select: accountShortSelect
    })
  }

  hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10)
  }

  comparePassword(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword)
  }
}
