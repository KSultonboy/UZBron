import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("categories")
@Controller("categories")
export class CategoriesController {
  constructor(private readonly prisma: PrismaService) {}

  /** Barcha vertikallar (kategoriyalar) */
  @Get()
  async findAll() {
    const items = await this.prisma.category.findMany({
      orderBy: { sort: "asc" },
      select: { key: true, nameUz: true, nameRu: true, nameEn: true, icon: true, active: true },
    });
    return { items };
  }
}
