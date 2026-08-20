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
