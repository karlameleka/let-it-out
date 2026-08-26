import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import SupportChat from "./support-chat";

export const metadata: Metadata = { title: "Live Chat" };

export default async function SupportPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  const locale = await getLocale();
  const dict = getDictionary(locale).supportChat;

  return <SupportChat dict={dict} />;
}
