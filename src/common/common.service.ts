import { ACTIVITY_LOG_TYPE } from './../../enums/common.enum'
import { HttpStatus, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { ORDER_STATUS_COMMON } from 'enums/order.enum'
import { AnyObject, TokenPayload } from 'interfaces/common.interface'
import { PrismaService } from 'nestjs-prisma'
import { shopLoginSelect } from 'responses/shop.response'
import { OrderProductDto } from 'src/promotion/dto/find-many.dto'
import { ConfirmEmailDto } from 'src/shop/dto/confirm-email.dto'
import { CustomHttpException } from 'utils/ApiErrors'

@Injectable()
export class CommonService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadPhotoURLs(data: { photoURLs: string[] }) {
    return data.photoURLs
  }

  async findManyShopByAccountId(id: string) {
    return await this.prisma.shop.findMany({
      where: {
        branches: {
          some: {
            accounts: {
              some: {
                id
              }
            }
          }
        }
      },
      select: shopLoginSelect(id)
    })
  }

  async findByIdWithBranch(id: string, model: Prisma.ModelName, branchId: string) {
    return this.prisma[model].findFirstOrThrow({
      where: {
        id,
        branchId: branchId
      }
    })
  }

  async findByIdWithShop(id: string, model: Prisma.ModelName, shopId: string) {
    return this.prisma[model].findFirstOrThrow({
      where: {
        id,
        shop: {
          id: shopId
        }
      }
    })
  }

  async checkTableIsReady(id: string) {
    const table = await this.prisma.table.findFirst({
      where: {
        id,
        NOT: {
          orderDetails: {
            some: {}
          }
        }
      }
    })

    if (!table) throw new CustomHttpException(HttpStatus.CONFLICT, 'Bàn này không sẵn sàng!')
  }

  async confirmOTP(data: ConfirmEmailDto) {
    const otp = await this.prisma.contactVerification.findFirst({
      where: {
        otp: data.otp,
        email: data.email,
        isUsed: false,
        createdAt: {
          gt: new Date(Date.now() - +process.env.OTP_EXPIRATION_TIME * 1000)
        }
      }
    })

    if (!otp) throw new CustomHttpException(HttpStatus.BAD_REQUEST, 'Mã OTP không hợp lệ!')

    if (otp.attempts > +process.env.MAX_OTP_ATTEMPTS)
      throw new CustomHttpException(HttpStatus.CONFLICT, 'Đã quá số lần thử!')

    await this.prisma.contactVerification.update({
      where: { id: otp.id },
      data: { isUsed: true }
    })
  }

  async checkDataExistingInBranch<T extends AnyObject>(
    data: T,
    model: Prisma.ModelName,
    branchId: string,
    id?: string
  ) {
    let conflictingKeys: string[] = []

    const result = await this.prisma[model].findFirst({
      where: {
        branchId: branchId,
        OR: Object.keys(data).map(key => ({
          [key]: { equals: data[key] }
        }))
      }
    })

    if (result && result.id !== id) {
      conflictingKeys = Object.keys(data).filter(key => result[key] === data[key])

      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        'Dữ liệu đã tồn tại!',
        conflictingKeys.map(key => ({ [key]: 'Dữ liệu đã được sử dụng!' }))
      )
    }
  }

  async checkDataExistingInShop<T extends AnyObject>(data: T, model: Prisma.ModelName, shopId: string, id?: string) {
    let conflictingKeys: string[] = []

    const result = await this.prisma[model].findFirst({
      where: {
        shopId: shopId,
        OR: Object.keys(data).map(key => ({
          [key]: { equals: data[key] }
        }))
      }
    })

    if (result && result.id !== id) {
      conflictingKeys = Object.keys(data).filter(key => result[key] === data[key])

      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        'Dữ liệu đã tồn tại!',
        conflictingKeys.map(key => ({ [key]: 'Dữ liệu đã được sử dụng!' }))
      )
    }
  }

  async generateBranchCode() {
    // const shop = await this.prisma.branch.findFirst({
    //   orderBy: {
    //     code: 'desc',
    //   },
    //   select: {
    //     code: true,
    //   },
    // });
    // if (!shop) return 'IIT0001';
    // const numberPart = +shop.code.slice(3);
    // const nextNumber = (numberPart + 1).toString().padStart(4, '0');
    // return `IIT${nextNumber}`;
  }

  async checkAccountExisting<T extends AnyObject>(data: T, shopId: string, id?: string) {
    let conflictingKeys: string[] = []

    const result = await this.prisma.account.findFirst({
      where: {
        OR: Object.keys(data).map(key => ({
          [key]: { equals: data[key] }
        })),
        branches: {
          some: {
            shopId: shopId
          }
        }
      }
    })

    if (result && result.id !== id) {
      conflictingKeys = Object.keys(data).filter(key => result[key] === data[key])

      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        'Dữ liệu đã tồn tại!',
        conflictingKeys.map(key => ({ [key]: 'Dữ liệu đã được sử dụng!' }))
      )
    }
  }

  async checkUserExisting<T extends AnyObject>(data: T, shopId: string, id?: string) {
    let conflictingKeys: string[] = []

    const result = await this.prisma.user.findFirst({
      where: {
        OR: Object.keys(data).map(key => ({
          [key]: { equals: data[key] }
        })),
        account: {
          branches: {
            some: {
              shopId: shopId
            }
          }
        }
      },
      include: {
        account: {
          include: {
            branches: true
          }
        }
      }
    })

    if (result && result.id !== id) {
      conflictingKeys = Object.keys(data).filter(key => result[key] === data[key])

      throw new CustomHttpException(
        HttpStatus.CONFLICT,
        'Dữ liệu đã tồn tại!',
        conflictingKeys.map(key => ({ [key]: 'Dữ liệu đã được sử dụng!' }))
      )
    }
  }

  async checkOrderCancel(orderId: string, orderStatus: number) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId
      },
      select: { id: true, isPaid: true }
    })

    if (order.isPaid === true && orderStatus === ORDER_STATUS_COMMON.CANCELLED)
      throw new CustomHttpException(HttpStatus.CONFLICT, 'Đơn hàng này không thể hủy vì đã thanh toán!')
  }

  async findAllIdsInBranch(model: Prisma.ModelName, branchId: string, condition?: AnyObject) {
    const list = await this.prisma[model].findMany({
      where: {
        branchId,
        ...(condition && condition)
      },
      select: {
        id: true
      }
    })

    return list.map(item => item.id)
  }

  async createActivityLog(
    recordIds: string[],
    tableName: Prisma.ModelName,
    type: ACTIVITY_LOG_TYPE,
    tokenPayload: TokenPayload
  ) {
    return this.prisma.activityLog.create({
      data: {
        tableName,
        type,
        recordIds,
        account: {
          connect: {
            id: tokenPayload.accountId
          }
        },
        branch: {
          connect: {
            id: tokenPayload.branchId
          }
        }
      }
    })
  }

  aggregateOrderProducts(orderProducts: OrderProductDto[]) {
    if (!orderProducts && !orderProducts?.length) return orderProducts

    return Object.values(
      orderProducts.reduce((acc, { productId, amount }) => {
        if (!acc[productId]) {
          acc[productId] = { productId, amount: 0 }
        }
        acc[productId].amount += amount
        return acc
      }, {} as OrderProductDto)
    )
  }
}
