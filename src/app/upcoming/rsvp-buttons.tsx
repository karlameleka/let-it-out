"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setEventRSVP } from "@/lib/event-rsvp-actions";
import { hapticTap } from "@/lib/haptics";
import type { RSVPStatus } from "@/generated/prisma/enums";
import type { Dictionary } from "@/lib/i18n/dictionary";

const OPTIONS: { status: RSVPStatus; labelKey: keyof Dictionary["upcoming"] }[] = [
  { status: "ATTENDING", labelKey: "rsvpAttending" },
  { status: "MAYBE", labelKey: "rsvpMaybe" },
  { status: "NOT_ATTENDING", labelKey: "rsvpNotAttending" },
];

export default function RSVPButtons({
  eventId,
  current,
  dict,
}: {
  eventId: string;
  current: RSVPStatus | null;
  dict: Dictionary["upcoming"];
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink/40">
        {current ? dict.yourResponse : dict.rsvpPrompt}
      </p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((o) => {
          const selected = current === o.status;
          return (
            <button
              key={o.status}
              type="button"
              disabled={pending}
              onClick={() => {
                hapticTap();
                const formData = new FormData();
                formData.set("eventId", eventId);
                formData.set("status", o.status);
                startTransition(async () => {
                  await setEventRSVP(formData);
                  router.refresh();
                });
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                selected
                  ? "bg-brand-700 text-white"
                  : "border border-brand-200 text-ink/60 hover:bg-brand-50"
              }`}
            >
              {dict[o.labelKey]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
