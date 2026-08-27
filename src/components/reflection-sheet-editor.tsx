"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ReflectionQuestion } from "@/lib/reflection-sheet-config";

const inputClasses =
  "w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500";

function emptyQuestion(): ReflectionQuestion {
  return { id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text: "" };
}

function QuestionsList({
  questions,
  setQuestions,
  dir,
  addLabel,
}: {
  questions: ReflectionQuestion[];
  setQuestions: (updater: (arr: ReflectionQuestion[]) => ReflectionQuestion[]) => void;
  dir?: "rtl";
  addLabel: string;
}) {
  return (
    <div className="space-y-3">
      {questions.map((q, i) => (
        <div key={q.id} className="flex items-start gap-2">
          <span className="mt-2.5 shrink-0 text-xs font-semibold uppercase tracking-wide text-brand-400">{i + 1}</span>
          <input
            dir={dir}
            value={q.text}
            onChange={(e) =>
              setQuestions((arr) => arr.map((x, idx) => (idx === i ? { ...x, text: e.target.value } : x)))
            }
            className={inputClasses}
          />
          <button
            type="button"
            onClick={() => setQuestions((arr) => arr.filter((_, idx) => idx !== i))}
            aria-label="Remove question"
            className="mt-1.5 shrink-0 text-ink/40 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setQuestions((arr) => [...arr, emptyQuestion()])}
        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 px-3.5 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
      >
        <Plus className="h-4 w-4" strokeWidth={2} /> {addLabel}
      </button>
    </div>
  );
}

export default function ReflectionSheetEditor({
  questions: initialQuestions,
  questionsAr: initialQuestionsAr,
  action,
}: {
  questions: ReflectionQuestion[];
  questionsAr: ReflectionQuestion[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [questions, setQuestions] = useState<ReflectionQuestion[]>(
    initialQuestions.length > 0 ? initialQuestions : [emptyQuestion()]
  );
  const [questionsAr, setQuestionsAr] = useState<ReflectionQuestion[]>(initialQuestionsAr);
  const [showArabic, setShowArabic] = useState(initialQuestionsAr.length > 0);

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="questionsJson" value={JSON.stringify(questions)} readOnly />
      <input type="hidden" name="questionsArJson" value={JSON.stringify(showArabic ? questionsAr : [])} readOnly />

      <div className="rounded-2xl border border-brand-100 bg-white p-5">
        <h3 className="font-display font-semibold text-brand-900">Questions</h3>
        <p className="mt-1 text-xs text-ink/50">
          Shown to clients any time between sessions — answers are saved only on the client&rsquo;s own device and are
          never sent to or visible on our servers.
        </p>
        <div className="mt-4">
          <QuestionsList questions={questions} setQuestions={setQuestions} addLabel="Add question" />
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-brand-300 bg-brand-50/40 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-semibold text-brand-900">Arabic version</h3>
            <p className="mt-1 text-xs text-ink/50">
              Fully independent from the English list above — its own questions, own order, own count.
            </p>
          </div>
          {!showArabic && (
            <button
              type="button"
              onClick={() => {
                setQuestionsAr((arr) => (arr.length > 0 ? arr : [emptyQuestion()]));
                setShowArabic(true);
              }}
              className="shrink-0 rounded-lg border border-brand-300 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
            >
              Add Arabic version
            </button>
          )}
        </div>

        {showArabic && (
          <div className="mt-4 space-y-4">
            <QuestionsList questions={questionsAr} setQuestions={setQuestionsAr} dir="rtl" addLabel="أضف سؤال" />
            <button
              type="button"
              onClick={() => {
                setQuestionsAr([]);
                setShowArabic(false);
              }}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Remove Arabic version (Arabic-locale clients will see the English list)
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        className="rounded bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-900/20 transition-all duration-300 ease-out hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)]"
      >
        Save reflection sheet
      </button>
    </form>
  );
}
