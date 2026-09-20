import type { Metadata } from "next";
import { CalendarCheck, MessageCircle, ShieldCheck } from "lucide-react";
import { FeaturePage } from "@/components/marketing/feature-page";
import { PhoneFrame } from "@/components/install-preview";

export const metadata: Metadata = {
  title: { absolute: "Individual Counseling | Let It Out" },
  description: "Book one-on-one online counseling sessions with specialized psychotherapists, right from the Let It Out app.",
};

const HIGHLIGHTS = [
  { icon: CalendarCheck, text: "Book in a few taps" },
  { icon: MessageCircle, text: "Message your counselor" },
  { icon: ShieldCheck, text: "Private & confidential" },
];

const COUNSELORS = [
  { name: "Dr. Salma Adel", specialty: "CBT · Anxiety" },
  { name: "Dr. Youssef Fahmy", specialty: "DBT · Relationships" },
  { name: "Dr. Nourhan Sami", specialty: "ACT · Burnout" },
];

export default function CounselingPage() {
  return (
    <FeaturePage
      eyebrow="Individual Counseling"
      title="Talk to a licensed therapist, on your schedule."
      description="One-on-one online sessions with specialized psychotherapists using CBT, ACT, and DBT frameworks — book, reschedule, and message your counselor, all from the app."
      highlights={HIGHLIGHTS}
      closingTitle="Ready to book your first session?"
      phone={
        <PhoneFrame label="Find your therapist">
          <div className="bg-brand-50 px-4 pb-4 pt-8">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-brand-500">Counseling</p>
            <p className="mt-1 font-display text-base font-medium text-brand-900">Find your therapist</p>
          </div>
          <div className="space-y-2 px-4 py-3">
            {COUNSELORS.map((c) => (
              <div key={c.name} className="flex items-center gap-2 rounded-lg border border-brand-100 bg-white p-2.5">
                <span className="h-7 w-7 shrink-0 rounded-full bg-brand-200" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[9px] font-semibold text-brand-900">{c.name}</p>
                  <p className="text-[7px] text-ink/40">{c.specialty}</p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-700 px-2 py-1 text-[7px] font-semibold text-white">Book</span>
              </div>
            ))}
          </div>
        </PhoneFrame>
      }
    />
  );
}
