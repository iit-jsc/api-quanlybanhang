import { FindManyDto } from './../../utils/Common.dto'
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
import { BranchService } from './branch.service'
import { CreateBranchDto, UpdateBranchDto } from './dto/create-branch.dto'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { TokenPayload } from 'interfaces/common.interface'
import { DeleteManyDto } from 'utils/Common.dto'
import { RolesGuard } from 'guards/roles.guard'
import { Roles } from 'guards/roles.decorator'
import { SPECIAL_ROLE } from 'enums/common.enum'

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CREATE_BRANCH', SPECIAL_ROLE.STORE_OWNER)
  create(@Body() createBranchDto: CreateBranchDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload

    return this.branchService.create(createBranchDto, tokenPayload)
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    'CREATE_BRANCH',
    'UPDATE_BRANCH',
    'DELETE_BRANCH',
    'VIEW_BRANCH',
    SPECIAL_ROLE.STORE_OWNER
  )
  findAll(@Query() data: FindManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload

    return this.branchService.findAll(data, tokenPayload)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findUniq(@Param('id') id: string) {
    return this.branchService.findUniq({
      id
    })
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('UPDATE_BRANCH', SPECIAL_ROLE.STORE_OWNER)
  update(
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
    @Req() req: any
  ) {
    const tokenPayload = req.tokenPayload as TokenPayload

    return this.branchService.update(
      {
        where: {
          id
        },
        data: updateBranchDto
      },
      tokenPayload
    )
  }

  @Delete('')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DELETE_BRANCH', SPECIAL_ROLE.STORE_OWNER)
  deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload
    return this.branchService.deleteMany(
      {
        ids: deleteManyDto.ids
      },
      tokenPayload
    )
  }
}
