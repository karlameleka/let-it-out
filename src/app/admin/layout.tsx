import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Container } from "@/components/ui";
import AdminSearch from "@/components/admin-search";
import AdminNav from "@/components/admin-nav";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/finance", label: "Finance" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/behavioral-analytics", label: "Behavioral Analytics" },
  { href: "/admin/crm", label: "CRM" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/counselors", label: "Counselors" },
  { href: "/admin/counseling-filters", label: "Counseling filters" },
  { href: "/admin/promo-codes", label: "Promo codes" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/notification-center", label: "Notification Center" },
  { href: "/admin/workshops", label: "Workshop inquiries" },
  { href: "/admin/workshop-signups", label: "Workshop notify list" },
  { href: "/admin/messages", label: "Contact messages" },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/support", label: "Live chat" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/intake-form", label: "Intake form" },
  { href: "/admin/reflection-sheet", label: "Reflection sheet" },
  { href: "/admin/journal-prompts", label: "Journal prompts" },
  { href: "/admin/resources", label: "Resources" },
  { href: "/admin/audit-log", label: "Audit Log" },
  { href: "/admin/recently-deleted", label: "Recently Deleted" },
  { href: "/admin/settings", label: "Site settings" },
  { href: "/account", label: "My account" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="bg-brand-50 min-h-full">
      <Container className="py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-2xl font-semibold text-brand-900">Admin</h1>
          <AdminSearch tabs={TABS} />
        </div>
        <AdminNav tabs={TABS} />
        <div className="mt-8">{children}</div>
      </Container>
    </div>
  );
}
