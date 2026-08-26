import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminOverviewPage() {
  const [newLeads, pendingOrders, newBookings, newInquiries, messages, workshopSignups, eventRsvps, flaggedChats] =
    await Promise.all([
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.order.count({ where: { status: { in: ["PENDING_PAYMENT", "PAYMENT_SUBMITTED"] } } }),
      prisma.bookingRequest.count({ where: { status: "PENDING" } }),
      prisma.workshopInquiry.count({ where: { status: "NEW" } }),
      prisma.contactMessage.count(),
      prisma.workshopInterestSignup.count(),
      prisma.eventRSVP.count(),
      prisma.supportChat.count({ where: { flaggedUnresolved: true } }),
    ]);

  const cards = [
    { href: "/admin/crm", label: "New leads in the CRM", value: newLeads },
    { href: "/admin/orders", label: "Orders needing attention", value: pendingOrders },
    { href: "/admin/bookings", label: "Pending booking requests", value: newBookings },
    { href: "/admin/workshops", label: "New workshop inquiries", value: newInquiries },
    { href: "/admin/messages", label: "Contact messages", value: messages },
    { href: "/admin/workshop-signups", label: "Workshop notify signups", value: workshopSignups },
    { href: "/admin/events", label: "Event RSVPs", value: eventRsvps },
    { href: "/admin/support", label: "Live chats flagged as unresolved", value: flaggedChats },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Link
          key={c.href}
          href={c.href}
          className="rounded-2xl border border-brand-100 bg-white p-6 hover:border-brand-300"
        >
          <p className="font-display text-3xl font-semibold text-brand-800">{c.value}</p>
          <p className="mt-1 text-sm text-ink/60">{c.label}</p>
        </Link>
      ))}
    </div>
  );
}
