import { Body, Controller, Delete, Get, Headers, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import {
  RequestOtpDto, VerifyOtpDto, RefreshDto, GoogleSignInDto, UpdateMeDto,
  LoginDto, EmailVerifyDto, CreateBusinessDto,
} from "./dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { CurrentUser, type CurrentUserData } from "./current-user.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("request-otp")
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.auth.requestOtp(dto.phone);
  }

  @Post("verify-otp")
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.phone, dto.code, dto.name);
  }

  @Post("google")
  google(@Body() dto: GoogleSignInDto) {
    return this.auth.googleSignIn(dto.idToken);
  }

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.auth.loginWithPassword(dto.email, dto.password);
  }

  @Post("login/email-verify")
  emailVerify(@Body() dto: EmailVerifyDto) {
    return this.auth.verifyEmailCode(dto.email, dto.code);
  }

  @Post("admin/create-business")
  createBusiness(
    @Headers("x-admin-secret") secret: string | undefined,
    @Body() dto: CreateBusinessDto,
  ) {
    return this.auth.createBusiness(secret, dto);
  }

  @Post("refresh")
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Get("me")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: CurrentUserData) {
    return this.auth.me(user.id);
  }

  @Patch("me")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  updateMe(@CurrentUser() user: CurrentUserData, @Body() dto: UpdateMeDto) {
    return this.auth.updateMe(user.id, dto);
  }

  @Delete("me")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  deleteMe(@CurrentUser() user: CurrentUserData) {
    return this.auth.deleteAccount(user.id);
  }
}
