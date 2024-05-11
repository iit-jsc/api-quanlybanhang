import { CreateBranchDto } from 'src/branch/dto/create-branch.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class BranchService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBranchDto: CreateBranchDto) {}
}
