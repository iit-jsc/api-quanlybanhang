import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  await prisma.businessType.createMany({
    data: [
      {
        name: 'Quán cà phê',
        icon: null,
        code: 'COF',
        description: 'Quán cà phê phục vụ đồ uống và đồ ăn nhẹ.',
        isPublic: true,
        type: 1,
      },
      {
        name: 'Kinh doanh quần áo',
        icon: null,
        code: 'CLS',
        description: 'Kinh doanh quần áo thời trang.',
        isPublic: true,
        type: 1,
      },
      {
        name: 'Nhà hàng',
        icon: null,
        code: 'RST',
        description: 'Nhà hàng cung cấp dịch vụ ăn uống.',
        isPublic: true,
        type: 2,
      },
      {
        name: 'Cửa hàng tiện lợi',
        icon: null,
        code: 'CVS',
        description: 'Cửa hàng bán các loại thực phẩm và hàng hóa thông dụng.',
        isPublic: true,
        type: 2,
      },
      {
        name: 'Dịch vụ du lịch',
        icon: null,
        code: 'TRV',
        description:
          'Dịch vụ cung cấp các tour du lịch, khách sạn, và các dịch vụ khác liên quan đến du lịch.',
        isPublic: true,
        type: 1,
      },
    ],
  });

  await prisma.groupRole.createMany({
    data: [
      {
        name: 'Quản lý khu vực',
        code: 'AREA',
        type: 2,
      },
      {
        name: 'Quản lý bàn',
        type: 2,
        code: 'TABLE',
      },
      {
        name: 'Quản lý topping',
        type: 2,
        code: 'TOPPING',
      },
      {
        name: 'Quản lý chi nhánh',
        type: 1,
        code: 'BRANCH',
      },
      {
        name: 'Quản lý khách hàng',
        type: 1,
        code: 'CUSTOMER',
      },
      {
        name: 'Quản lý nhóm khách hàng',
        type: 1,
        code: 'CUSTOMER_TYPE',
      },
      {
        name: 'Quản lý nhóm nhân viên',
        type: 1,
        code: 'EMPLOYEE_GROUP',
      },
      {
        name: 'Quản lý đơn vị tính',
        type: 1,
        code: 'MEASUREMENT_UNIT',
      },
      {
        name: 'Quản lý đơn hàng',
        type: 1,
        code: 'ORDER',
      },
      {
        name: 'Quản lý đánh giá đơn hàng',
        type: 1,
        code: 'ORDER_RATING',
      },
      {
        name: 'Quản lý trạng thái đơn hàng',
        type: 1,
        code: 'ORDER_STATUS',
      },
      {
        name: 'Quản lý phân quyền',
        type: 1,
        code: 'PERMISSION',
      },
      {
        name: 'Quản lý sản phẩm',
        type: 1,
        code: 'PRODUCT',
      },
      {
        name: 'Quản lý loại sản phẩm',
        type: 1,
        code: 'PRODUCT_TYPE',
      },
      {
        name: 'Quản lý báo cáo',
        type: 1,
        code: 'REPORT',
      },

      {
        name: 'Quản lý người dùng',
        type: 1,
        code: 'USER',
      },
      {
        name: 'Quản lý tài khoản',
        type: 1,
        code: 'ACCOUNT',
      },
    ],
  });

  await prisma.role.createMany({
    data: [
      {
        name: 'Tạo khu vực',
        code: 'CREATE_AREA',
        groupCode: 'AREA',
      },
      {
        name: 'Cập nhật khu vực',
        code: 'UPDATE_AREA',
        groupCode: 'AREA',
      },
      {
        name: 'Xóa khu vực',
        code: 'DELETE_AREA',
        groupCode: 'AREA',
      },
      {
        name: 'Xem danh sách khu vực',
        code: 'VIEW_AREA',
        groupCode: 'AREA',
      },
      {
        name: 'Tạo chi nhánh',
        code: 'CREATE_BRANCH',
        groupCode: 'BRANCH',
      },
      {
        name: 'Cập nhật chi nhánh',
        code: 'UPDATE_BRANCH',
        groupCode: 'BRANCH',
      },
      {
        name: 'Xóa chi nhánh',
        code: 'DELETE_BRANCH',
        groupCode: 'BRANCH',
      },
      {
        name: 'Xem danh sách chi nhánh',
        code: 'VIEW_BRANCH',
        groupCode: 'BRANCH',
      },
      {
        name: 'Tạo khách hàng',
        code: 'CREATE_CUSTOMER',
        groupCode: 'CUSTOMER',
      },
      {
        name: 'Cập nhật khách hàng',
        code: 'UPDATE_CUSTOMER',
        groupCode: 'CUSTOMER',
      },
      {
        name: 'Xóa khách hàng',
        code: 'DELETE_CUSTOMER',
        groupCode: 'CUSTOMER',
      },
      {
        name: 'Xem danh sách khách hàng',
        code: 'VIEW_CUSTOMER',
        groupCode: 'CUSTOMER',
      },
      {
        name: 'Tạo nhóm khách hàng',
        code: 'CREATE_CUSTOMER_TYPE',
        groupCode: 'CUSTOMER_TYPE',
      },
      {
        name: 'Cập nhật nhóm khách hàng',
        code: 'UPDATE_CUSTOMER_TYPE',
        groupCode: 'CUSTOMER_TYPE',
      },
      {
        name: 'Xóa nhóm khách hàng',
        code: 'DELETE_CUSTOMER_TYPE',
        groupCode: 'CUSTOMER_TYPE',
      },
      {
        name: 'Xem danh sách nhóm khách hàng',
        code: 'VIEW_CUSTOMER_TYPE',
        groupCode: 'CUSTOMER_TYPE',
      },
      {
        name: 'Tạo nhóm nhân viên',
        code: 'CREATE_EMPLOYEE_GROUP',
        groupCode: 'EMPLOYEE_GROUP',
      },
      {
        name: 'Cập nhật nhóm nhân viên',
        code: 'UPDATE_EMPLOYEE_GROUP',
        groupCode: 'EMPLOYEE_GROUP',
      },
      {
        name: 'Xóa nhóm nhân viên',
        code: 'DELETE_EMPLOYEE_GROUP',
        groupCode: 'EMPLOYEE_GROUP',
      },
      {
        name: 'Xem danh sách nhóm nhân viên',
        code: 'VIEW_EMPLOYEE_GROUP',
        groupCode: 'EMPLOYEE_GROUP',
      },
      {
        name: 'Tạo đơn vị tính',
        code: 'CREATE_MEASUREMENT_UNIT',
        groupCode: 'MEASUREMENT_UNIT',
      },
      {
        name: 'Cập nhật đơn vị tính',
        code: 'UPDATE_MEASUREMENT_UNIT',
        groupCode: 'MEASUREMENT_UNIT',
      },
      {
        name: 'Xóa đơn vị tính',
        code: 'DELETE_MEASUREMENT_UNIT',
        groupCode: 'MEASUREMENT_UNIT',
      },
      {
        name: 'Xem danh sách đơn vị tính',
        code: 'VIEW_MEASUREMENT_UNIT',
        groupCode: 'MEASUREMENT_UNIT',
      },
      {
        name: 'Tạo đơn hàng',
        code: 'CREATE_ORDER',
        groupCode: 'ORDER',
      },
      {
        name: 'Cập nhật đơn hàng',
        code: 'UPDATE_ORDER',
        groupCode: 'ORDER',
      },
      {
        name: 'Xóa đơn hàng',
        code: 'DELETE_ORDER',
        groupCode: 'ORDER',
      },
      {
        name: 'Xem danh sách đơn hàng',
        code: 'VIEW_ORDER',
        groupCode: 'ORDER',
      },
      {
        name: 'Tạo trạng thái đơn hàng',
        code: 'CREATE_ORDER_STATUS',
        groupCode: 'ORDER_STATUS',
      },
      {
        name: 'Cập nhật trạng thái đơn hàng',
        code: 'UPDATE_ORDER_STATUS',
        groupCode: 'ORDER_STATUS',
      },
      {
        name: 'Xóa trạng thái đơn hàng',
        code: 'DELETE_ORDER_STATUS',
        groupCode: 'ORDER_STATUS',
      },
      {
        name: 'Xem danh sách trạng thái đơn hàng',
        code: 'VIEW_ORDER_STATUS',
        groupCode: 'ORDER_STATUS',
      },
      {
        name: 'Tạo nhóm quyền',
        code: 'CREATE_PERMISSION',
        groupCode: 'PERMISSION',
      },
      {
        name: 'Cập nhật nhóm quyền',
        code: 'UPDATE_PERMISSION',
        groupCode: 'PERMISSION',
      },
      {
        name: 'Xóa nhóm quyền',
        code: 'DELETE_PERMISSION',
        groupCode: 'PERMISSION',
      },
      {
        name: 'Xem danh sách nhóm quyền',
        code: 'VIEW_PERMISSION',
        groupCode: 'PERMISSION',
      },
      {
        name: 'Tạo sản phẩm',
        code: 'CREATE_PRODUCT',
        groupCode: 'PRODUCT',
      },
      {
        name: 'Cập nhật sản phẩm',
        code: 'UPDATE_PRODUCT',
        groupCode: 'PRODUCT',
      },
      {
        name: 'Xóa sản phẩm',
        code: 'DELETE_PRODUCT',
        groupCode: 'PRODUCT',
      },
      {
        name: 'Xem danh sách sản phẩm',
        code: 'VIEW_PRODUCT',
        groupCode: 'PRODUCT',
      },
      {
        name: 'Tạo loại sản phẩm',
        code: 'CREATE_PRODUCT_TYPE',
        groupCode: 'PRODUCT_TYPE',
      },
      {
        name: 'Cập nhật loại sản phẩm',
        code: 'UPDATE_PRODUCT_TYPE',
        groupCode: 'PRODUCT_TYPE',
      },
      {
        name: 'Xóa loại sản phẩm',
        code: 'DELETE_PRODUCT_TYPE',
        groupCode: 'PRODUCT_TYPE',
      },
      {
        name: 'Xem danh sách loại sản phẩm',
        code: 'VIEW_PRODUCT_TYPE',
        groupCode: 'PRODUCT_TYPE',
      },
      {
        name: 'Tạo bàn',
        code: 'CREATE_TABLE',
        groupCode: 'TABLE',
      },
      {
        name: 'Cập nhật bàn',
        code: 'UPDATE_TABLE',
        groupCode: 'TABLE',
      },
      {
        name: 'Xóa bàn',
        code: 'DELETE_TABLE',
        groupCode: 'TABLE',
      },
      {
        name: 'Xem danh sách bàn',
        code: 'VIEW_TABLE',
        groupCode: 'TABLE',
      },
      {
        name: 'Tạo topping',
        code: 'CREATE_TOPPING',
        groupCode: 'TOPPING',
      },
      {
        name: 'Cập nhật topping',
        code: 'UPDATE_TOPPING',
        groupCode: 'TOPPING',
      },
      {
        name: 'Xóa topping',
        code: 'DELETE_TOPPING',
        groupCode: 'TOPPING',
      },
      {
        name: 'Xem danh sách topping',
        code: 'VIEW_TOPPING',
        groupCode: 'TOPPING',
      },
      {
        name: 'Tạo người dùng',
        code: 'CREATE_USER',
        groupCode: 'USER',
      },
      {
        name: 'Cập nhật người dùng',
        code: 'UPDATE_USER',
        groupCode: 'USER',
      },
      {
        name: 'Xóa người dùng',
        code: 'DELETE_USER',
        groupCode: 'USER',
      },
      {
        name: 'Xem danh sách người dùng',
        code: 'VIEW_USER',
        groupCode: 'USER',
      },
      {
        name: 'Tạo tài khoản',
        code: 'CREATE_ACCOUNT',
        groupCode: 'ACCOUNT',
      },
      {
        name: 'Cập nhật tài khoản',
        code: 'UPDATE_ACCOUNT',
        groupCode: 'ACCOUNT',
      },
      {
        name: 'Xóa tài khoản',
        code: 'DELETE_ACCOUNT',
        groupCode: 'ACCOUNT',
      },
      {
        name: 'Xem danh sách tài khoản',
        code: 'VIEW_ACCOUNT',
        groupCode: 'ACCOUNT',
      },
    ],
  });
}

main()
  .then(() => {
    console.log('Seeding completed!');
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
