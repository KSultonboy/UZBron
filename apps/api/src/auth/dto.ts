import {
  IsEmail, IsIn, IsISO8601, IsOptional, IsString, Length, Matches,
} from "class-validator";

export class RequestOtpDto {
  @Matches(/^\+998\d{9}$/u, { message: "Telefon +998XXXXXXXXX formatida bo'lishi kerak" })
  phone!: string;
}

export class VerifyOtpDto {
  @Matches(/^\+998\d{9}$/u, { message: "Telefon +998XXXXXXXXX formatida bo'lishi kerak" })
  phone!: string;

  @IsString()
  @Length(6, 6, { message: "Kod 6 xonali bo'lishi kerak" })
  code!: string;

  @IsOptional()
  @IsString()
  @Length(2, 60)
  name?: string;
}

export class RefreshDto {
  @IsString()
  refreshToken!: string;
}

export class LoginDto {
  @IsEmail({}, { message: "Email noto'g'ri" })
  email!: string;

  @IsString()
  @Length(6, 100, { message: "Parol kamida 6 belgi" })
  password!: string;
}

export class EmailVerifyDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6, { message: "Kod 6 xonali bo'lishi kerak" })
  code!: string;
}

export class RegisterDto {
  @IsEmail({}, { message: "Email noto'g'ri" })
  email!: string;

  @IsString()
  @Length(6, 100, { message: "Parol kamida 6 belgi" })
  password!: string;

  @IsOptional()
  @IsString()
  @Length(2, 60)
  name?: string;
}

export class CreateBusinessDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 100)
  password!: string;

  @IsOptional()
  @IsString()
  @Length(2, 80)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  businessName?: string;

  @IsOptional()
  @IsIn(["VENDOR", "ADMIN"])
  role?: "VENDOR" | "ADMIN";
}

export class GoogleSignInDto {
  @IsString()
  idToken!: string;
}

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @Length(2, 60)
  name?: string | null;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @IsISO8601({ strict: true })
  birthday?: string | null;

  @IsOptional()
  @IsIn(["MALE", "FEMALE", "OTHER"])
  gender?: string | null;
}
