import * as bcrypt from 'bcrypt'
import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { CreateUserDto } from '../dto/shop.dto'

@Injectable()
export class UserService {
  async createUser(data: CreateUserDto, branchIds: string[], roleId: string, prisma: PrismaClient) {
    const user = await prisma.user.create({
      data: {
        phone: data.phone,
        name: faker.person.fullName(),
        code: faker.string.alphanumeric(6),
        address: faker.location.streetAddress(),
        cardId: faker.string.numeric(12),
        cardDate: faker.date.past(),
        cardAddress: faker.location.city(),
        birthday: faker.date.birthdate(),
        sex: faker.helpers.arrayElement(['MALE', 'FEMALE']),
        account: {
          create: {
            password: bcrypt.hashSync(data.password, 10),
            roles: {
              connect: { id: roleId }
            },
            branches: {
              connect: branchIds.map(id => ({ id }))
            }
          }
        }
      }
    })

    console.log('✅ Created user and account!')
    return user
  }

  async createEmployeeGroups(shopId: string, prisma: PrismaClient) {
    const employeeGroups = [
      {
        name: 'Nhân viên',
        description: 'Nhóm dành cho nhân viên cửa hàng.'
      },
      {
        name: 'Quản lý',
        description: 'Nhóm dành cho quản lý cửa hàng.'
      }
    ]

    const groupPromises = employeeGroups.map(group =>
      prisma.employeeGroup.create({
        data: {
          name: group.name,
          description: group.description,
          shopId
        }
      })
    )

    const createdGroups = await Promise.all(groupPromises)
    console.log('✅ Created employee groups!')
    return createdGroups
  }
}
