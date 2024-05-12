import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateMeasurementUnitDTO } from './dto/create-measurement-unit.dto';
import { TokenPayload } from 'interfaces/common.interface';
import { generateUniqueId } from 'utils/Helps';
import { Prisma } from '@prisma/client';
import { FindMeasurementUnitDTO } from './dto/find-measurement-unit.dto';

@Injectable()
export class MeasurementUnitService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMeasurementUnitDTO, tokenPayload: TokenPayload) {
    const identifier = generateUniqueId();

    return await this.prisma.measurementUnit.create({
      data: {
        name: data.name,
        code: data.code,
        identifier: identifier,
        createdBy: tokenPayload.accountId,
        updatedBy: tokenPayload.accountId,
        branches: {
          connect: data.branchIds.map((id) => ({ id })),
        },
      },
    });
  }

  async findAll(params: FindMeasurementUnitDTO, tokenPayload: TokenPayload) {
    const { skip, take, orderBy } = params;

    return this.prisma.measurementUnit.findMany({
      skip,
      take,
      orderBy,
      where: {
        isPublic: true,
      },
      select: {
        id: true,
        identifier: true,
        name: true,
        code: true,
      },
    });
  }
}
