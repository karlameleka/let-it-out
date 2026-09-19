"use client";

import { useActionState } from "react";
import { restoreTrashedItemAction, type RestoreFormState } from "@/lib/trash-actions";

export default function RestoreButton({ trashId }: { trashId: string }) {
  const [state, formAction, pending] = useActionState<RestoreFormState, FormData>(restoreTrashedItemAction, undefined);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="trashId" value={trashId} />
      <button
        type="submit"
        disabled={pending || state?.success}
        className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
      >
        {state?.success ? "Restored" : pending ? "Restoring…" : "Restore"}
      </button>
      {state?.error && <p className="max-w-[16rem] text-right text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
