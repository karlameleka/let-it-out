"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { hapticTap } from "@/lib/haptics";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function InviteFriendCard({
  link,
  qrDataUrl,
  friendsJoined,
  dict,
}: {
  link: string;
  qrDataUrl: string;
  friendsJoined: number;
  dict: Dictionary["account"];
}) {
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function handleShare() {
    hapticTap();
    const shareText = dict.inviteShareText;
    if (canShare) {
      try {
        await navigator.share({ title: dict.inviteShareTitle, text: shareText, url: link });
        return;
      } catch {
        // User cancelled the share sheet, or the browser refused — fall through to copy.
      }
    }
    handleCopy();
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op — the link is still visible/selectable to copy by hand
    }
  }

  return (
    <div>
      {friendsJoined > 0 && (
        <p className="mt-1 text-sm font-medium text-brand-600">
          {friendsJoined === 1 ? dict.inviteFriendJoinedOne : dict.inviteFriendsJoined.replace("{count}", String(friendsJoined))}
        </p>
      )}

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        {/* eslint-disable-next-line @next/next/no-img-element -- a data: URI QR code, no benefit from next/image's optimizer */}
        <img
          src={qrDataUrl}
          alt={dict.inviteQrAlt}
          width={140}
          height={140}
          className="h-[140px] w-[140px] shrink-0 rounded-xl border border-brand-100 bg-white p-2"
        />

        <div className="min-w-0 flex-1">
          <p className="break-all rounded-xl border border-brand-100 bg-brand-50 px-3 py-2.5 text-xs text-ink/60">
            {link}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              <Share2 className="h-4 w-4" strokeWidth={2} />
              {dict.inviteShareButton}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-4 py-2.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50"
            >
              {copied ? <Check className="h-4 w-4" strokeWidth={2} /> : <Copy className="h-4 w-4" strokeWidth={2} />}
              {copied ? dict.inviteLinkCopied : dict.inviteCopyLink}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
