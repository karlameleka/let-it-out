import type { Metadata } from "next";
import { Users, Video, GraduationCap } from "lucide-react";
import { FeaturePage } from "@/components/marketing/feature-page";
import { PhoneFrame } from "@/components/install-preview";

export const metadata: Metadata = {
  title: { absolute: "Trainings & Workshops | Let It Out" },
  description: "Evidence-based workshops on stress management, mental health first-aid, and workplace wellbeing, right from the Let It Out app.",
};

const HIGHLIGHTS = [
  { icon: Video, text: "Live & interactive" },
  { icon: Users, text: "Individual or team sessions" },
  { icon: GraduationCap, text: "Led by licensed psychologists" },
];

const WORKSHOPS = [
  { title: "Stress Management for Employees", meta: "60 min · Workplace" },
  { title: "Mental Health First-Aid", meta: "90 min · Certification" },
];

export default function WorkshopsPage() {
  return (
    <FeaturePage
      eyebrow="Trainings & Workshops"
      title="Evidence-based workshops for teams and individuals."
      description="Interactive sessions on stress management, mental health first-aid, and workplace wellbeing — book a spot or bring one to your organization."
      highlights={HIGHLIGHTS}
      closingTitle="Ready to find your next workshop?"
      phone={
        <PhoneFrame label="Upcoming workshops">
          <div className="bg-brand-50 px-4 pb-4 pt-8">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-brand-500">Workshops</p>
            <p className="mt-1 font-display text-base font-medium text-brand-900">Upcoming sessions</p>
          </div>
          <div className="space-y-2 px-4 py-3">
            {WORKSHOPS.map((w) => (
              <div key={w.title} className="rounded-lg border border-brand-100 bg-white p-2.5">
                <p className="text-[9px] font-semibold leading-tight text-brand-900">{w.title}</p>
                <p className="mt-1 text-[7px] font-semibold uppercase tracking-wide text-brand-500">{w.meta}</p>
              </div>
            ))}
          </div>
        </PhoneFrame>
      }
    />
  );
}
