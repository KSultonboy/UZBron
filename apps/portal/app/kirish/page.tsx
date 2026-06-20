import type { Metadata } from "next";
import { UserLogin } from "@/components/user-login";

export const metadata: Metadata = {
  title: "Kirish",
  description: "UZBron hisobingizga kiring va bronlaringizni boshqaring.",
};

export default function KirishPage() {
  return <UserLogin />;
}
