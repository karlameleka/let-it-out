"use client";

import { useState } from "react";
import { Bell, MapPin } from "lucide-react";
import type { UpcomingItem } from "@/lib/upcoming-items";

function formatItemDate(item: UpcomingItem) {
  const date = new Date(`${item.date}T${item.time ?? "00:00"}:00`);
  const dateLabel = date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  return item.time ? `${dateLabel} · ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : dateLabel;
}

export default function NotificationBell({ items }: { items: UpcomingItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Upcoming, ${items.length} item${items.length === 1 ? "" : "s"}`}
        aria-expanded={open}
        className="relative inline-flex items-center justify-center rounded-md p-2 text-ink hover:text-brand-700 active:text-brand-700"
      >
        <Bell className="h-5 w-5" strokeWidth={2} />
        {items.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-semibold leading-none text-white">
            {items.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="animate-pop-in absolute end-0 top-[calc(100%+0.5rem)] z-50 w-80 rounded-2xl border-2 border-brand-100 bg-white p-4 shadow-xl">
            <p className="font-display font-semibold text-brand-900">Upcoming</p>
            {items.length === 0 ? (
              <p className="mt-2 text-sm text-ink/60">Nothing on your calendar yet.</p>
            ) : (
              <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="rounded-xl border border-brand-100 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-ink/90">{item.title}</p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          item.kind === "event" ? "bg-amber-100 text-amber-800" : "bg-brand-50 text-brand-700"
                        }`}
                      >
                        {item.kind === "event" ? "Event" : "Session"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink/50">{formatItemDate(item)}</p>
                    {item.location && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-ink/50">
                        <MapPin className="h-3 w-3 shrink-0" strokeWidth={2} />
                        {item.location}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
