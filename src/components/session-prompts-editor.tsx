"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { PromptCard } from "@/lib/therapist-toolkit";

const inputClasses =
  "w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500";

type EditablePrompt = { id: string; text: string };
type EditableCard = { id: string; title: string; prompts: EditablePrompt[] };

function newId() {
  return `x-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function toEditable(cards: PromptCard[]): EditableCard[] {
  return cards.map((c) => ({
    id: newId(),
    title: c.title,
    prompts: c.prompts.map((text) => ({ id: newId(), text })),
  }));
}

function toPromptCards(cards: EditableCard[]): PromptCard[] {
  return cards.map((c) => ({ title: c.title, prompts: c.prompts.map((p) => p.text) }));
}

export default function SessionPromptsEditor({
  initialCards,
  defaultCards,
  action,
}: {
  initialCards: PromptCard[];
  defaultCards: PromptCard[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [cards, setCards] = useState<EditableCard[]>(() => toEditable(initialCards));

  function updateCard(cardId: string, updater: (c: EditableCard) => EditableCard) {
    setCards((arr) => arr.map((c) => (c.id === cardId ? updater(c) : c)));
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="cardsJson" value={JSON.stringify(toPromptCards(cards))} readOnly />

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.id} className="rounded-2xl border border-brand-100 bg-white p-5">
            <div className="flex items-start gap-2">
              <input
                value={card.title}
                onChange={(e) => updateCard(card.id, (c) => ({ ...c, title: e.target.value }))}
                placeholder="Card title"
                className={`${inputClasses} font-display font-semibold text-brand-900`}
              />
              <button
                type="button"
                onClick={() => setCards((arr) => arr.filter((c) => c.id !== card.id))}
                aria-label="Remove card"
                className="mt-1.5 shrink-0 text-ink/40 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {card.prompts.map((p) => (
                <div key={p.id} className="flex items-start gap-2">
                  <textarea
                    value={p.text}
                    onChange={(e) =>
                      updateCard(card.id, (c) => ({
                        ...c,
                        prompts: c.prompts.map((x) => (x.id === p.id ? { ...x, text: e.target.value } : x)),
                      }))
                    }
                    placeholder="Prompt"
                    rows={2}
                    className={`${inputClasses} resize-y text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateCard(card.id, (c) => ({ ...c, prompts: c.prompts.filter((x) => x.id !== p.id) }))
                    }
                    aria-label="Remove prompt"
                    className="mt-1.5 shrink-0 text-ink/40 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                updateCard(card.id, (c) => ({ ...c, prompts: [...c.prompts, { id: newId(), text: "" }] }))
              }
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Add prompt
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setCards((arr) => [...arr, { id: newId(), title: "", prompts: [{ id: newId(), text: "" }] }])}
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 px-3.5 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
        >
          <Plus className="h-4 w-4" strokeWidth={2} /> Add card
        </button>
        <button
          type="button"
          onClick={() => setCards(toEditable(defaultCards))}
          className="text-xs font-medium text-ink/50 hover:text-ink/80 hover:underline"
        >
          Reset to defaults
        </button>
      </div>

      <button
        type="submit"
        className="rounded bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-900/20 transition-all duration-300 ease-out hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)]"
      >
        Save session prompts
      </button>
    </form>
  );
}
