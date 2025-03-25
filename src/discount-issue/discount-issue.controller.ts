import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { DiscountIssueService } from './discount-issue.service'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { RolesGuard } from 'guards/roles.guard'
import { RequestJWT } from 'interfaces/common.interface'
import { DeleteManyDto } from 'utils/Common.dto'
import {
  CreateDiscountIssueDto,
  FindManyDiscountIssueDto,
  UpdateDiscountIssueDto
} from './dto/discount-issue.dto'
import { permissions } from 'enums/permissions.enum'
import { Roles } from 'guards/roles.decorator'
import { extractPermissions } from 'utils/Helps'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('discount-issue')
export class DiscountIssueController {
  constructor(private readonly discountIssueService: DiscountIssueService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.discountIssue.create)
  create(@Body() data: CreateDiscountIssueDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.discountIssueService.create(data, accountId, branchId)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.discountIssue))
  findAll(@Query() data: FindManyDiscountIssueDto, @Req() req: RequestJWT) {
    const { branchId } = req

    return this.discountIssueService.findAll(data, branchId)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(...extractPermissions(permissions.discountIssue))
  findUniq(@Param('id') id: string, @Req() req: RequestJWT) {
    const { branchId } = req

    return this.discountIssueService.findUniq(id, branchId)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.discountIssue.update)
  update(@Param('id') id: string, @Body() data: UpdateDiscountIssueDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.discountIssueService.update(id, data, accountId, branchId)
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @Roles(permissions.discountIssue.delete)
  deleteMany(@Body() data: DeleteManyDto, @Req() req: RequestJWT) {
    const { accountId, branchId } = req

    return this.discountIssueService.deleteMany(data, accountId, branchId)
  }
}
