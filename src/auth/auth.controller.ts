import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  LoginDto,
  LoginForCustomerDto,
  LoginForManagerDto,
  LoginForStaffDto,
} from './dto/login.dto';
import { AuthService } from './auth.service';
import { AccessBranchDto } from './dto/access-branch.dto';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { TokenPayload } from 'interfaces/common.interface';
import { ConfirmPhoneDto } from 'src/shop/dto/confirm-phone.dto';
import { VerifyPhoneDto } from 'src/shop/dto/verify-phone.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login-for-staff')
  @HttpCode(HttpStatus.OK)
  loginForStaff(@Body() loginForStaffDto: LoginForStaffDto) {
    return this.authService.loginForStaff(loginForStaffDto);
  }

  @Post('/login-for-manager')
  @HttpCode(HttpStatus.OK)
  loginForManager(@Body() loginForManagerDto: LoginForManagerDto) {
    return this.authService.loginForManager(loginForManagerDto);
  }

  @Post('/login-for-customer')
  @HttpCode(HttpStatus.OK)
  loginForCustomer(@Body() loginDto: LoginForCustomerDto) {
    return this.authService.loginForCustomer(loginDto);
  }

  @Post('/access-branch')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  accessBranch(@Body() accessBranchDto: AccessBranchDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.authService.accessBranch(accessBranchDto, tokenPayload);
  }

  @Post('/verify-phone')
  @HttpCode(HttpStatus.OK)
  verifyPhone(@Body() verifyPhoneDto: VerifyPhoneDto) {
    return this.authService.verifyPhone(verifyPhoneDto);
  }
}
