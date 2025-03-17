import { PrismaService } from 'nestjs-prisma'
export class CompensationEmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  // async update(
  //   params: {
  //     where: Prisma.CompensationEmployeeWhereUniqueInput
  //     data: UpdateCompensationEmployeeDto
  //   },
  //   tokenPayload: TokenPayload
  // ) {
  //   const { where, data } = params

  //   return await this.prisma.compensationEmployee.update({
  //     where: { id: where.id, branchId: tokenPayload.branchId },
  //     data: { value: data.value, updatedBy: tokenPayload.accountId }
  //   })
  // }

  // async findAll(
  //   params: FindManyCompensationEmployeeDto,
  //   tokenPayload: TokenPayload
  // ) {
  //   let { page, perPage, employeeIds, orderBy } = params
  //   let where: Prisma.CompensationEmployeeWhereInput = {
  //     ...(employeeIds && { employeeId: { in: employeeIds } }),
  //     branchId: tokenPayload.branchId
  //   }

  //   return await customPaginate(
  //     this.prisma.compensationEmployee,
  //     {
  //       orderBy: orderBy || { createdAt: 'desc' },
  //       where
  //     },
  //     {
  //       page,
  //       perPage
  //     }
  //   )
  // }
}
