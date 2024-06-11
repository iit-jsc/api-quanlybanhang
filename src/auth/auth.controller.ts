import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LoginDto, LoginWithCustomerDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { AccessBranchDto } from './dto/access-branch.dto';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { TokenPayload } from 'interfaces/common.interface';
import { ConfirmPhoneDto } from 'src/shop/dto/confirm-phone.dto';
import { VerifyPhoneDto } from 'src/shop/dto/verify-phone.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/login-with-customer')
  @HttpCode(HttpStatus.OK)
  loginWithCustomer(@Body() loginDto: LoginWithCustomerDto) {
    return this.authService.loginWithCustomer(loginDto);
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
