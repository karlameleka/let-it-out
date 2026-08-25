const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-brand-50 text-brand-700",
  PENDING_PAYMENT: "bg-ink/5 text-ink/50",
  CANCELLED: "bg-red-50 text-red-700",
  COMPLETED: "bg-brand-50 text-brand-700",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-ink/5 text-ink/50"}`}>
      {status.replaceAll("_", " ").toLowerCase()}
    </span>
  );
}
