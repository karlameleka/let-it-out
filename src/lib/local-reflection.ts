"use client";

// Device-only reflection-sheet storage — same model as local-journal.ts:
// answers are encrypted with AES-256-GCM using a key generated on first use
// and stored (non-extractable) in this same IndexedDB database. Nothing
// here is ever sent to or stored on our servers, and no one at Let It Out
// (including the client's own therapist) can see these answers.

export type ReflectionAnswer = { questionId: string; questionText: string; answerText: string };

export type ReflectionEntry = {
  id: string;
  createdAt: string;
  answers: ReflectionAnswer[];
};

type StoredEntry = {
  id: string;
  encAnswers: { iv: string; data: string };
  createdAt: string;
};

const DB_VERSION = 1;
const ENTRIES_STORE = "entries";
const META_STORE = "meta";
const KEY_RECORD_ID = "encryption-key";

function dbName(userId: string) {
  return `lio-reflection-${userId}`;
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

async function decryptEntry(key: CryptoKey, stored: StoredEntry): Promise<ReflectionEntry> {
  const json = await decryptString(key, stored.encAnswers);
  return { id: stored.id, createdAt: stored.createdAt, answers: JSON.parse(json) as ReflectionAnswer[] };
}

export async function getReflectionEntries(userId: string): Promise<ReflectionEntry[]> {
  const db = await openDb(userId);
  const key = await getKey(db);
  const stored = await tx<StoredEntry[]>(db, ENTRIES_STORE, "readonly", (s) => s.getAll());
  stored.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return Promise.all(stored.map((s) => decryptEntry(key, s)));
}

// Answers snapshot the question text as it was shown at fill time (like
// journal entries snapshot their prompt) — so if an admin later edits or
// removes a question, past entries still show what was actually asked.
export async function createReflectionEntry(userId: string, answers: ReflectionAnswer[]): Promise<void> {
  const db = await openDb(userId);
  const key = await getKey(db);
  const stored: StoredEntry = {
    id: crypto.randomUUID(),
    encAnswers: await encryptString(key, JSON.stringify(answers)),
    createdAt: new Date().toISOString(),
  };
  await tx(db, ENTRIES_STORE, "readwrite", (s) => s.put(stored));
}

export async function deleteReflectionEntry(userId: string, id: string): Promise<void> {
  const db = await openDb(userId);
  await tx(db, ENTRIES_STORE, "readwrite", (s) => s.delete(id));
}

export async function exportReflectionEntries(userId: string): Promise<ReflectionEntry[]> {
  return getReflectionEntries(userId);
}

export async function clearAllReflectionEntries(userId: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(dbName(userId));
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}
