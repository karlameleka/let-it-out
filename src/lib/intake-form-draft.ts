"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Autosaves an in-progress intake form to localStorage as the person
 * types, and restores it the next time they open the same form — these
 * forms are long (several sections), often opened from a text/email link
 * on a phone, and easy to get interrupted partway through. Never touches
 * the server: this is purely a "don't lose what you already typed" safety
 * net, cleared the moment the real submission succeeds.
 *
 * Deliberately keyed by a plain localStorage key rather than per-user —
 * matches every other device-local preference in this app (e.g.
 * lio_journal_mode), and a shared device mid-intake is already an edge
 * case the rest of the app doesn't special-case either.
 */
export function useIntakeFormDraft(
  storageKey: string,
  formRef: React.RefObject<HTMLFormElement | null>,
  submitted: boolean,
): { handleFormChange: () => void; draftRestored: boolean } {
  const [draftRestored, setDraftRestored] = useState(false);

  // Restore once, on mount — after the very first paint, so the fields
  // exist in the DOM for form.elements to find.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        restoreFormValues(form, JSON.parse(raw));
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDraftRestored(true);
      }
    } catch {
      // Corrupted/foreign localStorage value — just start blank.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear the draft once the real submission has actually gone through —
  // nothing left worth resuming.
  useEffect(() => {
    if (!submitted) return;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Ignore — worst case a stale draft lingers until overwritten.
    }
  }, [submitted, storageKey]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Wire this to the <form>'s onChange — React's onChange bubbles up
   * from every field inside it (text inputs fire on every keystroke,
   * selects/radios/checkboxes on toggle), so one handler at the form
   * level covers every field without each Field component needing to
   * know autosave exists. Debounced so a fast typist doesn't write to
   * localStorage on every single keystroke. */
  function handleFormChange() {
    const form = formRef.current;
    if (!form) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        const data = Object.fromEntries(new FormData(form).entries());
        window.localStorage.setItem(storageKey, JSON.stringify(data));
      } catch {
        // Best-effort — a full/blocked localStorage shouldn't break typing.
      }
    }, 400);
  }

  return { handleFormChange, draftRestored };
}

function restoreFormValues(form: HTMLFormElement, draft: Record<string, unknown>) {
  for (const [name, rawValue] of Object.entries(draft)) {
    if (typeof rawValue !== "string") continue;
    const el = form.elements.namedItem(name);
    if (!el) continue;

    if (el instanceof RadioNodeList) {
      for (const node of Array.from(el)) {
        if (node instanceof HTMLInputElement && (node.type === "radio" || node.type === "checkbox")) {
          node.checked = node.value === rawValue;
        }
      }
    } else if (el instanceof HTMLInputElement) {
      if (el.type === "checkbox" || el.type === "radio") el.checked = el.value === rawValue || rawValue === "on";
      else el.value = rawValue;
    } else if (el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
      el.value = rawValue;
    }
  }
}
