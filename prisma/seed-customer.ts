import { PrismaClient, DiscountType, SexType } from '@prisma/client'

const prisma = new PrismaClient()

// Dữ liệu mẫu cho CustomerType
const customerTypesData = [
  {
    name: 'Khách VIP',
    description: 'Khách hàng thân thiết, mua hàng thường xuyên',
    discount: 15,
    discountType: DiscountType.PERCENT
  },
  {
    name: 'Khách hàng thường',
    description: 'Khách hàng mới, mua hàng lần đầu',
    discount: 0,
    discountType: DiscountType.PERCENT
  },
  {
    name: 'Khách hàng doanh nghiệp',
    description: 'Khách hàng là doanh nghiệp, công ty',
    discount: 20,
    discountType: DiscountType.PERCENT
  },
  {
    name: 'Khách hàng bạc',
    description: 'Khách hàng chi tiêu từ 5-10 triệu/tháng',
    discount: 5,
    discountType: DiscountType.PERCENT
  },
  {
    name: 'Khách hàng vàng',
    description: 'Khách hàng chi tiêu từ 10-20 triệu/tháng',
    discount: 10,
    discountType: DiscountType.PERCENT
  }
]

// Dữ liệu random cho Customer
const firstNames = [
  'Nguyễn',
  'Trần',
  'Lê',
  'Phạm',
  'Hoàng',
  'Huỳnh',
  'Phan',
  'Vũ',
  'Võ',
  'Đặng',
  'Bùi',
  'Đỗ',
  'Hồ',
  'Ngô',
  'Dương',
  'Lý',
  'Đinh',
  'Đào',
  'Mai',
  'Lưu'
]

const lastNames = [
  'Văn Anh',
  'Thị Bích',
  'Văn Cường',
  'Thị Dung',
  'Văn Đức',
  'Thị Hoa',
  'Văn Hùng',
  'Thị Lan',
  'Văn Long',
  'Thị Mai',
  'Văn Nam',
  'Thị Nga',
  'Văn Phú',
  'Thị Quỳnh',
  'Văn Sơn',
  'Thị Tâm',
  'Văn Tuấn',
  'Thị Uyên',
  'Văn Việt',
  'Thị Yến'
]

const addresses = [
  '123 Nguyễn Văn Cừ, Q.5, TP.HCM',
  '456 Lê Lợi, Q.1, TP.HCM',
  '789 Trần Hưng Đạo, Q.10, TP.HCM',
  '321 Võ Thị Sáu, Q.3, TP.HCM',
  '654 Pasteur, Q.1, TP.HCM',
  '987 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM',
  '147 Nguyễn Đình Chiểu, Q.3, TP.HCM',
  '258 Lý Tự Trọng, Q.1, TP.HCM',
  '369 Hai Bà Trưng, Q.1, TP.HCM',
  '741 Nguyễn Thị Minh Khai, Q.3, TP.HCM'
]

const companies = [
  'Công ty TNHH ABC',
  'Công ty Cổ phần XYZ',
  'Doanh nghiệp tư nhân DEF',
  'Công ty TNHH MTV GHI',
  'Tập đoàn JKL',
  'Công ty Cổ phần MNO',
  'Công ty TNHH PQR',
  'Doanh nghiệp STU',
  'Công ty VWX',
  'Tổng công ty YZ'
]

// Function tạo số điện thoại random
function generatePhoneNumber(): string {
  const prefixes = ['090', '091', '094', '083', '084', '085', '081', '082']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffix = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, '0')
  return prefix + suffix
}

// Function tạo email random
function generateEmail(name: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
  const domain = domains[Math.floor(Math.random() * domains.length)]
  const cleanName = name
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/[đ]/g, 'd')
  return `${cleanName}${Math.floor(Math.random() * 1000)}@${domain}`
}

// Function tạo mã thuế random
function generateTaxCode(): string {
  return Math.floor(Math.random() * 9000000000 + 1000000000).toString()
}

