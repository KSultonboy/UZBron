import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags, ApiQuery } from "@nestjs/swagger";
import { ListingsService, type SearchParams } from "./listings.service";

@ApiTags("listings")
@Controller("listings")
export class ListingsController {
  constructor(private readonly listings: ListingsService) {}

  /** Mehmonxonalarni qidirish / filtrlash / saralash */
  @Get()
  @ApiQuery({ name: "category", required: false })
  @ApiQuery({ name: "q", required: false })
  @ApiQuery({ name: "city", required: false })
  @ApiQuery({ name: "sort", required: false, enum: ["rating", "price_asc", "price_desc", "newest"] })
  @ApiQuery({ name: "limit", required: false })
  search(@Query() query: SearchParams) {
    return this.listings.search(query);
  }

  /** Bitta mehmonxona tafsilotlari */
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.listings.findOne(id);
  }
}
