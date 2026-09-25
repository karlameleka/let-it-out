"use client";

// Device-only storage for the QR-only self-assessment results (see
// src/app/qr/*) — same model as local-reflection.ts: answers are encrypted
// with AES-256-GCM using a key generated on first use and stored
// (non-extractable) in this same IndexedDB database. Nothing here is ever
// sent to or stored on our servers.

import type { AssessmentSlug } from "@/lib/assessments";

export type AssessmentAnswer = { questionId: string; value: number };

export type AssessmentResultRecord = {
  id: string;
  slug: AssessmentSlug;
  createdAt: string;
  answers: AssessmentAnswer[];
};

type StoredEntry = {
  id: string;
  slug: AssessmentSlug;
  encAnswers: { iv: string; data: string };
  createdAt: string;
};

const DB_VERSION = 1;
const ENTRIES_STORE = "entries";
const META_STORE = "meta";
const KEY_RECORD_ID = "encryption-key";

function dbName(userId: string) {
  return `lio-assessments-${userId}`;
}

// Cached per user rather than opened fresh on every call — see the same
// fix (and the full explanation) in local-journal.ts's openDb. Without
// this, every page visit leaked another open IndexedDB connection, and
// WebKit in particular starts hanging on indexedDB.open() once enough of
// them pile up in one tab.
const dbConnections = new Map<string, Promise<IDBDatabase>>();

function openDb(userId: string): Promise<IDBDatabase> {
  const cached = dbConnections.get(userId);
  if (cached) return cached;

  const promise = new Promise<IDBDatabase>((resolve, reject) => {
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
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => {
        db.close();
        dbConnections.delete(userId);
      };
      resolve(db);
    };
    req.onerror = () => {
      dbConnections.delete(userId);
      reject(req.error);
    };
  });
  dbConnections.set(userId, promise);
  return promise;
}

function tx<T>(db: IDBDatabase, store: string, mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const request = run(t.objectStore(store));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const keyCache = new WeakMap<IDBDatabase, Promise<CryptoKey>>();

function getKey(db: IDBDatabase): Promise<CryptoKey> {
  const cached = keyCache.get(db);
  if (cached) return cached;

  const promise = (async () => {
    const existing = await tx<{ id: string; key: CryptoKey } | undefined>(db, META_STORE, "readonly", (s) => s.get(KEY_RECORD_ID));
    if (existing) return existing.key;

    const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    await tx(db, META_STORE, "readwrite", (s) => s.put({ id: KEY_RECORD_ID, key }));
    return key;
  })();
  keyCache.set(db, promise);
  return promise;
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

async function decryptEntry(key: CryptoKey, stored: StoredEntry): Promise<AssessmentResultRecord> {
  const json = await decryptString(key, stored.encAnswers);
  return { id: stored.id, slug: stored.slug, createdAt: stored.createdAt, answers: JSON.parse(json) as AssessmentAnswer[] };
}

/** All past results for one assessment (e.g. "love-languages"), newest
 * first — the single object store holds every assessment type, filtered
 * by slug here rather than split across separate databases. */
export async function getAssessmentResults(userId: string, slug: AssessmentSlug): Promise<AssessmentResultRecord[]> {
  const db = await openDb(userId);
  const key = await getKey(db);
  const stored = await tx<StoredEntry[]>(db, ENTRIES_STORE, "readonly", (s) => s.getAll());
  const matching = stored.filter((s) => s.slug === slug).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return Promise.all(matching.map((s) => decryptEntry(key, s)));
}

export async function createAssessmentResult(
  userId: string,
  slug: AssessmentSlug,
  answers: AssessmentAnswer[],
): Promise<void> {
  const db = await openDb(userId);
  const key = await getKey(db);
  const stored: StoredEntry = {
    id: crypto.randomUUID(),
    slug,
    encAnswers: await encryptString(key, JSON.stringify(answers)),
    createdAt: new Date().toISOString(),
  };
  await tx(db, ENTRIES_STORE, "readwrite", (s) => s.put(stored));
}

export async function deleteAssessmentResult(userId: string, id: string): Promise<void> {
  const db = await openDb(userId);
  await tx(db, ENTRIES_STORE, "readwrite", (s) => s.delete(id));
}

/** Every result across every assessment type, for the account data export. */
export async function exportAssessmentResults(userId: string): Promise<AssessmentResultRecord[]> {
  const db = await openDb(userId);
  const key = await getKey(db);
  const stored = await tx<StoredEntry[]>(db, ENTRIES_STORE, "readonly", (s) => s.getAll());
  stored.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return Promise.all(stored.map((s) => decryptEntry(key, s)));
}

export async function clearAllAssessmentResults(userId: string): Promise<void> {
  // Close the cached connection first — see the same fix in
  // local-journal.ts's clearAllEntries for why deleteDatabase() would
  // otherwise hang behind it indefinitely.
  const cached = dbConnections.get(userId);
  dbConnections.delete(userId);
  if (cached) {
    const db = await cached.catch(() => null);
    db?.close();
  }

  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(dbName(userId));
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}
