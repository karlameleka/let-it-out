"use client";

import { MOODS } from "@/lib/moods";

// Device-only journal storage. Entries never leave the browser: content and
// any attached photo are encrypted with AES-256-GCM using a key that is
// generated on first use and stored (non-extractable) in this same
// IndexedDB database — nothing here is ever sent to our servers. Metadata
// needed for sorting/filtering (mood, timestamps, bookmark flag) is kept in
// the clear since it isn't freeform personal writing.
//
// One legacy exception: entries written before this device-only model
// shipped live in our database. `migrateFromServer` copies those in once
// (encrypted, same as everything else) without deleting the server copies,
// so nothing a user already wrote appears to vanish.

export type JournalPrompt = { category: string; text: string } | null;

export type JournalFeedEntry = {
  id: string;
  content: string;
  moods: string[];
  bookmarked: boolean;
  photoUrl: string | null;
  createdAt: string;
  prompt: JournalPrompt;
};

export type JournalStats = { total: number; streak: number; totalWords: number };

export type JournalFeedData = { entries: JournalFeedEntry[]; stats: JournalStats };

export type JournalEntryDetail = JournalFeedEntry;

export type JournalExportEntry = JournalFeedEntry & { updatedAt: string };

export type JournalExportData = { exportedAt: string; entries: JournalExportEntry[] };

export type EntryFormState = { error?: string; success?: boolean } | undefined;

export type MoodPatterns = {
  frequency: { id: string; label: string; color: string; count: number; percent: number }[];
  topMood: { id: string; label: string; color: string; count: number } | null;
  totalWithMood: number;
  heatmap: { date: string; moods: string[] }[];
};

type StoredEntry = {
  id: string;
  encContent: { iv: string; data: string };
  encPhoto: { iv: string; data: string } | null;
  // Legacy entries (written before multi-mood support) stored a single
  // string here; new entries always store an array. Normalized on read via
  // normalizeMoods() so both shapes coexist in the same object store.
  mood: string[] | string | null;
  bookmarked: boolean;
  createdAt: string;
  updatedAt: string;
  prompt: JournalPrompt;
};

