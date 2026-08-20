"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, MessageCircle, Phone, HelpCircle } from "lucide-react";
import { QuestionMarkIcon } from "@/components/lio-icons";
import type { Dictionary } from "@/lib/i18n/dictionary";

const WHATSAPP_URL = "https://api.whatsapp.com/send?phone=201288200533";

export default function HelpButton({ dict }: { dict: Dictionary["helpButton"] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-24 end-5 z-50 md:bottom-5">
      {open && (
        <div className="animate-pop-in absolute bottom-[calc(100%+0.75rem)] end-0 w-72 rounded-2xl border-2 border-brand-100 bg-white p-5 shadow-xl">
          <p className="font-display font-semibold text-brand-900">{dict.heading}</p>
          <p className="mt-1 text-sm text-ink/60">{dict.subheading}</p>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50/60 p-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-brand-600">
              <Phone className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <span>
              <span className="block text-xs font-medium text-ink/50">{dict.crisisLabel}</span>
              <a href="tel:16328" className="text-sm font-semibold text-brand-800 hover:underline active:underline">
                {dict.crisisHotline}
              </a>
            </span>
          </div>

          <div className="mt-3 space-y-2">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-brand-100 p-3 transition-colors hover:bg-brand-50 active:bg-brand-50"
            >
              <MessageCircle className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={2} />
              <span>
                <span className="block text-sm font-medium text-ink/80">{dict.whatsapp}</span>
                <span className="block text-xs text-ink/50">{dict.whatsappDescription}</span>
              </span>
            </a>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl border border-brand-100 p-3 transition-colors hover:bg-brand-50 active:bg-brand-50"
            >
              <Phone className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={2} />
              <span>
                <span className="block text-sm font-medium text-ink/80">{dict.contactUs}</span>
                <span className="block text-xs text-ink/50">{dict.contactDescription}</span>
              </span>
            </Link>
            <Link
              href="/counseling#faq"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl border border-brand-100 p-3 transition-colors hover:bg-brand-50 active:bg-brand-50"
            >
              <HelpCircle className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={2} />
              <span>
                <span className="block text-sm font-medium text-ink/80">{dict.faq}</span>
                <span className="block text-xs text-ink/50">{dict.faqDescription}</span>
              </span>
            </Link>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={dict.openLabel}
        aria-expanded={open}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg transition-all hover:bg-brand-600 active:bg-brand-600 hover:-translate-y-0.5 active:-translate-y-0.5"
      >
        {open ? <X className="h-6 w-6" strokeWidth={2} /> : <QuestionMarkIcon className="h-6 w-6" />}
      </button>
    </div>
  );
}
