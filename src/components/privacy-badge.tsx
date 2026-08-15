import { ShieldCheck } from "lucide-react";

export default function PrivacyBadge({ text, className = "" }: { text: string; className?: string }) {
  return (
    <p className={`flex items-start gap-1.5 text-xs text-ink/50 ${className}`}>
      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" strokeWidth={2} />
      {text}
    </p>
  );
}
