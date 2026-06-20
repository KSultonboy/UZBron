import { Body, Controller, Injectable, Module, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsEmail, IsIn, IsOptional, IsString, Length } from "class-validator";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaModule } from "../prisma/prisma.module";

export class CreateFeedbackDto {
  @IsOptional()
  @IsIn(["COMPLAINT", "SUGGESTION"])
  type?: "COMPLAINT" | "SUGGESTION";

  @IsOptional()
  @IsString()
  @Length(2, 80)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @Length(3, 2000, { message: "Xabar 3–2000 belgidan iborat bo'lsin" })
  message!: string;
}

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFeedbackDto) {
    await this.prisma.feedback.create({
      data: {
        type: dto.type ?? "SUGGESTION",
        name: dto.name?.trim() || null,
        email: dto.email?.trim().toLowerCase() || null,
        message: dto.message.trim(),
      },
    });
    return { ok: true };
  }
}

@ApiTags("feedback")
@Controller("feedback")
export class FeedbackController {
  constructor(private readonly feedback: FeedbackService) {}

  @Post()
  create(@Body() dto: CreateFeedbackDto) {
    return this.feedback.create(dto);
  }
}

@Module({
  imports: [PrismaModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
