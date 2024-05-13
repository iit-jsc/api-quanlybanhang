import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LoginDto } from './dto/login-dto';
import { AuthService } from './auth.service';
import { AccessBranchDTO } from './dto/access-branch-dto';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { TokenPayload } from 'interfaces/common.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/access-branch')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  accessBranch(@Body() accessBranchDTO: AccessBranchDTO, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.authService.accessBranch(accessBranchDTO, tokenPayload);
  }
}
