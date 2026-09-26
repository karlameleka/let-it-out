"use client";

/** Device-only history of completed CBT exercises. Encrypted at rest with
 * AES-256-GCM, same model as the journal (local-journal.ts): a key is
 * generated on first use and stored non-extractable in this same
 * IndexedDB database, so nothing here is ever readable off-device or sent
 * to a server. Not scoped per account — these tools (grounding, gratitude,
 * next-step) are usable without being logged in, so this stays "whoever
 * uses this device" history, same as before this was encrypted. */

const DB_NAME = "lio-cbt-history";
const DB_VERSION = 1;
const ENTRIES_STORE = "entries";
const META_STORE = "meta";
const KEY_RECORD_ID = "encryption-key";
const MAX_ENTRIES = 50;

export type CbtExerciseType = "reframing" | "grounding" | "next-step" | "gratitude" | "thought-record";

export type CbtHistoryEntry = {
  id: string;
  type: CbtExerciseType;
  createdAt: string;
  summary: string;
  data: Record<string, string>;
};

type Payload = { summary: string; data: Record<string, string> };

type StoredEntry = {
  id: string;
  type: CbtExerciseType;
  createdAt: string;
  encPayload: { iv: string; data: string };
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
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

async function encryptPayload(key: CryptoKey, payload: Payload): Promise<{ iv: string; data: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(payload)));
  return { iv: bytesToBase64(iv), data: bytesToBase64(new Uint8Array(cipher)) };
}

async function decryptPayload(key: CryptoKey, enc: { iv: string; data: string }): Promise<Payload> {
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(enc.iv) },
    key,
    base64ToBytes(enc.data),
  );
  return JSON.parse(new TextDecoder().decode(plain)) as Payload;
}

async function decryptEntry(key: CryptoKey, stored: StoredEntry): Promise<CbtHistoryEntry> {
  const { summary, data } = await decryptPayload(key, stored.encPayload);
  return { id: stored.id, type: stored.type, createdAt: stored.createdAt, summary, data };
}

async function getAllStored(db: IDBDatabase): Promise<StoredEntry[]> {
  return tx<StoredEntry[]>(db, ENTRIES_STORE, "readonly", (s) => s.getAll());
}

export async function saveCbtEntry(input: { type: CbtExerciseType; summary: string; data: Record<string, string> }): Promise<void> {
  const db = await openDb();
  const key = await getKey(db);
  const stored: StoredEntry = {
    id: crypto.randomUUID(),
    type: input.type,
    createdAt: new Date().toISOString(),
    encPayload: await encryptPayload(key, { summary: input.summary, data: input.data }),
  };
  await tx(db, ENTRIES_STORE, "readwrite", (s) => s.put(stored));

  // Prune down to MAX_ENTRIES, oldest first, same cap as before this was
  // encrypted — this is device history, not meant to grow unbounded.
  const all = await getAllStored(db);
  if (all.length > MAX_ENTRIES) {
    all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const toRemove = all.slice(0, all.length - MAX_ENTRIES);
    await Promise.all(toRemove.map((e) => tx(db, ENTRIES_STORE, "readwrite", (s) => s.delete(e.id))));
  }
}

export async function getCbtHistory(): Promise<CbtHistoryEntry[]> {
  const db = await openDb();
  const key = await getKey(db);
  const stored = await getAllStored(db);
  stored.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return Promise.all(stored.map((s) => decryptEntry(key, s)));
}

export async function deleteCbtEntry(id: string): Promise<void> {
  const db = await openDb();
  await tx(db, ENTRIES_STORE, "readwrite", (s) => s.delete(id));
}

export async function clearCbtHistory(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}

export type DistortionFrequency = { label: string; count: number };

/** Tallies how often each thinking trap has been flagged across saved
 * Cognitive Reframing sessions — a lightweight "what am I struggling
 * with" signal, distinct from the streak. Reads the comma-separated
 * `distortions` field each reframing entry saves. */
export async function getDistortionFrequency(): Promise<DistortionFrequency[]> {
  const entries = await getCbtHistory();
  const counts = new Map<string, number>();
  for (const entry of entries) {
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