// Function tạo ngày sinh random
function generateBirthday(): Date {
  const start = new Date(1970, 0, 1)
  const end = new Date(2005, 0, 1)
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

async function main() {
  console.log('🌱 Starting customer seeding...')

  // Lấy tất cả các shop có sẵn
  const shops = await prisma.shop.findMany({
    select: { id: true, name: true }
  })

  if (shops.length === 0) {
    console.log('❌ No shops found. Please seed shops first.')
    return
  }

  console.log(`📊 Found ${shops.length} shops`)

  // Seed CustomerTypes cho mỗi shop
  console.log('🏷️ Creating customer types...')
  const createdCustomerTypes: { [shopId: string]: any[] } = {}

  for (const shop of shops) {
    console.log(`  Creating customer types for shop: ${shop.name}`)

    const customerTypes = []
    for (const customerTypeData of customerTypesData) {
      const customerType = await prisma.customerType.upsert({
        where: {
          shopId_name: {
            shopId: shop.id,
            name: customerTypeData.name
          }
        },
        update: customerTypeData,
        create: {
          ...customerTypeData,
          shopId: shop.id
        }
      })
      customerTypes.push(customerType)
    }
    createdCustomerTypes[shop.id] = customerTypes
    console.log(`  ✅ Created ${customerTypes.length} customer types for ${shop.name}`)
  }

  // Seed Customers cho mỗi shop
  console.log('👥 Creating customers...')
  let totalCustomers = 0

  for (const shop of shops) {
    console.log(`  Creating customers for shop: ${shop.name}`)
    const customerTypes = createdCustomerTypes[shop.id]

    // Tạo 15-25 customers cho mỗi shop
    const customerCount = Math.floor(Math.random() * 11) + 15

    for (let i = 0; i < customerCount; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const fullName = `${firstName} ${lastName}`

      const isOrganize = Math.random() < 0.3 // 30% là tổ chức
      const customerType = customerTypes[Math.floor(Math.random() * customerTypes.length)]
      const customerData = {
        code: `KH${shop.name.substring(0, 2).toUpperCase()}${(i + 1).toString().padStart(4, '0')}`,
        name: isOrganize ? companies[Math.floor(Math.random() * companies.length)] : fullName,
        phone: generatePhoneNumber(),
        organizeName: isOrganize ? companies[Math.floor(Math.random() * companies.length)] : null,
        isOrganize,
        shopId: shop.id,
        customerTypeId: customerType.id,
        email: generateEmail(
          isOrganize ? companies[Math.floor(Math.random() * companies.length)] : fullName
        ),
        address: addresses[Math.floor(Math.random() * addresses.length)],
        description: isOrganize
          ? 'Khách hàng doanh nghiệp'
          : `Khách hàng cá nhân - ${customerType.name}`,
        birthday: isOrganize ? null : generateBirthday(),
        sex: isOrganize
          ? null
          : (Object.values(SexType)[
              Math.floor(Math.random() * Object.values(SexType).length)
            ] as SexType),
        tax: isOrganize ? generateTaxCode() : null
      }

      try {
        await prisma.customer.create({
          data: customerData
        })
        totalCustomers++
      } catch (error) {
        // Bỏ qua lỗi duplicate và thử lại với phone khác
        if (error instanceof Error && error.message.includes('Unique constraint')) {
          customerData.phone = generatePhoneNumber()
          customerData.email = generateEmail(customerData.name)
          try {
            await prisma.customer.create({
              data: customerData
            })
            totalCustomers++
          } catch (secondError) {
            console.warn(`    ⚠️ Failed to create customer ${customerData.name}: ${secondError}`)
          }
        } else {
          console.warn(`    ⚠️ Failed to create customer ${customerData.name}: ${error}`)
        }
      }
    }

    console.log(`  ✅ Created customers for ${shop.name}`)
  }

  console.log(`🎉 Customer seeding completed!`)
  console.log(`📊 Summary:`)
  console.log(`   - Shops processed: ${shops.length}`)
  console.log(`   - Customer types created: ${Object.values(createdCustomerTypes).flat().length}`)
  console.log(`   - Customers created: ${totalCustomers}`)
}

main()
  .then(() => {
    // console.log("Seeding completed!");
  })
  .catch(e => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
