import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import SupportChat from "./support-chat";

export const metadata: Metadata = { title: "Live Chat" };

export default async function SupportPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  return <SupportChat />;
}
