import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      {
        id: 1,
        name: 'Vinh Xo',
        phone: '0909888777',
        type: 1,
        email: faker.internet.email(),
        isPublic: true,
        createdBy: 1,
        updatedBy: 1,
      },
    ],
  });

  await prisma.account.createMany({
    data: [
      {
        status: 1,
        username: 'admin',
        password:
          '$2b$10$/hD1wjOI81327vFmMsKTeed6ahdktoON1PfDjUO0tFsm4UNhssgfC',
        userId: 1,
        isPublic: true,
        createdBy: 1,
        updatedBy: 1,
      },
    ],
  });

  await prisma.businessType.createMany({
    data: [
      {
        name: 'Quán cà phê',
        icon: null,
        code: 'COF',
        description: 'Quán cà phê phục vụ đồ uống và đồ ăn nhẹ.',
        isPublic: true,
      },
      {
        name: 'Kinh doanh quần áo',
        icon: null,
        code: 'CLS',
        description: 'Kinh doanh quần áo thời trang.',
        isPublic: true,
      },
      {
        name: 'Nhà hàng',
        icon: null,
        code: 'RST',
        description: 'Nhà hàng cung cấp dịch vụ ăn uống.',
        isPublic: true,
      },
      {
        name: 'Cửa hàng tiện lợi',
        icon: null,
        code: 'CVS',
        description: 'Cửa hàng bán các loại thực phẩm và hàng hóa thông dụng.',
        isPublic: true,
      },
      {
        name: 'Dịch vụ du lịch',
        icon: null,
        code: 'TRV',
        description:
          'Dịch vụ cung cấp các tour du lịch, khách sạn, và các dịch vụ khác liên quan đến du lịch.',
        isPublic: true,
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
