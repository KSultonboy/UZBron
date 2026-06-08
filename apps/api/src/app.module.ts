import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthController } from "./health/health.controller";
import { CategoriesModule } from "./categories/categories.module";
import { ListingsModule } from "./listings/listings.module";
import { AuthModule } from "./auth/auth.module";
import { BookingsModule } from "./bookings/bookings.module";
import { FavoritesModule } from "./favorites/favorites.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { VendorModule } from "./vendor/vendor.module";
import { UploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CategoriesModule,
    ListingsModule,
    BookingsModule,
    FavoritesModule,
    ReviewsModule,
    VendorModule,
    UploadsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
