"use client";

export type GuestOnboardingStepId = "signup" | "counseling" | "shop";

type GuestOnboardingState = {
  welcomeSeen: boolean;
  checklistDismissed: boolean;
  done: Record<GuestOnboardingStepId, boolean>;
};

const STORAGE_KEY = "lio_guest_onboarding";

const DEFAULT_STATE: GuestOnboardingState = {
  welcomeSeen: false,
  checklistDismissed: false,
  done: { signup: false, counseling: false, shop: false },
};

/** Device-local onboarding state for a visitor who hasn't signed up yet —
 * there's no account to persist against, so unlike the logged-in flow
 * (see onboarding.ts) this all lives in localStorage. Once someone
 * actually signs up, the account-based welcome modal + checklist takes
 * over on their next page load and this state simply stops being read. */
export function readGuestOnboardingState(): GuestOnboardingState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      welcomeSeen: Boolean(parsed.welcomeSeen),
      checklistDismissed: Boolean(parsed.checklistDismissed),
      done: {
        signup: Boolean(parsed.done?.signup),
        counseling: Boolean(parsed.done?.counseling),
        shop: Boolean(parsed.done?.shop),
      },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeGuestOnboardingState(state: GuestOnboardingState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort — private browsing / storage disabled just means this
    // resets every visit, which is harmless.
  }
}

export function markGuestWelcomeSeen() {
  const state = readGuestOnboardingState();
  if (state.welcomeSeen) return;
  writeGuestOnboardingState({ ...state, welcomeSeen: true });
}

export function dismissGuestChecklist() {
  const state = readGuestOnboardingState();
  writeGuestOnboardingState({ ...state, checklistDismissed: true });
}

export function markGuestStepDone(step: GuestOnboardingStepId) {
  const state = readGuestOnboardingState();
  if (state.done[step]) return state;
  const next = { ...state, done: { ...state.done, [step]: true } };
  writeGuestOnboardingState(next);
  return next;
}
