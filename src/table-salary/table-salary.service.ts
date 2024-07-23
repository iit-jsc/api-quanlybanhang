import { Injectable } from "@nestjs/common";
import { TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { CreateTableSalaryDto, UpdateTableSalaryDto } from "./dto/table-salary.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class TableSalaryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTableSalaryDto, tokenPayload: TokenPayload) {}

  update(
    params: {
      where: Prisma.TableSalaryWhereUniqueInput;
      data: UpdateTableSalaryDto;
    },
    tokenPayload: TokenPayload,
  ) {}
}
