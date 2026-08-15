"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { verifyJournalLock } from "@/lib/journal-actions";
import { Button } from "@/components/ui";

const UNLOCK_KEY = "lio_journal_unlocked";

/** Gates journal content behind a re-entered password each browser session
 * — mirrors Apple Journal's optional Face ID lock, and like that feature is
 * off by default (`enabled` reflects the user's account setting). Nothing
 * sensitive is fetched until this passes: pages using this gate fetch their
 * data client-side (after mount, inside the gated children), not in the
 * server-rendered initial page. */
export default function JournalLockGate({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<"checking" | "locked" | "unlocked">("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("unlocked");
      return;
    }
    const unlocked = window.sessionStorage.getItem(UNLOCK_KEY) === "1";
    setStatus(unlocked ? "unlocked" : "locked");
  }, [enabled]);

  async function handleUnlock(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await verifyJournalLock(password);
    setPending(false);
    if (result.success) {
      window.sessionStorage.setItem(UNLOCK_KEY, "1");
      setStatus("unlocked");
    } else {
      setError(result.error ?? "Incorrect password.");
    }
  }

  if (status === "checking") return null;

  if (status === "locked") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm rounded-3xl border-2 border-brand-100 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Lock className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <h1 className="mt-4 font-display text-xl font-semibold text-brand-900">Your journal is locked</h1>
          <p className="mt-1.5 text-sm text-ink/60">Enter your password to open it.</p>
          <form onSubmit={handleUnlock} className="mt-6 space-y-3 text-left">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              placeholder="Password"
              className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Unlocking…" : "Unlock"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/** Clears the unlock flag and reloads so the gate re-locks immediately —
 * used by the header's manual "Lock" button. */
export function relockJournal() {
  window.sessionStorage.removeItem(UNLOCK_KEY);
  window.location.reload();
}
