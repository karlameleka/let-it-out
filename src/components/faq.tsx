export type FaqItem = { question: string; answer: string };

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="group rounded-2xl border-2 border-brand-100 bg-white p-5 open:border-brand-300"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display font-semibold text-brand-900 [&::-webkit-details-marker]:hidden [&::marker]:hidden">
            {item.question}
            <span className="shrink-0 text-xl leading-none text-brand-400 transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
