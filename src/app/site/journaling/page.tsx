import type { Metadata } from "next";
import { Sparkles, Smile, ShieldCheck } from "lucide-react";
import { FeaturePage } from "@/components/marketing/feature-page";
import { PhoneFrame } from "@/components/install-preview";

export const metadata: Metadata = {
  title: { absolute: "Guided Journaling | Let It Out" },
  description: "Daily guided journaling prompts, mood check-ins, and a private archive of your entries, right from the Let It Out app.",
};

const HIGHLIGHTS = [
  { icon: Sparkles, text: "Daily guided prompts" },
  { icon: Smile, text: "Track your mood" },
  { icon: ShieldCheck, text: "Private, works offline" },
];

const ENTRIES = [
  { date: "12 Aug", mood: "#8bc4d1" },
  { date: "11 Aug", mood: "#3388a4" },
  { date: "10 Aug", mood: "#1e5b73" },
];

export default function JournalingPage() {
  return (
    <FeaturePage
      eyebrow="Guided Journaling"
      title="A private space to reflect, every day."
      description="Daily guided prompts, mood check-ins, and a searchable archive of your entries — a self-exploration habit that fits right in your pocket."
      highlights={HIGHLIGHTS}
      closingTitle="Ready to start your first entry?"
      phone={
        <PhoneFrame label="Your daily journal">
          <div className="bg-brand-50 px-4 pb-4 pt-8">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-brand-500">Self-exploration</p>
            <p className="mt-1 font-display text-base font-medium text-brand-900">Hi, welcome back</p>
            <div className="mt-3 flex gap-2">
              <div className="rounded-lg border border-brand-100 bg-white px-3 py-1.5">
                <p className="font-display text-sm font-semibold leading-none text-brand-900">12</p>
                <p className="mt-0.5 text-[7px] font-semibold uppercase text-ink/40">Day streak</p>
              </div>
              <div className="rounded-lg border border-brand-100 bg-white px-3 py-1.5">
                <p className="font-display text-sm font-semibold leading-none text-brand-900">34</p>
                <p className="mt-0.5 text-[7px] font-semibold uppercase text-ink/40">Entries</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 px-4 py-3">
            {ENTRIES.map((e) => (
              <div key={e.date} className="flex items-center gap-1.5 rounded-lg border border-brand-100 bg-white p-2.5">
                <span className="text-[7px] text-ink/40">{e.date}</span>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: e.mood }} />
                <span className="h-1.5 flex-1 rounded-full bg-brand-50" />
              </div>
            ))}
          </div>
        </PhoneFrame>
      }
    />
  );
}
