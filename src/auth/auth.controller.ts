import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { LoginForCustomerDto, LoginForManagerDto, LoginDto } from "./dto/login.dto";
import { AuthService } from "./auth.service";
import { AccessBranchDto } from "./dto/access-branch.dto";
import { JwtAuthGuard } from "guards/jwt-auth.guard";
import { TokenPayload } from "interfaces/common.interface";
import { VerifyContactDto } from "src/shop/dto/verify-contact.dto";
import { CustomHttpException } from "utils/ApiErrors";
import { ChangeMyPasswordDto, ChangePasswordDto } from "./dto/change-password.dto";
import { ChangeAvatarDto } from "./dto/change-information.dto";
import { AccessBranchGuard } from "guards/access-branch.guard";
import { SPECIAL_ROLE } from "enums/common.enum";
import { Roles } from "guards/roles.decorator";
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/login")
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("/login-for-customer")
  @HttpCode(HttpStatus.OK)
  loginForCustomer(@Body() loginDto: LoginForCustomerDto) {
    return this.authService.loginForCustomer(loginDto);
  }

  @Post("/access-branch")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessBranchGuard)
  async accessBranch(@Body() accessBranchDto: AccessBranchDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.authService.accessBranch({ ...accessBranchDto }, tokenPayload, req);
  }

  @Post("/verify-contact")
  @HttpCode(HttpStatus.OK)
  verifyContact(@Body() verifyContactDto: VerifyContactDto) {
    return this.authService.verifyContact(verifyContactDto);
  }

  @Post("/logout")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  logout(@Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;

    return this.authService.logout(tokenPayload);
  }

  @Patch("/change-password")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Roles("UPDATE_EMPLOYEE", SPECIAL_ROLE.MANAGER)
  changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.authService.changePassword(changePasswordDto, tokenPayload);
  }

  @Patch("/change-my-password")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  changeMyPassword(@Body() changeMyPasswordDto: ChangeMyPasswordDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.authService.changeMyPassword(changeMyPasswordDto, tokenPayload);
  }

  @Patch("/change-information")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  changeInformation(@Body() changeInformationDto: ChangeAvatarDto, @Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.authService.changeInformation(changeInformationDto, tokenPayload);
  }

  @Post("/me")
  @HttpCode(HttpStatus.OK)
  getMe(@Headers("authorization") authHeader: string) {
    if (!authHeader) {
      throw new CustomHttpException(HttpStatus.UNAUTHORIZED, "Không tìm thấy auth header!");
    }

    const [_, token] = authHeader.split(" ");

    if (!token) {
      throw new CustomHttpException(HttpStatus.UNAUTHORIZED, "Không tìm thấy token!");
    }

    return this.authService.getMe(token);
  }

  @Post("/refresh-token")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  refreshToken(@Headers("authorization") authHeader: string) {
    if (!authHeader) {
      throw new CustomHttpException(HttpStatus.UNAUTHORIZED, "Không tìm thấy auth header!");
    }

    const [_, token] = authHeader.split(" ");

    if (!token) {
      throw new CustomHttpException(HttpStatus.UNAUTHORIZED, "Không tìm thấy token!");
    }
    return this.authService.refreshToken(token);
  }

  @Get("/device")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  getDevice(@Req() req: any) {
    const tokenPayload = req.tokenPayload as TokenPayload;
    return this.authService.getDevice(tokenPayload);
  }
}
