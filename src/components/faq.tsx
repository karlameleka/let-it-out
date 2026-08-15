import { motionEase } from "@/components/ui";

export type FaqItem = { question: string; answer: string };

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3.5">
      {items.map((item) => (
        <details
          key={item.question}
          className={`group rounded-3xl border border-brand-900/10 bg-white/75 px-6 py-5 shadow-glass backdrop-blur-md ${motionEase} hover:border-brand-300/70 hover:shadow-ambient open:border-brand-300/70 open:shadow-ambient`}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-5 rounded-lg font-display font-semibold tracking-tight text-brand-900 marker:content-['']">
            {item.question}
            <span
              aria-hidden="true"
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand-900/10 bg-brand-50 text-lg leading-none text-brand-500 ${motionEase} group-open:rotate-45 group-open:bg-brand-100`}
            >
              +
            </span>
          </summary>
          <p className="mt-4 text-sm leading-[1.75] text-ink-body">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
