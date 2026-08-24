"use client";

import { useOffline } from "next/offline";
import { WifiOff } from "lucide-react";

export default function OfflineBanner({ message }: { message: string }) {
  const isOffline = useOffline();

  if (!isOffline) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-brand-900 px-4 py-2 text-center text-xs font-medium text-white"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      {message}
    </div>
  );
}
