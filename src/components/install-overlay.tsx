"use client";

import { useRouter } from "next/navigation";
import InstallCard from "@/components/install-card";

export default function InstallOverlay({ initialOpen }: { initialOpen: boolean }) {
  const router = useRouter();

  if (!initialOpen) return null;

  function close() {
    router.replace("/", { scroll: false });
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/50 p-4 backdrop-blur-sm sm:items-center">
      <div className="relative w-full max-w-md animate-pop-in">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink/50 shadow-md hover:text-ink active:text-ink"
        >
          ✕
        </button>
        <InstallCard />
      </div>
    </div>
  );
}
