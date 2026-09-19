"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Share, SquarePlus, Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui";
import { useInstallPrompt } from "@/lib/use-install-prompt";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function InstallCard({ dict }: { dict: Dictionary["install"] }) {
  const router = useRouter();
  const { ready, installed, iOS, canPromptInstall, promptInstall } = useInstallPrompt();

  if (!ready) return null;

  if (installed) {
    return (
      <div className="rounded-3xl border-2 border-brand-100 bg-white p-6 text-center shadow-sm sm:p-8">
        <CheckCircle2 className="mx-auto h-10 w-10 text-brand-600" strokeWidth={1.75} />
        <h2 className="mt-3 font-display text-xl font-semibold text-brand-900">{dict.alreadyInstalledTitle}</h2>
        <p className="mt-2 text-sm text-ink/60">{dict.alreadyInstalledBody}</p>
        <Button onClick={() => router.push("/")} className="mt-6 w-full">
          {dict.openApp}
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border-2 border-brand-100 bg-white shadow-sm">
      <div className="flex flex-col items-center gap-3 bg-brand-700 px-6 py-8 text-center text-white sm:py-10">
        <Image
          src="/brand/icon-192.png"
          alt=""
          width={72}
          height={72}
          className="rounded-2xl shadow-lg"
        />
        <h2 className="font-display text-xl font-semibold sm:text-2xl">{dict.addToHomeScreenTitle}</h2>
        <p className="max-w-sm text-sm text-brand-100/80">{dict.addToHomeScreenBody}</p>
      </div>

      <div className="p-6 sm:p-8">
        {canPromptInstall && (
          <Button onClick={promptInstall} className="w-full">
            <Download className="h-4 w-4" strokeWidth={2} />
            {dict.installApp}
          </Button>
        )}

        {iOS && (
          <div className={canPromptInstall ? "mt-6 border-t border-brand-100 pt-6" : ""}>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{dict.onIphoneIpad}</p>
            <ol className="mt-3 space-y-3">
              <li className="flex items-start gap-3 text-sm text-ink/75">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Share className="h-4 w-4" strokeWidth={2} />
                </span>
                <span>
                  {dict.iosStep1Prefix} <span className="font-medium text-ink/90">{dict.iosStep1Bold}</span>{" "}
                  {dict.iosStep1Suffix}
                </span>
              </li>
              <li className="flex items-start gap-3 text-sm text-ink/75">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <SquarePlus className="h-4 w-4" strokeWidth={2} />
                </span>
                <span>
                  {dict.iosStep2Prefix}{" "}
                  <span className="font-medium text-ink/90">{dict.iosStep2Bold}</span>.
                </span>
              </li>
            </ol>
          </div>
        )}

        {!canPromptInstall && !iOS && <p className="text-sm text-ink/60">{dict.unsupportedBrowser}</p>}
      </div>
    </div>
  );
}
