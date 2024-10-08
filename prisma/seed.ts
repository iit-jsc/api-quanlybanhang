import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.businessType.createMany({
    data: [
      {
        name: "Quán cà phê",
        icon: null,
        code: "ca-phe",
        description: "Quán cà phê",
        isPublic: true,
        type: 2,
      },
      {
        name: "Cửa hàng quần áo",
        icon: null,
        code: "quan-ao",
        description: "Kinh doanh quần áo thời trang.",
        isPublic: true,
        type: 1,
      },
      {
        name: "Cửa hàng điện thoại",
        icon: null,
        code: "dien-thoai",
        description: "Kinh doanh điện thoại đồ điện tử.",
        isPublic: true,
        type: 1,
      },
    ],
  });

  await prisma.groupRole.createMany({
    data: [
      {
        name: "Quản lý khu vực",
        code: "AREA",
        type: 2,
      },
      {
        name: "Quản lý bàn",
        type: 2,
        code: "TABLE",
      },
      {
        name: "Quản lý các tùy chọn sản phẩm",
        type: 2,
        code: "PRODUCT_OPTION_GROUP",
      },
      {
        name: "Quản lý khách hàng",
        type: 1,
        code: "CUSTOMER",
      },
      {
        name: "Quản lý nhóm khách hàng",
        type: 1,
        code: "CUSTOMER_TYPE",
      },
      {
        name: "Quản lý nhóm nhân viên",
        type: 1,
        code: "EMPLOYEE_GROUP",
      },
      {
        name: "Quản lý đơn vị tính",
        type: 1,
        code: "MEASUREMENT_UNIT",
      },
      {
        name: "Quản lý đơn hàng",
        type: 1,
        code: "ORDER",
      },
      {
        name: "Quản lý phân quyền",
        type: 1,
        code: "PERMISSION",
      },
      {
        name: "Quản lý sản phẩm",
        type: 1,
        code: "PRODUCT",
      },
      {
        name: "Quản lý loại sản phẩm",
        type: 1,
        code: "PRODUCT_TYPE",
      },
      {
        name: "Quản lý báo cáo",
        type: 1,
        code: "REPORT",
      },
      {
        name: "Quản lý nhân viên",
        type: 1,
        code: "EMPLOYEE",
      },
      {
        name: "Quản lý tài khoản",
        type: 1,
        code: "ACCOUNT",
      },
      {
        name: "Quản lý loại nhà cung cấp",
        type: 1,
        code: "SUPPLIER_TYPE",
      },
      {
        name: "Quản lý loại  cung cấp",
        type: 1,
        code: "SUPPLIER",
      },
      {
        name: "Quản lý khuyến mãi",
        type: 1,
        code: "PROMOTION",
      },
      {
        name: "Quản lý mã giảm giá",
        type: 1,
        code: "DISCOUNT_ISSUE",
      },
      {
        name: "Quản lý kho",
        type: 1,
        code: "WAREHOUSE",
      },
      {
        name: "Quản lý ca làm việc",
        type: 1,
        code: "WORK_SHIFT",
      },
      {
        name: "Quản lý lịch làm việc",
        type: 1,
        code: "EMPLOYEE_SCHEDULE",
      },
      {
        name: "Quản lý lương",
        type: 1,
        code: "SALARY",
      },
    ],
  });

  await prisma.role.createMany({
    data: [
      {
        name: "Tạo khu vực",
        code: "CREATE_AREA",
        groupCode: "AREA",
      },
      {
        name: "Cập nhật khu vực",
        code: "UPDATE_AREA",
        groupCode: "AREA",
      },
      {
        name: "Xóa khu vực",
        code: "DELETE_AREA",
        groupCode: "AREA",
      },
      {
        name: "Xem danh sách khu vực",
        code: "VIEW_AREA",
        groupCode: "AREA",
      },
      {
        name: "Tạo khách hàng",
        code: "CREATE_CUSTOMER",
        groupCode: "CUSTOMER",
      },
      {
        name: "Cập nhật khách hàng",
        code: "UPDATE_CUSTOMER",
        groupCode: "CUSTOMER",
      },
      {
        name: "Xóa khách hàng",
        code: "DELETE_CUSTOMER",
        groupCode: "CUSTOMER",
      },
      {
        name: "Xem danh sách khách hàng",
        code: "VIEW_CUSTOMER",
        groupCode: "CUSTOMER",
      },
      {
        name: "Tạo nhóm khách hàng",
        code: "CREATE_CUSTOMER_TYPE",
        groupCode: "CUSTOMER_TYPE",
      },
      {
        name: "Cập nhật nhóm khách hàng",
        code: "UPDATE_CUSTOMER_TYPE",
        groupCode: "CUSTOMER_TYPE",
      },
      {
        name: "Xóa nhóm khách hàng",
        code: "DELETE_CUSTOMER_TYPE",
        groupCode: "CUSTOMER_TYPE",
      },
      {
        name: "Xem danh sách nhóm khách hàng",
        code: "VIEW_CUSTOMER_TYPE",
        groupCode: "CUSTOMER_TYPE",
      },
      {
        name: "Tạo nhóm nhân viên",
        code: "CREATE_EMPLOYEE_GROUP",
        groupCode: "EMPLOYEE_GROUP",
      },
      {
        name: "Cập nhật nhóm nhân viên",
        code: "UPDATE_EMPLOYEE_GROUP",
        groupCode: "EMPLOYEE_GROUP",
      },
      {
        name: "Xóa nhóm nhân viên",
        code: "DELETE_EMPLOYEE_GROUP",
        groupCode: "EMPLOYEE_GROUP",
      },
      {
        name: "Xem danh sách nhóm nhân viên",
        code: "VIEW_EMPLOYEE_GROUP",
        groupCode: "EMPLOYEE_GROUP",
      },
      {
        name: "Tạo đơn vị tính",
        code: "CREATE_MEASUREMENT_UNIT",
        groupCode: "MEASUREMENT_UNIT",
      },
      {
        name: "Cập nhật đơn vị tính",
        code: "UPDATE_MEASUREMENT_UNIT",
        groupCode: "MEASUREMENT_UNIT",
      },
      {
        name: "Xóa đơn vị tính",
        code: "DELETE_MEASUREMENT_UNIT",
        groupCode: "MEASUREMENT_UNIT",
      },
      {
        name: "Tạo đơn hàng",
        code: "CREATE_ORDER",
        groupCode: "ORDER",
      },
      {
        name: "Cập nhật đơn hàng",
        code: "UPDATE_ORDER",
        groupCode: "ORDER",
      },
      {
        name: "Xóa đơn hàng",
        code: "DELETE_ORDER",
        groupCode: "ORDER",
      },
      {
        name: "Xem danh sách đơn hàng",
        code: "VIEW_ORDER",
        groupCode: "ORDER",
      },
      {
        name: "Tạo nhóm quyền",
        code: "CREATE_PERMISSION",
        groupCode: "PERMISSION",
      },
      {
        name: "Cập nhật nhóm quyền",
        code: "UPDATE_PERMISSION",
        groupCode: "PERMISSION",
      },
      {
        name: "Xóa nhóm quyền",
        code: "DELETE_PERMISSION",
        groupCode: "PERMISSION",
      },
      {
        name: "Xem danh sách nhóm quyền",
        code: "VIEW_PERMISSION",
        groupCode: "PERMISSION",
      },
      {
        name: "Tạo sản phẩm",
        code: "CREATE_PRODUCT",
        groupCode: "PRODUCT",
      },
      {
        name: "Cập nhật sản phẩm",
        code: "UPDATE_PRODUCT",
        groupCode: "PRODUCT",
      },
      {
        name: "Xóa sản phẩm",
        code: "DELETE_PRODUCT",
        groupCode: "PRODUCT",
      },
      {
        name: "Xem danh sách sản phẩm",
        code: "VIEW_PRODUCT",
        groupCode: "PRODUCT",
      },
      {
        name: "Tạo loại sản phẩm",
        code: "CREATE_PRODUCT_TYPE",
        groupCode: "PRODUCT_TYPE",
      },
      {
        name: "Cập nhật loại sản phẩm",
        code: "UPDATE_PRODUCT_TYPE",
        groupCode: "PRODUCT_TYPE",
      },
      {
        name: "Xóa loại sản phẩm",
        code: "DELETE_PRODUCT_TYPE",
        groupCode: "PRODUCT_TYPE",
      },
      {
        name: "Tạo bàn",
        code: "CREATE_TABLE",
        groupCode: "TABLE",
      },
      {
        name: "Cập nhật bàn",
        code: "UPDATE_TABLE",
        groupCode: "TABLE",
      },
      {
        name: "Xóa bàn",
        code: "DELETE_TABLE",
        groupCode: "TABLE",
      },
      {
        name: "Xem danh sách bàn",
        code: "VIEW_TABLE",
        groupCode: "TABLE",
      },
      {
        name: "Tạo các tùy chọn sản phẩm",
        code: "CREATE_PRODUCT_OPTION_GROUP",
        groupCode: "PRODUCT_OPTION_GROUP",
      },
      {
        name: "Cập nhật các tùy chọn sản phẩm",
        code: "UPDATE_PRODUCT_OPTION_GROUP",
        groupCode: "PRODUCT_OPTION_GROUP",
      },
      {
        name: "Xóa các tùy chọn sản phẩm",
        code: "DELETE_PRODUCT_OPTION_GROUP",
        groupCode: "PRODUCT_OPTION_GROUP",
      },
      {
        name: "Xem danh sách các tùy chọn sản phẩm",
        code: "VIEW_PRODUCT_OPTION_GROUP",
        groupCode: "PRODUCT_OPTION_GROUP",
      },
      {
        name: "Tạo nhân viên",
        code: "CREATE_EMPLOYEE",
        groupCode: "EMPLOYEE",
      },
      {
        name: "Cập nhật nhân viên",
        code: "UPDATE_EMPLOYEE",
        groupCode: "EMPLOYEE",
      },
      {
        name: "Xóa nhân viên",
        code: "DELETE_EMPLOYEE",
        groupCode: "EMPLOYEE",
      },
      {
        name: "Xem danh sách nhân viên",
        code: "VIEW_EMPLOYEE",
        groupCode: "EMPLOYEE",
      },
      {
        name: "Tạo tài khoản",
        code: "CREATE_ACCOUNT",
        groupCode: "ACCOUNT",
      },
      {
        name: "Cập nhật tài khoản",
        code: "UPDATE_ACCOUNT",
        groupCode: "ACCOUNT",
      },
      {
        name: "Xóa tài khoản",
        code: "DELETE_ACCOUNT",
        groupCode: "ACCOUNT",
      },
      {
        name: "Xem danh sách loại nhà cung cấp",
        code: "VIEW_SUPPLIER_TYPE",
        groupCode: "SUPPLIER_TYPE",
      },
      {
        name: "Tạo loại nhà cung cấp",
        code: "CREATE_SUPPLIER_TYPE",
        groupCode: "SUPPLIER_TYPE",
      },
      {
        name: "Cập nhật loại nhà cung cấp",
        code: "UPDATE_SUPPLIER_TYPE",
        groupCode: "SUPPLIER_TYPE",
      },
      {
        name: "Xóa loại nhà cung cấp",
        code: "DELETE_SUPPLIER_TYPE",
        groupCode: "SUPPLIER_TYPE",
      },
      {
        name: "Xem danh sách nhà cung cấp",
        code: "VIEW_SUPPLIER",
        groupCode: "SUPPLIER",
      },
      {
        name: "Tạo nhà cung cấp",
        code: "CREATE_SUPPLIER",
        groupCode: "SUPPLIER",
      },
      {
        name: "Cập nhật nhà cung cấp",
        code: "UPDATE_SUPPLIER",
        groupCode: "SUPPLIER",
      },
      {
        name: "Xóa nhà cung cấp",
        code: "DELETE_SUPPLIER",
        groupCode: "SUPPLIER",
      },
      {
        name: "Xem danh sách khuyến mãi",
        code: "VIEW_PROMOTION",
        groupCode: "PROMOTION",
      },
      {
        name: "Tạo khuyến mãi",
        code: "CREATE_PROMOTION",
        groupCode: "PROMOTION",
      },
      {
        name: "Cập nhật khuyến mãi",
        code: "UPDATE_PROMOTION",
        groupCode: "PROMOTION",
      },
      {
        name: "Xóa khuyến mãi",
        code: "DELETE_PROMOTION",
        groupCode: "PROMOTION",
      },
      {
        name: "Xem danh sách mã giảm giá",
        code: "VIEW_DISCOUNT_ISSUE",
        groupCode: "DISCOUNT_ISSUE",
      },
      {
        name: "Tạo mã giảm giá",
        code: "CREATE_DISCOUNT_ISSUE",
        groupCode: "DISCOUNT_ISSUE",
      },
      {
        name: "Cập nhật mã giảm giá",
        code: "UPDATE_DISCOUNT_ISSUE",
        groupCode: "DISCOUNT_ISSUE",
      },
      {
        name: "Xóa mã giảm giá",
        code: "DELETE_DISCOUNT_ISSUE",
        groupCode: "DISCOUNT_ISSUE",
      },
      {
        name: "Xem danh sách kho",
        code: "VIEW_WAREHOUSE",
        groupCode: "WAREHOUSE",
      },
      {
        name: "Cập nhật kho",
        code: "UPDATE_WAREHOUSE",
        groupCode: "WAREHOUSE",
      },
      {
        name: "Xem danh sách ca làm việc",
        code: "VIEW_WORK_SHIFT",
        groupCode: "WORK_SHIFT",
      },
      {
        name: "Tạo ca làm việc",
        code: "CREATE_WORK_SHIFT",
        groupCode: "WORK_SHIFT",
      },
      {
        name: "Cập nhật ca làm việc",
        code: "UPDATE_WORK_SHIFT",
        groupCode: "WORK_SHIFT",
      },
      {
        name: "Xóa ca làm việc",
        code: "DELETE_WORK_SHIFT",
        groupCode: "WORK_SHIFT",
      },
      {
        name: "Xem danh sách lịch làm việc",
        code: "VIEW_EMPLOYEE_SCHEDULE",
        groupCode: "EMPLOYEE_SCHEDULE",
      },
      {
        name: "Đăng ký lịch làm việc",
        code: "CREATE_EMPLOYEE_SCHEDULE",
        groupCode: "EMPLOYEE_SCHEDULE",
      },
      {
        name: "Cập nhật lịch đăng ký",
        code: "UPDATE_EMPLOYEE_SCHEDULE",
        groupCode: "EMPLOYEE_SCHEDULE",
      },
      {
        name: "Xóa lịch đăng ký",
        code: "DELETE_EMPLOYEE_SCHEDULE",
        groupCode: "EMPLOYEE_SCHEDULE",
      },
      {
        name: "Xem danh sách thông tin lương",
        code: "VIEW_SALARY",
        groupCode: "SALARY",
      },
      {
        name: "Tạo thông tin lương",
        code: "CREATE_SALARY",
        groupCode: "SALARY",
      },
      {
        name: "Cập nhật thông tin lương",
        code: "UPDATE_SALARY",
        groupCode: "SALARY",
      },
      {
        name: "Xóa thông tin lương",
        code: "DELETE_SALARY",
        groupCode: "SALARY",
      },
      {
        name: "Xác nhận bảng lương",
        code: "CONFIRM_SALARY",
        groupCode: "SALARY",
      },
    ],
  });
}

main()
  .then(() => {
    // console.log("Seeding completed!");
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
