import { Controller, Delete, Get, Param, Post, UseGuards, Module, Injectable } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { AuthModule } from "../auth/auth.module";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type CurrentUserData } from "../auth/current-user.decorator";

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async ids(userId: string) {
    const rows = await this.prisma.favorite.findMany({
      where: { userId },
      select: { listingId: true },
    });
    return { ids: rows.map((r) => r.listingId) };
  }

  async add(userId: string, listingId: string) {
    await this.prisma.favorite.upsert({
      where: { userId_listingId: { userId, listingId } },
      update: {},
      create: { userId, listingId },
    });
    return { favorite: true };
  }

  async remove(userId: string, listingId: string) {
    await this.prisma.favorite.deleteMany({ where: { userId, listingId } });
    return { favorite: false };
  }
}

@ApiTags("favorites")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("favorites")
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  ids(@CurrentUser() user: CurrentUserData) {
    return this.favorites.ids(user.id);
  }

  @Post(":listingId")
  add(@CurrentUser() user: CurrentUserData, @Param("listingId") listingId: string) {
    return this.favorites.add(user.id, listingId);
  }

  @Delete(":listingId")
  remove(@CurrentUser() user: CurrentUserData, @Param("listingId") listingId: string) {
    return this.favorites.remove(user.id, listingId);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
