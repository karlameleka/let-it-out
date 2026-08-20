"use client";

import { useEffect, useReducer } from "react";
import { Info, Play, RotateCcw, Sparkles, Square } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui";
import { BREATHING_PATTERNS, CYCLE_OPTIONS, type BreathingPattern, type BreathingPhaseLabel } from "@/lib/breathing-patterns";
import { recordBreathingCompletion } from "@/lib/breathing-streak";

const STORAGE_KEY = "lio_breathing_count";

function scaleForPhase(label: BreathingPhaseLabel, current: number): number {
  if (label === "Inhale") return 1.4;
  if (label === "Exhale") return 1;
  return current;
}

type Stage = "setup" | "active" | "done";

type State = {
  stage: Stage;
  pattern: BreathingPattern;
  targetCycles: number;
  phaseIndex: number;
  secondsLeft: number;
  cyclesDone: number;
  circleScale: number;
  count: number | null;
};

type Action =
  | { type: "HYDRATE_COUNT"; count: number }
  | { type: "SET_PATTERN"; pattern: BreathingPattern }
  | { type: "SET_CYCLES"; cycles: number }
  | { type: "START" }
  | { type: "RESET" }
  | { type: "TICK" };

const initialState: State = {
  stage: "setup",
  pattern: BREATHING_PATTERNS[0],
  targetCycles: 6,
  phaseIndex: 0,
  secondsLeft: BREATHING_PATTERNS[0].phases[0].seconds,
  cyclesDone: 0,
  circleScale: 1,
  count: null,
};

// A reducer (rather than several useState calls) so every tick of the timer
// resolves to exactly one dispatch — including the "session finished" side
// effects (saving the count, recording the streak) — instead of a chain of
// effects reacting to each other's state changes.
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE_COUNT":
      return { ...state, count: action.count };
    case "SET_PATTERN":
      return state.stage === "setup"
        ? { ...state, pattern: action.pattern, secondsLeft: action.pattern.phases[0].seconds }
        : state;
    case "SET_CYCLES":
      return state.stage === "setup" ? { ...state, targetCycles: action.cycles } : state;
    case "START":
      return {
        ...state,
        stage: "active",
        phaseIndex: 0,
        secondsLeft: state.pattern.phases[0].seconds,
        cyclesDone: 0,
        circleScale: scaleForPhase(state.pattern.phases[0].label, 1),
      };
    case "RESET":
      return { ...state, stage: "setup", phaseIndex: 0, circleScale: 1 };
    case "TICK": {
      if (state.stage !== "active") return state;
      if (state.secondsLeft > 1) return { ...state, secondsLeft: state.secondsLeft - 1 };

      const nextIndex = (state.phaseIndex + 1) % state.pattern.phases.length;
      if (nextIndex === 0) {
        const nextCycles = state.cyclesDone + 1;
        if (nextCycles >= state.targetCycles) {
          const nextCount = (state.count ?? 0) + 1;
          window.localStorage.setItem(STORAGE_KEY, String(nextCount));
          recordBreathingCompletion();
          return { ...state, stage: "done", cyclesDone: nextCycles, count: nextCount };
        }
        return {
          ...state,
          cyclesDone: nextCycles,
          phaseIndex: nextIndex,
          secondsLeft: state.pattern.phases[nextIndex].seconds,
          circleScale: scaleForPhase(state.pattern.phases[nextIndex].label, state.circleScale),
        };
      }
      return {
        ...state,
        phaseIndex: nextIndex,
        secondsLeft: state.pattern.phases[nextIndex].seconds,
        circleScale: scaleForPhase(state.pattern.phases[nextIndex].label, state.circleScale),
      };
    }
    default:
      return state;
  }
}

export default function BreathingTool() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({ type: "HYDRATE_COUNT", count: Number(window.localStorage.getItem(STORAGE_KEY) ?? "0") });
  }, []);

  useEffect(() => {
    if (state.stage !== "active") return;
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [state.stage]);

  const currentPhase = state.pattern.phases[state.phaseIndex];

  return (
    <div className="overflow-hidden rounded-3xl border-2 border-brand-100 bg-white shadow-sm">
      {state.stage === "setup" && (
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-2.5 rounded-xl bg-brand-50/70 p-4 text-sm text-ink/70">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" strokeWidth={2} />
            <p>
              Slow, paced breathing is one of the few ways to directly influence your nervous system on
              purpose. A longer exhale in particular activates the vagus nerve and shifts your body from
              fight-or-flight toward rest-and-digest — which is why a few minutes of this can measurably
              lower heart rate and feelings of anxiety, even before anything about the situation changes.
            </p>
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink/40">Choose a pattern</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {BREATHING_PATTERNS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => dispatch({ type: "SET_PATTERN", pattern: p })}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  state.pattern.id === p.id
                    ? "border-brand-600 bg-brand-50"
                    : "border-brand-200 hover:border-brand-400 active:border-brand-400"
                }`}
              >
                <p className="font-display text-base font-semibold text-brand-900">{p.name}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-brand-500">{p.tagline}</p>
                <p className="mt-1.5 text-xs text-ink/60">{p.description}</p>
              </button>
            ))}
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink/40">How many cycles</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CYCLE_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => dispatch({ type: "SET_CYCLES", cycles: n })}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  state.targetCycles === n
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-brand-200 text-ink/70 hover:border-brand-400 active:border-brand-400"
                }`}
              >
                {n} cycles
              </button>
            ))}
          </div>

          <Button onClick={() => dispatch({ type: "START" })} className="mt-6">
            <Play className="h-4 w-4" strokeWidth={2} />
            Start breathing
          </Button>
        </div>
      )}

      {state.stage === "active" && (
        <div className="flex flex-col items-center p-6 py-12 sm:p-8 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
            {state.pattern.name} · Cycle {Math.min(state.cyclesDone + 1, state.targetCycles)} of{" "}
            {state.targetCycles}
          </p>

          <div className="relative mt-8 flex h-48 w-48 items-center justify-center">
            <div
              className="absolute inset-0 rounded-full bg-brand-100 transition-transform ease-in-out"
              style={{ transform: `scale(${state.circleScale})`, transitionDuration: `${currentPhase.seconds}s` }}
            />
            <div className="absolute inset-6 rounded-full border-2 border-brand-300" />
            <div className="relative text-center">
              <p className="font-display text-2xl font-semibold text-brand-900">{currentPhase.label}</p>
              <p className="mt-1 text-3xl font-semibold text-brand-700">{state.secondsLeft || currentPhase.seconds}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch({ type: "RESET" })}
            className="mt-10 inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-4 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:border-brand-400 active:border-brand-400"
          >
            <Square className="h-3.5 w-3.5" strokeWidth={2} />
            Stop
          </button>
        </div>
      )}

      {state.stage === "done" && (
        <div className="animate-pop-in p-6 sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white">
            <Sparkles className="h-5 w-5" strokeWidth={2} />
          </span>
          <p className="mt-3 font-display text-lg font-semibold text-brand-900">
            {state.targetCycles} cycles of {state.pattern.name.toLowerCase()}, done.
          </p>
          <p className="mt-1 text-sm text-ink/60">
            {state.count !== null && state.count > 0 && `${state.count} session${state.count === 1 ? "" : "s"} so far. `}
            Saved privately on this device — never on our servers.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button onClick={() => dispatch({ type: "RESET" })}>
              <RotateCcw className="h-4 w-4" strokeWidth={2} />
              Breathe again
            </Button>
            <ButtonLink href="/counseling" variant="text">
              If this feels heavy, talk it through with a counselor &rarr;
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
