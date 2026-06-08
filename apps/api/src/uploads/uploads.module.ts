import {
  BadRequestException,
  Controller,
  Module,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { extname, join } from "path";
import { AuthModule } from "../auth/auth.module";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

/** Rasmlar saqlanadigan papka (prod'da Docker volume orqali doimiy). */
export const UPLOADS_DIR = process.env.UPLOADS_DIR || join(process.cwd(), "uploads");
const PUBLIC_ORIGIN = process.env.PUBLIC_API_ORIGIN || "https://uzbooking-api.ruhshonatort.com";
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

// @types/multer'ga bog'lanmaslik uchun minimal tip.
interface UploadedFileLike {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
}

@ApiTags("uploads")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("uploads")
export class UploadsController {
  @Post()
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 6 * 1024 * 1024 } }))
  async upload(@UploadedFile() file: UploadedFileLike) {
    if (!file) throw new BadRequestException("Fayl yuborilmadi");
    if (!ALLOWED.has(file.mimetype)) {
      throw new BadRequestException("Faqat JPG, PNG yoki WEBP rasm yuklash mumkin");
    }
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const ext = EXT_BY_MIME[file.mimetype] || extname(file.originalname).toLowerCase() || ".jpg";
    const name = `${randomUUID()}${ext}`;
    await fs.writeFile(join(UPLOADS_DIR, name), file.buffer);
    return { url: `${PUBLIC_ORIGIN}/uploads/${name}` };
  }
}

@Module({
  imports: [AuthModule],
  controllers: [UploadsController],
})
export class UploadsModule {}
