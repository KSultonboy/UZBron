import { IsInt, IsOptional, IsString, Matches, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateBookingDto {
  @IsString()
  unitId!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/u, { message: "startDate YYYY-MM-DD bo'lishi kerak" })
  startDate!: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/u, { message: "endDate YYYY-MM-DD bo'lishi kerak" })
  endDate?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests!: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateBookingStatusDto {
  @IsString()
  status!: "CANCELLED";
}
