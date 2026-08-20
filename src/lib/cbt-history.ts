"use client";

/** Device-only history of completed CBT exercises. Kept in localStorage
 * (not IndexedDB/encrypted like the journal) since these tools don't
 * require an account — anyone can use them, logged in or not. Nothing here
 * is ever sent to a server. */

const HISTORY_KEY = "lio_cbt_history";
const MAX_ENTRIES = 50;

export type CbtExerciseType = "reframing" | "grounding" | "next-step";

export type CbtHistoryEntry = {
  id: string;
  type: CbtExerciseType;
  createdAt: string;
  summary: string;
  data: Record<string, string>;
};

function readAll(): CbtHistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as CbtHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function writeAll(entries: CbtHistoryEntry[]) {
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function saveCbtEntry(input: { type: CbtExerciseType; summary: string; data: Record<string, string> }): void {
  const entries = readAll();
  entries.unshift({
    id: crypto.randomUUID(),
    type: input.type,
    createdAt: new Date().toISOString(),
    summary: input.summary,
    data: input.data,
  });
  writeAll(entries);
}

export function getCbtHistory(): CbtHistoryEntry[] {
  return readAll();
}

export function deleteCbtEntry(id: string): void {
  writeAll(readAll().filter((e) => e.id !== id));
}

export function clearCbtHistory(): void {
  window.localStorage.removeItem(HISTORY_KEY);
}

export type DistortionFrequency = { label: string; count: number };

/** Tallies how often each thinking trap has been flagged across saved
 * Cognitive Reframing sessions — a lightweight "what am I struggling
 * with" signal, distinct from the streak. Reads the comma-separated
 * `distortions` field each reframing entry saves. */
export function getDistortionFrequency(): DistortionFrequency[] {
  const counts = new Map<string, number>();
  for (const entry of readAll()) {
    if (entry.type !== "reframing") continue;
    const raw = entry.data.distortions;
    if (!raw) continue;
    for (const label of raw.split(",").map((s) => s.trim()).filter(Boolean)) {
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}
