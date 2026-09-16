import Link from "next/link";
import {
  UserPlus,
  ShoppingCart,
  CalendarClock,
  Presentation,
  Mail,
  Bell,
  CalendarCheck,
  MessageCircleWarning,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/db";

type StatCard = {
  href: string;
  label: string;
  value: number;
  icon: LucideIcon;
  /** Short caption under the value clarifying what the count actually means. */
  hint: string;
  /** Only "needs attention" cards get the red accent when their count is
   * above zero — activity totals stay neutral no matter how large they get. */
  urgent?: boolean;
};

function StatCardTile({ card }: { card: StatCard }) {
  const flagged = card.urgent && card.value > 0;
  const Icon = card.icon;
  return (
    <Link
      href={card.href}
      className="group flex flex-col justify-between rounded-2xl border border-brand-100 bg-white p-5 transition-colors hover:border-brand-300"
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            flagged ? "bg-red-50 text-red-600" : "bg-brand-50 text-brand-600"
          }`}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <ArrowUpRight
          className="h-4 w-4 text-ink/20 transition-colors group-hover:text-brand-500"
          strokeWidth={2}
        />
      </div>
      <div className="mt-4">
        <p className="font-display text-3xl font-semibold text-brand-900">{card.value}</p>
        <p className="mt-1 text-sm font-medium text-ink/70">{card.label}</p>
        <p className="mt-0.5 text-xs text-ink/45">{card.hint}</p>
      </div>
    </Link>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-brand-900">{title}</h2>
      <p className="mt-1 text-sm text-ink/60">{subtitle}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}

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

  const attentionCards: StatCard[] = [
    { href: "/admin/crm", label: "New leads in the CRM", value: newLeads, icon: UserPlus, hint: "Not yet contacted", urgent: true },
    { href: "/admin/orders", label: "Orders needing attention", value: pendingOrders, icon: ShoppingCart, hint: "Pending or unconfirmed payment", urgent: true },
    { href: "/admin/bookings", label: "Pending booking requests", value: newBookings, icon: CalendarClock, hint: "Awaiting confirmation", urgent: true },
    { href: "/admin/workshops", label: "New workshop inquiries", value: newInquiries, icon: Presentation, hint: "Not yet followed up", urgent: true },
    { href: "/admin/support", label: "Live chats flagged as unresolved", value: flaggedChats, icon: MessageCircleWarning, hint: "Needs a human reply", urgent: true },
  ];

  const activityCards: StatCard[] = [
    { href: "/admin/messages", label: "Contact messages", value: messages, icon: Mail, hint: "All-time total" },
    { href: "/admin/workshop-signups", label: "Workshop notify signups", value: workshopSignups, icon: Bell, hint: "All-time total" },
    { href: "/admin/events", label: "Event RSVPs", value: eventRsvps, icon: CalendarCheck, hint: "All-time total" },
  ];

  const totalNeedingAttention = attentionCards.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="space-y-10">
      <p className="text-sm text-ink/60">
        {totalNeedingAttention > 0
          ? `${totalNeedingAttention} item${totalNeedingAttention === 1 ? "" : "s"} across the site could use your attention.`
          : "Nothing pending right now, everything below is caught up."}
      </p>

      <Section title="Needs your attention" subtitle="Pending items across leads, orders, bookings, and support.">
        {attentionCards.map((c) => (
          <StatCardTile key={c.href} card={c} />
        ))}
      </Section>

      <Section title="Activity" subtitle="Ongoing totals, informational only, nothing here requires action.">
        {activityCards.map((c) => (
          <StatCardTile key={c.href} card={c} />
        ))}
      </Section>
    </div>
  );
}
