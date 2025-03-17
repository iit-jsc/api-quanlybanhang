import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common'
import { Response } from 'express'
import { LoginDto } from './dto/login.dto'
import { AuthService } from './auth.service'
import { AccessBranchDto } from './dto/access-branch.dto'
import { RequestJWT } from 'interfaces/common.interface'

import { AccessBranchGuard } from 'guards/access-branch.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Post('/access-branch')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessBranchGuard)
  async accessBranch(
    @Body() accessBranchDto: AccessBranchDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: RequestJWT
  ) {
    const { accountId } = req

    return this.authService.accessBranch(accountId, accessBranchDto, res)
  }

  @Get('/get-me')
  @HttpCode(HttpStatus.OK)
  getMe(@Headers('authorization') authHeader: string) {
    if (!authHeader) throw new HttpException('Không tìm thấy auth header!', HttpStatus.UNAUTHORIZED)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, token] = authHeader.split(' ')

    if (!token) throw new HttpException('Không tìm thấy token!', HttpStatus.UNAUTHORIZED)

    return this.authService.getMe(token)
  }

  // @Post('/verify-contact')
  // @HttpCode(HttpStatus.OK)
  // verifyContact(@Body() verifyContactDto: VerifyContactDto) {
  //   return this.authService.verifyContact(verifyContactDto)
  // }

  // @Post('/logout')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // logout(@Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload

  //   return this.authService.logout(tokenPayload)
  // }

  // @Patch('/change-password')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // @Roles('UPDATE_EMPLOYEE', SPECIAL_ROLE.MANAGER)
  // changePassword(
  //   @Body() changePasswordDto: ChangePasswordDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.authService.changePassword(changePasswordDto, tokenPayload)
  // }

  // @Patch('/change-my-password')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // changeMyPassword(
  //   @Body() changeMyPasswordDto: ChangeMyPasswordDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.authService.changeMyPassword(changeMyPasswordDto, tokenPayload)
  // }

  // @Patch('/change-information')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // changeInformation(
  //   @Body() changeInformationDto: ChangeAvatarDto,
  //   @Req() req: any
  // ) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.authService.changeInformation(
  //     changeInformationDto,
  //     tokenPayload
  //   )
  // }

  // @Post('/refresh-token')
  // @HttpCode(HttpStatus.OK)
  // refreshToken(@Req() req: Request) {
  //   const refreshToken = req.cookies['refreshToken']

  //   if (!refreshToken) {
  //     throw new CustomHttpException(
  //       HttpStatus.UNAUTHORIZED,
  //       'Không tìm thấy token!'
  //     )
  //   }

  //   return this.authService.refreshToken(refreshToken)
  // }

  // @Get('/device')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // getDevice(@Req() req: any) {
  //   const tokenPayload = req.tokenPayload as TokenPayload
  //   return this.authService.getDevice(tokenPayload)
  // }
}
