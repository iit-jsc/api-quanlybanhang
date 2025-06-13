import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { UpdateBranchDto } from './dto/create-branch.dto'

@Injectable()
export class BranchService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentBranch(id: string) {
    return await this.prisma.branch.findUniqueOrThrow({
      where: {
        id
      }
    })
  }

  async updateCurrentBranch(data: UpdateBranchDto, branchId: string, accountId: string) {
    const branch = await this.prisma.branch.update({
      data: {
        name: data.name,
        address: data.address,
        photoURL: data.photoURL,
        bannerURL: data.bannerURL,
        phone: data.phone,
        updatedBy: accountId
      },
      where: {
        id: branchId
      }
    })

    return branch
  }
}
