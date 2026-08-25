"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import MonthCalendar from "@/components/month-calendar";
import StatusBadge from "../../status-badge";
import type { TherapistAppointment } from "@/lib/therapist-data";

/** Calendar-grid overview of a therapist's upcoming appointments — click a
 * highlighted day to filter the agenda list below to just that day. */
export default function AppointmentsCalendar({ upcoming }: { upcoming: TherapistAppointment[] }) {
  const byDate = useMemo(() => {
    const map = new Map<string, TherapistAppointment[]>();
    for (const a of upcoming) {
      map.set(a.date, [...(map.get(a.date) ?? []), a]);
    }
    return map;
  }, [upcoming]);
  const dates = [...byDate.keys()].sort();
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  const datesToShow = selectedDate ? [selectedDate] : dates;

  return (
    <div className="grid gap-6 sm:grid-cols-[minmax(0,280px)_1fr]">
      <div>
        <MonthCalendar
          highlightedDates={new Set(dates)}
          selectedDate={selectedDate}
          onSelectDate={(date) => setSelectedDate((current) => (current === date ? undefined : date))}
          locale="en"
        />
        {selectedDate && (
          <button
            type="button"
            onClick={() => setSelectedDate(undefined)}
            className="mt-2 text-xs font-medium text-brand-600 link-grow"
          >
            Clear filter
          </button>
        )}
      </div>

      <div>
        {datesToShow.length === 0 ? (
          <p className="text-sm text-ink/60">Nothing scheduled yet.</p>
        ) : (
          <div className="space-y-5">
            {datesToShow.map((date) => (
              <div key={date}>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                  {new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <div className="mt-2 space-y-2">
                  {(byDate.get(date) ?? []).map((a) => (
                    <Link
                      key={`${a.kind}-${a.id}`}
                      href={`/therapist/clients/${encodeURIComponent(a.email)}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-white px-4 py-3 transition-colors hover:border-brand-300"
                    >
                      <div>
                        <p className="font-medium text-brand-900">{a.name}</p>
                        <p className="text-xs text-ink/50">
                          {a.kind}
                          {a.time ? ` · ${a.time}` : ""}
                        </p>
                      </div>
                      <StatusBadge status={a.status} />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
