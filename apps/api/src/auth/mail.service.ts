import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

/**
 * Email yuborish. SMTP env (EMAIL_HOST/USER/PASS) sozlangan bo'lsa haqiqiy email,
 * aks holda kodni logga yozadi (dev). Gmail uchun: EMAIL_HOST=smtp.gmail.com,
 * EMAIL_PORT=465, EMAIL_USER=<gmail>, EMAIL_PASS=<app password>.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger("MailService");
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>("EMAIL_HOST");
    const user = this.config.get<string>("EMAIL_USER");
    const pass = this.config.get<string>("EMAIL_PASS");
    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(this.config.get("EMAIL_PORT") ?? 465),
        secure: this.config.get("EMAIL_SECURE") !== "false",
        auth: { user, pass },
      });
    }
  }

  async sendCode(email: string, code: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`[EMAIL dev] ${email} -> kod: ${code} (SMTP sozlanmagan)`);
      return;
    }
    const from =
      this.config.get<string>("EMAIL_FROM") ??
      `UZBron <${this.config.get<string>("EMAIL_USER")}>`;
    await this.transporter.sendMail({
      from,
      to: email,
      subject: "UZBron — tasdiqlash kodi",
      text: `UZBron biznes paneliga kirish kodi: ${code}\n\nKod 10 daqiqa amal qiladi. Agar bu siz bo'lmasangiz, e'tiborsiz qoldiring.`,
      html: `<div style="font-family:system-ui,sans-serif;max-width:420px">
        <h2 style="color:#16306f">UZBron tasdiqlash kodi</h2>
        <p>Biznes paneliga kirish kodingiz:</p>
        <p style="font-size:30px;font-weight:800;letter-spacing:6px;color:#16306f">${code}</p>
        <p style="color:#888;font-size:13px">Kod 10 daqiqa amal qiladi. Agar bu siz bo'lmasangiz, e'tiborsiz qoldiring.</p>
      </div>`,
    });
  }
}
