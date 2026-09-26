"use client";

import { useState, useTransition } from "react";
import { ShieldAlert, Settings2, Cog, Bell, X, type LucideIcon } from "lucide-react";
import { markNotificationRead, dismissNotification } from "@/lib/notification-read-actions";
import { CAIRO_TIME_ZONE } from "@/lib/timezone-constants";
import type { FeedCategory } from "./page";

type Item = {
  id: string;
  itemId: string;
  summary: string;
  action: string;
  actorEmail: string | null;
  severity: string;
  category: FeedCategory;
  createdAt: string;
  read: boolean;
};

const CATEGORY_META: Record<FeedCategory, { label: string; icon: LucideIcon }> = {
  security: { label: "Security alerts", icon: ShieldAlert },
  system: { label: "System updates", icon: Settings2 },
  background: { label: "Background jobs", icon: Cog },
  other: { label: "Other", icon: Bell },
};

const SEVERITY_DOT: Record<string, string> = {
  INFO: "bg-brand-400",
  WARNING: "bg-amber-500",
  SECURITY: "bg-red-500",
};

function NotificationRow({ item, onDismiss }: { item: Item; onDismiss: (itemId: string) => void }) {
  const [read, setRead] = useState(item.read);
  const [pending, startTransition] = useTransition();

  function handleOpen() {
    if (!read) {
      setRead(true);
      startTransition(() => {
        markNotificationRead(item.itemId).catch(() => setRead(false));
      });
    }
  }

  function handleDismiss() {
    onDismiss(item.itemId);
    startTransition(() => {
      dismissNotification(item.itemId).catch(() => {});
    });
  }

  return (
    <div
      onClick={handleOpen}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
        read ? "border-brand-50 bg-white" : "border-brand-200 bg-brand-50/40"
      }`}
    >
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${SEVERITY_DOT[item.severity] ?? "bg-ink/20"}`} />
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${read ? "text-ink/70" : "font-medium text-ink/90"}`}>{item.summary}</p>
        <p className="mt-0.5 text-xs text-ink/40">
          {new Date(item.createdAt).toLocaleString("en-GB", { timeZone: CAIRO_TIME_ZONE })}
          {item.actorEmail && ` · ${item.actorEmail}`}
        </p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        disabled={pending}
        aria-label="Dismiss"
        className="shrink-0 rounded-full p-1 text-ink/30 hover:bg-ink/5 hover:text-ink/60"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

export default function NotificationCenterList({ items: initialItems }: { items: Item[] }) {
  const [items, setItems] = useState(initialItems);

  function handleDismiss(itemId: string) {
    setItems((prev) => prev.filter((i) => i.itemId !== itemId));
  }

  const groups: FeedCategory[] = ["security", "system", "background", "other"];

  return (
    <div className="space-y-8">
      {groups.map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        if (catItems.length === 0) return null;
        const { label, icon: Icon } = CATEGORY_META[cat];
        return (
          <div key={cat}>
            <h2 className="flex items-center gap-2 font-display font-semibold text-brand-900">
              <Icon className="h-4 w-4 text-brand-500" strokeWidth={2} />
              {label}
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                {catItems.length}
              </span>
            </h2>
            <div className="mt-2 space-y-1.5">
              {catItems.map((item) => (
                <NotificationRow key={item.id} item={item} onDismiss={handleDismiss} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
