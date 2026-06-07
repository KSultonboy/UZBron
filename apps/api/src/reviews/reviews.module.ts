import {
  Body, Controller, Post, UseGuards, Module, Injectable,
  BadRequestException, ForbiddenException, NotFoundException,
} from "@nestjs/common";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { AuthModule } from "../auth/auth.module";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type CurrentUserData } from "../auth/current-user.decorator";

export class CreateReviewDto {
  @IsString() bookingId!: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(5) rating!: number;
  @IsOptional() @IsString() comment?: string;
}

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id: dto.bookingId } });
    if (!booking) throw new NotFoundException("Bron topilmadi");
    if (booking.customerId !== userId) throw new ForbiddenException();

    const existing = await this.prisma.review.findUnique({ where: { bookingId: dto.bookingId } });
    if (existing) throw new BadRequestException("Bu bron uchun sharh allaqachon qoldirilgan");

    const review = await this.prisma.review.create({
      data: {
        bookingId: dto.bookingId,
        listingId: booking.listingId,
        customerId: userId,
        rating: dto.rating,
        comment: dto.comment ?? null,
      },
    });
    await this.prisma.listing.update({
      where: { id: booking.listingId },
      data: { reviewCount: { increment: 1 } },
    });
    return { id: review.id, ok: true };
  }
}

@ApiTags("reviews")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Post()
  create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateReviewDto) {
    return this.reviews.create(user.id, dto);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
