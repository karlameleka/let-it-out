import { PlusCircle, Search, Star, Brain, ArrowRight } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary";

/** Stylized phone-frame previews of the journal and resources screens, so
    someone deciding whether to install can see roughly what they're getting
    before they commit — not real screenshots, but close enough to be honest. */
export default function InstallPreview({ dict }: { dict: Dictionary["install"] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <PhoneFrame label={dict.previewJournalLabel}>
        <div className="bg-brand-50 px-4 pb-4 pt-8">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-brand-500">{dict.previewSelfExploration}</p>
          <p className="mt-1 font-display text-base font-medium text-brand-900">{dict.previewWelcomeBack}</p>
          <div className="mt-3 flex gap-2">
            <div className="rounded-lg border border-brand-100 bg-white px-3 py-1.5">
              <p className="font-display text-sm font-semibold leading-none text-brand-900">12</p>
              <p className="mt-0.5 text-[7px] font-semibold uppercase text-ink/40">{dict.previewDayStreak}</p>
            </div>
            <div className="rounded-lg border border-brand-100 bg-white px-3 py-1.5">
              <p className="font-display text-sm font-semibold leading-none text-brand-900">34</p>
              <p className="mt-0.5 text-[7px] font-semibold uppercase text-ink/40">{dict.previewEntries}</p>
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-700 px-2.5 py-1 text-[9px] font-semibold text-white">
            <PlusCircle className="h-2.5 w-2.5" strokeWidth={2} />
            {dict.previewNewEntry}
          </div>
        </div>
        <div className="space-y-2 px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-ink/30" strokeWidth={2} />
            <div className="w-full rounded-full border border-brand-200 bg-white py-1.5 pl-6 text-[8px] text-ink/30">
              {dict.previewSearchPlaceholder}
            </div>
          </div>
          {[
            { date: "12 Aug", mood: "#8bc4d1", text: dict.previewEntry1 },
            { date: "11 Aug", mood: "#3388a4", text: dict.previewEntry2 },
            { date: "10 Aug", mood: "#1e5b73", text: dict.previewEntry3 },
          ].map((e) => (
            <div key={e.date} className="rounded-lg border border-brand-100 bg-white p-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[7px] text-ink/40">{e.date}</span>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: e.mood }} />
                <Star className="ml-auto h-2.5 w-2.5 text-ink/20" strokeWidth={2} />
              </div>
              <p className="mt-1 line-clamp-1 text-[8px] leading-tight text-ink/70">{e.text}</p>
            </div>
          ))}
        </div>
      </PhoneFrame>

      <PhoneFrame label={dict.previewResourceLabel}>
        <div className="bg-brand-50 px-4 pb-4 pt-8">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-brand-500">{dict.previewRead}</p>
          <p className="mt-1 font-display text-base font-medium text-brand-900">{dict.previewLatestArticles}</p>
        </div>
        <div className="space-y-2 px-4 py-3">
          <div className="flex items-center gap-2 rounded-lg bg-brand-700 p-2.5 text-white">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <Brain className="h-3 w-3" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[7px] font-semibold uppercase tracking-wide text-brand-200">{dict.previewCbtExercise}</p>
              <p className="truncate text-[9px] font-semibold">{dict.previewCognitiveReframing}</p>
            </div>
            <ArrowRight className="h-3 w-3 shrink-0" strokeWidth={2} />
          </div>
          {[
            { cat: dict.previewArticle1Cat, title: dict.previewArticle1Title },
            { cat: dict.previewArticle2Cat, title: dict.previewArticle2Title },
          ].map((a) => (
            <div key={a.title} className="rounded-lg border border-brand-100 bg-white p-2.5">
              <p className="text-[7px] font-semibold uppercase tracking-wide text-brand-500">{a.cat}</p>
              <p className="mt-1 line-clamp-2 text-[9px] font-semibold leading-tight text-brand-900">{a.title}</p>
            </div>
          ))}
        </div>
      </PhoneFrame>
    </div>
  );
}

function PhoneFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mx-auto w-[220px] rounded-[28px] bg-brand-900 p-2 shadow-xl">
        <div className="relative h-[400px] overflow-hidden rounded-[20px] bg-white">
          <div className="absolute left-1/2 top-0 h-4 w-20 -translate-x-1/2 rounded-b-xl bg-brand-900" />
          {children}
        </div>
      </div>
      <p className="mt-3 text-center text-xs font-medium text-ink/50">{label}</p>
    </div>
  );
}
