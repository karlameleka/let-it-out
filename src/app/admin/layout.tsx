import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { Container } from "@/components/ui";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/workshops", label: "Workshop inquiries" },
  { href: "/admin/messages", label: "Contact messages" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="bg-sand-100 min-h-full">
      <Container className="py-10">
        <h1 className="font-display text-2xl font-bold text-brand-900">Admin</h1>
        <nav className="mt-6 flex flex-wrap gap-2 border-b border-brand-200 pb-2">
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink/70 hover:bg-white"
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8">{children}</div>
      </Container>
    </div>
  );
}
