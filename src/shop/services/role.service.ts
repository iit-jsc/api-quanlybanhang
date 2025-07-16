import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class RoleService {
  async createRoles(shopId: string, prisma: PrismaClient) {
    const roles = [
      {
        name: 'Bếp',
        description: 'Vai trò dành cho bếp trong cửa hàng',
        permissions: ['VIEW_AREA', 'VIEW_TABLE', 'VIEW_ORDER', 'CHEF_VIEW'],
        isRoot: false
      },
      {
        name: 'Thu ngân',
        description: 'Vai trò dành cho thu ngân trong cửa hàng',
        permissions: [
          'VIEW_AREA',
          'VIEW_TABLE',
          'SEPARATE_TABLE',
          'ADD_DISH_TO_TABLE',
          'CREATE_CUSTOMER',
          'UPDATE_CUSTOMER',
          'VIEW_CUSTOMER',
          'VIEW_CUSTOMER_TYPE',
          'VIEW_PRODUCT_TYPE',
          'VIEW_PRODUCT',
          'VIEW_MEASUREMENT_UNIT',
          'VIEW_PAYMENT_METHOD',
          'VIEW_DISCOUNT_ISSUE',
          'VIEW_DISCOUNT_CODE',
          'VIEW_EMPLOYEE_GROUP',
          'DELETE_CUSTOMER_REQUEST',
          'UPDATE_CUSTOMER_REQUEST',
          'CREATE_ORDER',
          'UPDATE_ORDER',
          'VIEW_ORDER',
          'PAYMENT_ORDER',
          'SAVE_ORDER',
          'CASHIER_VIEW'
        ],
        isRoot: false
      },
      {
        name: 'Nhân viên',
        description: 'Vai trò dành cho nhân viên cửa hàng',
        permissions: [
          'VIEW_AREA',
          'VIEW_TABLE',
          'SEPARATE_TABLE',
          'ADD_DISH_TO_TABLE',
          'CREATE_CUSTOMER',
          'UPDATE_CUSTOMER',
          'VIEW_CUSTOMER',
          'VIEW_CUSTOMER_TYPE',
          'VIEW_PRODUCT_TYPE',
          'VIEW_PRODUCT',
          'VIEW_MEASUREMENT_UNIT',
          'VIEW_PAYMENT_METHOD',
          'VIEW_DISCOUNT_ISSUE',
          'VIEW_DISCOUNT_CODE',
          'VIEW_EMPLOYEE_GROUP',
          'DELETE_CUSTOMER_REQUEST',
          'UPDATE_CUSTOMER_REQUEST',
          'CREATE_ORDER',
          'VIEW_ORDER',
          'SAVE_ORDER',
          'PAYMENT_ORDER',
          'STAFF_VIEW'
        ],
        isRoot: false
      },
      {
        name: 'Vai trò gốc',
        description: 'Vai trò gốc với tất cả quyền hạn, không thể điều chỉnh',
        permissions: [
          'CREATE_AREA',
          'UPDATE_AREA',
          'DELETE_AREA',
          'VIEW_AREA',
          'CREATE_TABLE',
          'UPDATE_TABLE',
          'DELETE_TABLE',
          'VIEW_TABLE',
          'SEPARATE_TABLE',
          'ADD_DISH_TO_TABLE',
          'CREATE_ROLE',
          'UPDATE_ROLE',
          'DELETE_ROLE',
          'VIEW_ROLE',
          'CREATE_CUSTOMER',
          'UPDATE_CUSTOMER',
          'DELETE_CUSTOMER',
          'VIEW_CUSTOMER',
          'CREATE_CUSTOMER_TYPE',
          'UPDATE_CUSTOMER_TYPE',
          'DELETE_CUSTOMER_TYPE',
          'VIEW_CUSTOMER_TYPE',
          'CREATE_PRODUCT_TYPE',
          'UPDATE_PRODUCT_TYPE',
          'DELETE_PRODUCT_TYPE',
          'VIEW_PRODUCT_TYPE',
          'CREATE_PRODUCT',
          'UPDATE_PRODUCT',
          'DELETE_PRODUCT',
          'VIEW_PRODUCT',
          'CREATE_MEASUREMENT_UNIT',
          'UPDATE_MEASUREMENT_UNIT',
          'DELETE_MEASUREMENT_UNIT',
          'VIEW_MEASUREMENT_UNIT',
          'CREATE_PRODUCT_OPTION_GROUP',
          'UPDATE_PRODUCT_OPTION_GROUP',
          'DELETE_PRODUCT_OPTION_GROUP',
          'UPDATE_PAYMENT_METHOD',
          'VIEW_PAYMENT_METHOD',
          'CREATE_DISCOUNT_ISSUE',
          'UPDATE_DISCOUNT_ISSUE',
          'DELETE_DISCOUNT_ISSUE',
          'VIEW_DISCOUNT_ISSUE',
          'CREATE_DISCOUNT_CODE',
          'DELETE_DISCOUNT_CODE',
          'VIEW_DISCOUNT_CODE',
          'CREATE_VOUCHER',
          'DELETE_VOUCHER',
          'UPDATE_VOUCHER',
          'CREATE_EMPLOYEE_GROUP',
          'UPDATE_EMPLOYEE_GROUP',
          'DELETE_EMPLOYEE_GROUP',
          'VIEW_EMPLOYEE_GROUP',
          'CREATE_USER',
          'UPDATE_USER',
          'DELETE_USER',
          'VIEW_USER',
          'UPDATE_MY_INFORMATION',
          'DELETE_CUSTOMER_REQUEST',
          'UPDATE_CUSTOMER_REQUEST',
          'CREATE_ORDER',
          'UPDATE_ORDER',
          'DELETE_ORDER',
          'VIEW_ORDER',
          'PAYMENT_ORDER',
          'SAVE_ORDER',
          'CANCEL_ORDER',
          'CASHIER_VIEW',
          'STAFF_VIEW',
          'CHEF_VIEW',
          'MANAGE_VIEW',
          'UPDATE_BRANCH'
        ],
        isRoot: true
      }
    ]

    const rolePromises = roles.map(role =>
      prisma.role.create({
        data: {
          name: role.name,
          description: role.description,
          isRoot: role.isRoot,
          shopId,
          permissions: {
            connect: role.permissions.map(code => ({ code }))
          }
        }
      })
    )

    console.log('✅ Created roles!')
    return Promise.all(rolePromises)
  }
}
