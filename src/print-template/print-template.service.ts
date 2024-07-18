import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { TokenPayload } from "interfaces/common.interface";
import { PrismaService } from "nestjs-prisma";
import { UpdatePrintTemplateDto } from "./dto/print-template.dto";

@Injectable()
export class PrintTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async update(
    params: {
      data: UpdatePrintTemplateDto;
    },
    tokenPayload: TokenPayload,
  ) {
    const { data } = params;

    return await this.prisma.printTemplate.upsert({
      where: {
        shopId_type: {
          shopId: tokenPayload.shopId,
          type: data.type,
        },
      },
      create: {
        type: data.type,
        content: data.content,
        shopId: tokenPayload.shopId,
      },
      update: {
        content: data.content,
        updatedBy: tokenPayload.accountId,
      },
    });
  }

  async findUniq(where: Prisma.PrintTemplateWhereInput, tokenPayload: TokenPayload) {
    return this.prisma.printTemplate.findUniqueOrThrow({
      where: {
        shopId_type: {
          shopId: tokenPayload.shopId,
          type: +where.type,
        },
      },
    });
  }

  async findDefaultTemplate(where: Prisma.PrintTemplateWhereInput, tokenPayload: TokenPayload) {
    return await this.prisma.printTemplate.findFirst({
      where: {
        type: +where.type,
        isDefault: true,
      },
    });
  }
}