function normalizeMoods(raw: string[] | string | null | undefined): string[] {
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

const DB_VERSION = 1;
const ENTRIES_STORE = "entries";
const META_STORE = "meta";
const KEY_RECORD_ID = "encryption-key";
const MIGRATION_RECORD_ID = "server-migration";

function dbName(userId: string) {
  return `lio-journal-${userId}`;
}

function openDb(userId: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName(userId), DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(ENTRIES_STORE)) {
        db.createObjectStore(ENTRIES_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(db: IDBDatabase, store: string, mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const request = run(t.objectStore(store));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getKey(db: IDBDatabase): Promise<CryptoKey> {
  const existing = await tx<{ id: string; key: CryptoKey } | undefined>(db, META_STORE, "readonly", (s) => s.get(KEY_RECORD_ID));
  if (existing) return existing.key;

  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  await tx(db, META_STORE, "readwrite", (s) => s.put({ id: KEY_RECORD_ID, key }));
  return key;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function encryptString(key: CryptoKey, plaintext: string): Promise<{ iv: string; data: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plaintext));
  return { iv: bytesToBase64(iv), data: bytesToBase64(new Uint8Array(cipher)) };
}

async function decryptString(key: CryptoKey, enc: { iv: string; data: string }): Promise<string> {
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(enc.iv) },
    key,
    base64ToBytes(enc.data),
  );
  return new TextDecoder().decode(plain);
}

async function decryptEntry(key: CryptoKey, stored: StoredEntry): Promise<JournalFeedEntry> {
  const [content, photoUrl] = await Promise.all([
    decryptString(key, stored.encContent),
    stored.encPhoto ? decryptString(key, stored.encPhoto) : Promise.resolve(null),
  ]);
  return {
    id: stored.id,
    content,
    moods: normalizeMoods(stored.mood),
    bookmarked: stored.bookmarked,
    photoUrl,
    createdAt: stored.createdAt,
    prompt: stored.prompt,
  };
}

async function getAllStored(db: IDBDatabase): Promise<StoredEntry[]> {
  return tx<StoredEntry[]>(db, ENTRIES_STORE, "readonly", (s) => s.getAll());
}

function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function computeStats(entries: { createdAt: string; content: string }[]): JournalStats {
  const days = new Set(entries.map((e) => e.createdAt.slice(0, 10)));
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  const totalWords = entries.reduce((sum, e) => sum + wordCount(e.content), 0);
  return { total: entries.length, streak, totalWords };
}

export async function getFeedData(userId: string): Promise<JournalFeedData> {
  const db = await openDb(userId);
  const key = await getKey(db);
  const stored = await getAllStored(db);
  stored.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const entries = await Promise.all(stored.map((s) => decryptEntry(key, s)));
  return { entries, stats: computeStats(entries) };
}

export async function getEntryDetail(userId: string, id: string): Promise<JournalEntryDetail | null> {
  const db = await openDb(userId);
  const stored = await tx<StoredEntry | undefined>(db, ENTRIES_STORE, "readonly", (s) => s.get(id));
  if (!stored) return null;
  const key = await getKey(db);
  return decryptEntry(key, stored);
}

export async function createEntry(
  userId: string,
  input: { content: string; moods: string[]; photoUrl: string | null; prompt: JournalPrompt },
): Promise<void> {
  const db = await openDb(userId);
  const key = await getKey(db);
  const now = new Date().toISOString();
  const stored: StoredEntry = {
    id: crypto.randomUUID(),
    encContent: await encryptString(key, input.content),
    encPhoto: input.photoUrl ? await encryptString(key, input.photoUrl) : null,
    mood: input.moods,
    bookmarked: false,
    createdAt: now,
    updatedAt: now,
    prompt: input.prompt,
  };
  await tx(db, ENTRIES_STORE, "readwrite", (s) => s.put(stored));
}

export async function toggleBookmark(userId: string, id: string): Promise<{ success: boolean; bookmarked?: boolean }> {
  const db = await openDb(userId);
  const stored = await tx<StoredEntry | undefined>(db, ENTRIES_STORE, "readonly", (s) => s.get(id));
  if (!stored) return { success: false };
  stored.bookmarked = !stored.bookmarked;
  stored.updatedAt = new Date().toISOString();
  await tx(db, ENTRIES_STORE, "readwrite", (s) => s.put(stored));
  return { success: true, bookmarked: stored.bookmarked };
}

export async function deleteEntry(userId: string, id: string): Promise<{ success: boolean }> {
  const db = await openDb(userId);
  await tx(db, ENTRIES_STORE, "readwrite", (s) => s.delete(id));
  return { success: true };
}

export async function exportEntries(userId: string): Promise<JournalExportData> {
  const db = await openDb(userId);
  const key = await getKey(db);
  const stored = await getAllStored(db);
  stored.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const entries = await Promise.all(
    stored.map(async (s) => ({ ...(await decryptEntry(key, s)), updatedAt: s.updatedAt })),
  );
  return { exportedAt: new Date().toISOString(), entries };
}

export async function clearAllEntries(userId: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(dbName(userId));
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}

/** Shape of entries as they were written by the old server-side journal
 * (single `mood` string, pre-multi-select) — kept distinct from the local
 * `JournalExportEntry` type above, which now carries `moods: string[]`. */
type LegacyServerEntry = {
  id: string;
  content: string;
  mood: string | null;
  bookmarked: boolean;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  prompt: JournalPrompt;
};

/** Copies entries the server still has (written before device-only storage
 * shipped) into local storage, once. Never deletes the server-side rows —
 * they stay as a backup. Safe to call on every load; it no-ops after the
 * first successful run. */
export async function migrateFromServer(
  userId: string,
  fetchServerEntries: () => Promise<LegacyServerEntry[]>,
): Promise<void> {
  const db = await openDb(userId);
  const done = await tx<{ id: string } | undefined>(db, META_STORE, "readonly", (s) => s.get(MIGRATION_RECORD_ID));
  if (done) return;

  const serverEntries = await fetchServerEntries();
  const key = await getKey(db);
  for (const e of serverEntries) {
    const stored: StoredEntry = {
      id: e.id,
      encContent: await encryptString(key, e.content),
      encPhoto: e.photoUrl ? await encryptString(key, e.photoUrl) : null,
      mood: e.mood ? [e.mood] : [],
      bookmarked: e.bookmarked,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      prompt: e.prompt,
    };
    // Never overwrite an entry that already exists locally (e.g. migration
    // partially ran before) — first write wins.
    await tx(db, ENTRIES_STORE, "readwrite", (s) => s.add(stored)).catch(() => {});
  }
  await tx(db, META_STORE, "readwrite", (s) => s.put({ id: MIGRATION_RECORD_ID }));
}

const HEATMAP_WEEKS = 12;

export async function getMoodPatterns(userId: string): Promise<MoodPatterns> {
  const db = await openDb(userId);
  const stored = await getAllStored(db);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - (HEATMAP_WEEKS * 7 - 1));
  start.setDate(start.getDate() - start.getDay());

  const inRange = stored.filter((e) => new Date(e.createdAt) >= start);
  const moodsByDate = new Map<string, string[]>();
  const counts = new Map<string, number>();
  for (const e of inRange) {
    const moods = normalizeMoods(e.mood);
    if (moods.length === 0) continue;
    const key = e.createdAt.slice(0, 10);
    const existing = moodsByDate.get(key);
    if (existing) existing.push(...moods);
    else moodsByDate.set(key, [...moods]);
    for (const m of moods) counts.set(m, (counts.get(m) ?? 0) + 1);
  }
  const totalWithMood = [...counts.values()].reduce((a, b) => a + b, 0);

  const frequency = MOODS.map((m) => ({
    id: m.id,
    label: m.label,
    color: m.color,
    count: counts.get(m.id) ?? 0,
    percent: totalWithMood > 0 ? Math.round(((counts.get(m.id) ?? 0) / totalWithMood) * 100) : 0,
  }))
    .filter((m) => m.count > 0)
    .sort((a, b) => b.count - a.count);

  const topMood = frequency[0]
    ? { id: frequency[0].id, label: frequency[0].label, color: frequency[0].color, count: frequency[0].count }
    : null;

  const heatmap: MoodPatterns["heatmap"] = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const key = cursor.toISOString().slice(0, 10);
    heatmap.push({ date: key, moods: moodsByDate.get(key) ?? [] });
    cursor.setDate(cursor.getDate() + 1);
  }

  return { frequency, topMood, totalWithMood, heatmap };
}
