"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlus, Pencil, Star, X } from "lucide-react";
import {
  deleteEntry,
  getEntryDetail,
  toggleBookmark,
  updateEntry,
  type JournalEntryDetail,
} from "@/lib/local-journal";
import { compressImage } from "@/lib/compress-image";
import { moodColor, moodLabel } from "@/lib/moods";
import { Container, Button } from "@/components/ui";
import MoodPicker from "@/components/mood-picker";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

const PHOTO_PERMISSION_KEY = "lio_photo_access_granted";

export default function EntryDetailClient({
  userId,
  id,
  dict,
  entryFormDict,
  moodPickerDict,
  locale,
}: {
  userId: string;
  id: string;
  dict: Dictionary["entryDetail"];
  entryFormDict: Dictionary["entryForm"];
  moodPickerDict: Dictionary["moodPicker"];
  locale: Locale;
}) {
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntryDetail | null | undefined>(undefined);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editMoods, setEditMoods] = useState<string[]>([]);
  const [editPhoto, setEditPhoto] = useState<string | null>(null);
  const [editPhotoProcessing, setEditPhotoProcessing] = useState(false);
  const [editPhotoError, setEditPhotoError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [showPhotoPermission, setShowPhotoPermission] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getEntryDetail(userId, id).then(setEntry);
  }, [userId, id]);

  async function handleToggleBookmark() {
    if (!entry) return;
    setEntry({ ...entry, bookmarked: !entry.bookmarked });
    const result = await toggleBookmark(userId, id);
    if (!result.success) setEntry((prev) => (prev ? { ...prev, bookmarked: !prev.bookmarked } : prev));
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteEntry(userId, id);
    if (result.success) {
      router.push("/journal");
    } else {
      setDeleting(false);
    }
  }

  function startEdit() {
    if (!entry) return;
    setEditContent(entry.content);
    setEditMoods(entry.moods);
    setEditPhoto(entry.photoUrl);
    setEditPhotoError(null);
    setEditError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setEditPhotoError(null);
    setEditError(null);
  }

  async function handleSaveEdit() {
    const content = editContent.trim();
    if (!content) {
      setEditError(dict.editWriteSomethingError);
      return;
    }
    setEditSaving(true);
    setEditError(null);
    const result = await updateEntry(userId, id, { content, moods: editMoods, photoUrl: editPhoto });
    if (!result.success) {
      setEditSaving(false);
      setEditError(dict.editSaveError);
      return;
    }
    const fresh = await getEntryDetail(userId, id);
    setEntry(fresh);
    setEditSaving(false);
    setEditing(false);
  }

  function requestPhotoAccess() {
    if (window.localStorage.getItem(PHOTO_PERMISSION_KEY) === "1") {
      fileInputRef.current?.click();
    } else {
      setShowPhotoPermission(true);
    }
  }

  function allowPhotoAccess() {
    window.localStorage.setItem(PHOTO_PERMISSION_KEY, "1");
    setShowPhotoPermission(false);
    fileInputRef.current?.click();
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setEditPhotoError(entryFormDict.chooseImageError);
      return;
    }
    setEditPhotoError(null);
    setEditPhotoProcessing(true);
    try {
      setEditPhoto(await compressImage(file));
    } catch {
      setEditPhotoError(entryFormDict.photoProcessError);
    } finally {
      setEditPhotoProcessing(false);
    }
  }

  if (entry === undefined) return null;

  if (entry === null) {
    return (
      <Container className="max-w-3xl py-16 text-center sm:py-20">
        <p className="text-ink/60">{dict.notFound}</p>
        <Link href="/journal" className="mt-3 inline-block text-sm font-medium text-brand-600 link-grow">
          <span className="inline-block rtl:-scale-x-100">&larr;</span> {dict.backToEntries}
        </Link>
      </Container>
    );
  }

  return (
    <Container className="max-w-3xl py-16 sm:py-20">
      <Link href="/journal" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 link-grow">
        <span className="inline-block rtl:-scale-x-100">&larr;</span> {dict.backToEntries}
      </Link>

      <div className="mt-6 overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-[0_24px_50px_-32px_rgba(18,53,67,0.25)]">
        <div className="bg-gradient-to-b from-brand-50 to-white px-6 pt-6 pb-5 sm:px-8">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-brand-700">
              {new Date(entry.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              {entry.updatedAt !== entry.createdAt && (
                <span className="ms-2 text-xs font-normal text-ink/40">{dict.edited}</span>
              )}
            </p>
            {!editing && (
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={startEdit}
                  aria-label={dict.editThisEntry}
                  className="rounded-full p-1.5 text-ink/30 transition-colors hover:text-brand-600 active:text-brand-600"
                >
                  <Pencil className="h-4 w-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={handleToggleBookmark}
                  aria-label={entry.bookmarked ? dict.removeBookmark : dict.bookmarkThis}
                  className={`rounded-full p-1.5 transition-colors ${
                    entry.bookmarked ? "text-brand-600" : "text-ink/30 hover:text-ink/50 active:text-ink/50"
                  }`}
                >
                  <Star className="h-5 w-5" strokeWidth={2} fill={entry.bookmarked ? "currentColor" : "none"} />
                </button>
              </div>
            )}
          </div>

          {!editing && entry.moods.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {entry.moods.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-white py-1 pl-1 pr-3 text-xs font-medium text-brand-700 shadow-sm"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/10"
                    style={{ backgroundColor: moodColor(m) }}
                  />
                  {moodLabel(m, locale)}
                </span>
              ))}
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-4 px-6 py-7 sm:px-8">
            <div className="overflow-hidden rounded-xl border border-brand-200 bg-white focus-within:border-brand-500">
              <div className="border-b border-brand-100 bg-brand-50/50 p-4">
                <MoodPicker
                  moods={editMoods}
                  onChange={setEditMoods}
                  label={moodPickerDict.label}
                  hint={moodPickerDict.hint}
                  locale={locale}
                />
              </div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                required
                className="w-full border-0 px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">{entryFormDict.addPhotoLabel}</p>
              {editPhoto ? (
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element -- already-compressed data URI, no benefit from next/image's optimizer */}
                  <img src={editPhoto} alt="" className="h-28 w-28 rounded-xl border border-brand-200 object-cover" />
                  <button
                    type="button"
                    onClick={() => setEditPhoto(null)}
                    aria-label={entryFormDict.removePhoto}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink/60 shadow-md hover:text-ink active:text-ink"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={requestPhotoAccess}
                  disabled={editPhotoProcessing}
                  className="inline-flex items-center gap-2 rounded-xl border border-dashed border-brand-200 px-4 py-3 text-sm text-ink/60 transition-colors hover:border-brand-400 active:border-brand-400 hover:bg-brand-50 active:bg-brand-50 disabled:opacity-50"
                >
                  <ImagePlus className="h-4 w-4" strokeWidth={2} />
                  {editPhotoProcessing ? entryFormDict.processing : entryFormDict.addPhotoButton}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              {editPhotoError && <p className="mt-1.5 text-xs text-red-600">{editPhotoError}</p>}
            </div>

            {editError && <p className="text-sm text-red-600">{editError}</p>}

            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={handleSaveEdit} disabled={editSaving || editPhotoProcessing}>
                {editSaving ? dict.savingChanges : dict.saveChanges}
              </Button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={editSaving}
                className="rounded-full border border-brand-200 px-5 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:border-brand-300 active:border-brand-300 disabled:opacity-50"
              >
                {dict.cancel}
              </button>
            </div>

            {showPhotoPermission && (
              <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm">
                <div className="w-full max-w-xs animate-pop-in overflow-hidden rounded-2xl bg-white text-center shadow-2xl">
                  <div className="px-5 pt-6">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                      <ImagePlus className="h-6 w-6" strokeWidth={1.75} />
                    </span>
                    <p className="mt-3 font-display text-base font-semibold text-ink/90">{entryFormDict.photoPermissionTitle}</p>
                    <p className="mt-1.5 pb-5 text-sm text-ink/60">{entryFormDict.photoPermissionBody}</p>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-brand-100 border-t border-brand-100 text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => setShowPhotoPermission(false)}
                      className="py-3 text-ink/60 transition-colors hover:bg-brand-50 active:bg-brand-50"
                    >
                      {entryFormDict.dontAllow}
                    </button>
                    <button
                      type="button"
                      onClick={allowPhotoAccess}
                      className="py-3 text-brand-600 transition-colors hover:bg-brand-50 active:bg-brand-50"
                    >
                      {entryFormDict.allowAccess}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-7 sm:px-8">
            {entry.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- already-compressed data URI, no benefit from next/image's optimizer
              <img
                src={entry.photoUrl}
                alt=""
                className="mb-6 max-h-96 w-full rounded-2xl border border-brand-100 object-cover"
              />
            )}

            {entry.prompt && (
              <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                  {entry.prompt.category}
                </p>
                <p className="mt-1 font-display font-medium italic text-brand-900">{entry.prompt.text}</p>
              </div>
            )}

            <p className="mt-6 whitespace-pre-line font-display text-lg leading-[1.8] text-ink/80 sm:text-xl">
              {entry.content}
            </p>
          </div>
        )}

        {!editing && (
          <div className="border-t border-brand-50 px-6 py-3.5 sm:px-8">
            {!confirmingDelete ? (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="text-xs text-ink/30 transition-colors hover:text-red-500 active:text-red-500"
              >
                {dict.deleteEntry}
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="text-ink/50">{dict.deleteConfirm}</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="font-semibold text-red-600 transition-colors hover:text-red-700 active:text-red-700 disabled:opacity-50"
                >
                  {deleting ? dict.deleting : dict.delete}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                  className="text-ink/50 transition-colors hover:text-ink/70 active:text-ink/70 disabled:opacity-50"
                >
                  {dict.cancel}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  );
}
