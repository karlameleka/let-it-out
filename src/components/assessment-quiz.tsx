"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import {
  createAssessmentResult,
  deleteAssessmentResult,
  getAssessmentResults,
  type AssessmentResultRecord,
} from "@/lib/local-assessments";
import { scoreAssessment, type AssessmentDefinition, type CategoryScore } from "@/lib/assessments";
import { Button } from "@/components/ui";

const SCALE = [1, 2, 3, 4, 5] as const;

function ResultBars({ scores, highlightTop = true }: { scores: CategoryScore[]; highlightTop?: boolean }) {
  const topAverage = scores[0]?.average ?? 0;
  return (
    <div className="space-y-4">
      {scores.map((score, i) => {
        const isTop = highlightTop && score.average === topAverage && i === 0;
        return (
          <div key={score.categoryId}>
            <div className="flex items-baseline justify-between gap-3">
              <p className={`text-sm font-semibold ${isTop ? "text-brand-800" : "text-ink/70"}`}>
                {score.label}
                {isTop && <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">Top</span>}
              </p>
              <p className="shrink-0 text-xs font-medium text-ink/40">{score.percent}%</p>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-brand-50">
              <div
                className={`h-full rounded-full ${isTop ? "bg-brand-600" : "bg-brand-300"}`}
                style={{ width: `${Math.max(4, score.percent)}%` }}
              />
            </div>
            {isTop && <p className="mt-1.5 text-sm text-ink/60">{score.description}</p>}
          </div>
        );
      })}
    </div>
  );
}

export default function AssessmentQuiz({ definition, userId }: { definition: AssessmentDefinition; userId: string }) {
  const [results, setResults] = useState<AssessmentResultRecord[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [latestScore, setLatestScore] = useState<CategoryScore[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getAssessmentResults(userId, definition.slug).then(setResults);
  }, [userId, definition.slug]);

  const answeredCount = definition.questions.filter((q) => typeof answers[q.id] === "number").length;
  const complete = answeredCount === definition.questions.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!complete) return;
    setSaving(true);
    setError(null);
    try {
      const score = scoreAssessment(definition, answers);
      const answerList = definition.questions.map((q) => ({ questionId: q.id, value: answers[q.id] }));
      await createAssessmentResult(userId, definition.slug, answerList);
      setLatestScore(score);
      setResults(await getAssessmentResults(userId, definition.slug));
    } catch {
      setError("Something went wrong saving your result. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleRetake() {
    setAnswers({});
    setLatestScore(null);
    setError(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteAssessmentResult(userId, id);
    setResults((prev) => prev?.filter((r) => r.id !== id) ?? prev);
    setDeletingId(null);
    if (openId === id) setOpenId(null);
  }

  if (latestScore) {
    return (
      <div className="space-y-8">
        <div className="rounded-2xl border border-brand-100 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-brand-900">Your results</h2>
          <p className="mt-1 text-sm text-ink/60">Saved to your journal — only visible to you.</p>
          <div className="mt-5">
            <ResultBars scores={latestScore} />
          </div>
        </div>
        <p className="text-xs text-ink/45">{definition.disclaimer}</p>
        <Button type="button" variant="outline" onClick={handleRetake}>
          Retake the assessment
        </Button>

        {results && results.length > 0 && (
          <PastResults
            definition={definition}
            results={results}
            openId={openId}
            setOpenId={setOpenId}
            confirmingDeleteId={confirmingDeleteId}
            setConfirmingDeleteId={setConfirmingDeleteId}
            deletingId={deletingId}
            onDelete={handleDelete}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          {definition.questions.map((q, i) => (
            <div key={q.id} className="rounded-2xl border border-brand-100 bg-white p-5">
              <p className="text-sm font-medium text-ink/80">
                <span className="mr-1.5 text-ink/30">{i + 1}.</span>
                {q.text}
              </p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="w-16 shrink-0 text-[11px] leading-tight text-ink/40">{definition.scaleLow}</span>
                <div className="flex flex-1 justify-center gap-2">
                  {SCALE.map((v) => {
                    const active = answers[q.id] === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        aria-label={`${v} — ${q.text}`}
                        aria-pressed={active}
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: v }))}
                        className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
                          active
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-brand-200 text-ink/60 hover:border-brand-400"
                        }`}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
                <span className="w-16 shrink-0 text-right text-[11px] leading-tight text-ink/40">{definition.scaleHigh}</span>
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={!complete || saving}>
            {saving ? "Saving…" : "See my results"}
          </Button>
          <span className="text-xs text-ink/45">
            {answeredCount} of {definition.questions.length} answered
          </span>
        </div>
      </form>

      {results && results.length > 0 && (
        <PastResults
          definition={definition}
          results={results}
          openId={openId}
          setOpenId={setOpenId}
          confirmingDeleteId={confirmingDeleteId}
          setConfirmingDeleteId={setConfirmingDeleteId}
          deletingId={deletingId}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function PastResults({
  definition,
  results,
  openId,
  setOpenId,
  confirmingDeleteId,
  setConfirmingDeleteId,
  deletingId,
  onDelete,
}: {
  definition: AssessmentDefinition;
  results: AssessmentResultRecord[];
  openId: string | null;
  setOpenId: (id: string | null) => void;
  confirmingDeleteId: string | null;
  setConfirmingDeleteId: (id: string | null) => void;
  deletingId: string | null;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-brand-900">Past results</h2>
      <ul className="mt-4 space-y-3">
        {results.map((entry) => {
          const isOpen = openId === entry.id;
          const answersMap = Object.fromEntries(entry.answers.map((a) => [a.questionId, a.value]));
          const score = scoreAssessment(definition, answersMap);
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
                <span className="text-sm font-medium text-ink/80">
                  {dateLabel} — top: {score[0]?.label}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-ink/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  strokeWidth={2}
                />
              </button>
              {isOpen && (
                <div className="space-y-4 border-t border-brand-100 px-5 py-4">
                  <ResultBars scores={score} />
                  {confirmingDeleteId === entry.id ? (
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="text-ink/50">Delete this result permanently?</span>
                      <button
                        type="button"
                        onClick={() => onDelete(entry.id)}
                        disabled={deletingId === entry.id}
                        className="font-semibold text-red-600 transition-colors hover:text-red-700 active:text-red-700 disabled:opacity-50"
                      >
                        {deletingId === entry.id ? "Deleting…" : "Delete"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteId(null)}
                        className="text-ink/50 transition-colors hover:text-ink/70 active:text-ink/70"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingDeleteId(entry.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
