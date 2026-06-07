import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AuthedRequest } from "./jwt-auth.guard";

export interface CurrentUserData {
  id: string;
  role: string;
  phone: string | null;
}

/** Himoyalangan endpointlarda joriy foydalanuvchini olish */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    return req.user as CurrentUserData;
  },
);
