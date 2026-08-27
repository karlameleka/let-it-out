"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import {
  createReflectionEntry,
  deleteReflectionEntry,
  getReflectionEntries,
  type ReflectionEntry,
} from "@/lib/local-reflection";
import type { ReflectionQuestion } from "@/lib/reflection-sheet-config";
import { Button } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/dictionary";

const textareaClasses =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500";

export default function ReflectionClient({
  userId,
  questions,
  dict,
}: {
  userId: string;
  questions: ReflectionQuestion[];
  dict: Dictionary["reflectionSheet"];
}) {
  const [entries, setEntries] = useState<ReflectionEntry[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getReflectionEntries(userId).then(setEntries);
  }, [userId]);

  const hasContent = Object.values(answers).some((v) => v.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasContent) return;
    setSaving(true);
    setError(null);
    try {
      const filled = questions
        .filter((q) => (answers[q.id] ?? "").trim())
        .map((q) => ({ questionId: q.id, questionText: q.text, answerText: answers[q.id].trim() }));
      await createReflectionEntry(userId, filled);
      setAnswers({});
      setCelebration(dict.savedCelebration);
      setEntries(await getReflectionEntries(userId));
      setTimeout(() => setCelebration(null), 3000);
    } catch {
      setError(dict.saveError);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteReflectionEntry(userId, id);
    setEntries((prev) => prev?.filter((e) => e.id !== id) ?? prev);
    setDeletingId(null);
    if (openId === id) setOpenId(null);
  }

  return (
    <div className="space-y-10">
      <form onSubmit={handleSubmit} className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-brand-900">{dict.newReflection}</h2>
        {questions.map((q) => (
          <div key={q.id}>
            <label className="mb-1.5 block text-sm font-medium text-ink/80" htmlFor={`q-${q.id}`}>
              {q.text}
            </label>
            <textarea
              id={`q-${q.id}`}
              rows={3}
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
              className={textareaClasses}
            />
          </div>
        ))}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {celebration && <p className="text-sm text-brand-700">{celebration}</p>}

        <Button type="submit" disabled={saving || !hasContent}>
          {saving ? dict.saving : dict.submit}
        </Button>
      </form>

      <div>
        <h2 className="font-display text-lg font-semibold text-brand-900">{dict.history}</h2>
        {entries === null ? null : entries.length === 0 ? (
          <p className="mt-3 text-sm text-ink/50">{dict.emptyNoEntries}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {entries.map((entry) => {
              const isOpen = openId === entry.id;
              const dateLabel = new Date(entry.createdAt).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              return (
                <li key={entry.id} className="rounded-2xl border border-brand-100 bg-white">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : entry.id)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                  >
                    <span className="text-sm font-medium text-ink/80">{dateLabel}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-ink/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      strokeWidth={2}
                    />
                  </button>
                  {isOpen && (
                    <div className="space-y-4 border-t border-brand-100 px-5 py-4">
                      {entry.answers.map((a, i) => (
                        <div key={i}>
                          <p className="text-xs font-medium uppercase tracking-wide text-brand-500">{a.questionText}</p>
                          <p className="mt-1 whitespace-pre-line text-sm text-ink/80">{a.answerText}</p>
                        </div>
                      ))}
                      {confirmingDeleteId === entry.id ? (
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <span className="text-ink/50">{dict.deleteConfirm}</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(entry.id)}
                            disabled={deletingId === entry.id}
                            className="font-semibold text-red-600 transition-colors hover:text-red-700 active:text-red-700 disabled:opacity-50"
                          >
                            {deletingId === entry.id ? dict.deleting : dict.deleteEntry}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingDeleteId(null)}
                            className="text-ink/50 transition-colors hover:text-ink/70 active:text-ink/70"
                          >
                            {dict.cancel}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmingDeleteId(entry.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:underline"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                          {dict.deleteEntry}
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
