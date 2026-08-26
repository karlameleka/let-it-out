"use client";

import { useEffect, useReducer, useRef, type CSSProperties } from "react";
import { Info, Play, RotateCcw, Sparkles, Square } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui";
import {
  BREATHING_PATTERNS,
  CYCLE_OPTIONS,
  type BreathingPattern,
  type BreathingPhaseLabel,
  type BreathingShape,
} from "@/lib/breathing-patterns";
import { recordBreathingCompletion, type BreathingStreakStats } from "@/lib/breathing-streak";
import type { Dictionary } from "@/lib/i18n/dictionary";

const STORAGE_KEY = "lio_breathing_count";

const TRIANGLE_CLIP_PATH = "polygon(50% 0%, 0% 100%, 100% 100%)";

/** Rounded corners on a clip-path triangle would need an SVG path — a plain
    triangle reads fine here since it's small and paired with a soft fill. */
function shapeStyle(shape: BreathingShape): CSSProperties {
  return shape === "triangle" ? { clipPath: TRIANGLE_CLIP_PATH } : {};
}

function shapeRounding(shape: BreathingShape): string {
  if (shape === "circle") return "rounded-full";
  if (shape === "square") return "rounded-2xl";
  return "";
}

/** Small shape preview shown next to each pattern's name in the setup
    picker, so the shape difference is visible before starting. Uses its own
    (smaller) corner rounding than the big paced visual — rounded-2xl on a
    14px box would round it into a circle. */
function ShapeSwatch({ shape }: { shape: BreathingShape }) {
  const rounding = shape === "circle" ? "rounded-full" : shape === "square" ? "rounded-[3px]" : "";
  return (
    <span
      aria-hidden
      className={`inline-block h-3.5 w-3.5 shrink-0 bg-brand-500 ${rounding}`}
      style={shapeStyle(shape)}
    />
  );
}

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
  shapeScale: number;
  count: number | null;
  streak: number | null;
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
  shapeScale: 1,
  count: null,
  streak: null,
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
        shapeScale: scaleForPhase(state.pattern.phases[0].label, 1),
      };
    case "RESET":
      return { ...state, stage: "setup", phaseIndex: 0, shapeScale: 1 };
    case "TICK": {
      if (state.stage !== "active") return state;
      if (state.secondsLeft > 1) return { ...state, secondsLeft: state.secondsLeft - 1 };

      const nextIndex = (state.phaseIndex + 1) % state.pattern.phases.length;
      if (nextIndex === 0) {
        const nextCycles = state.cyclesDone + 1;
        if (nextCycles >= state.targetCycles) {
          const nextCount = (state.count ?? 0) + 1;
          window.localStorage.setItem(STORAGE_KEY, String(nextCount));
          const cycleSeconds = state.pattern.phases.reduce((sum, p) => sum + p.seconds, 0);
          const { streak }: BreathingStreakStats = recordBreathingCompletion(cycleSeconds * nextCycles);
          return { ...state, stage: "done", cyclesDone: nextCycles, count: nextCount, streak };
        }
        return {
          ...state,
          cyclesDone: nextCycles,
          phaseIndex: nextIndex,
          secondsLeft: state.pattern.phases[nextIndex].seconds,
          shapeScale: scaleForPhase(state.pattern.phases[nextIndex].label, state.shapeScale),
        };
      }
      return {
        ...state,
        phaseIndex: nextIndex,
        secondsLeft: state.pattern.phases[nextIndex].seconds,
        shapeScale: scaleForPhase(state.pattern.phases[nextIndex].label, state.shapeScale),
      };
    }
    default:
      return state;
  }
}

export default function BreathingTool({ dict }: { dict: Dictionary["breathing"] }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const containerRef = useRef<HTMLDivElement>(null);

  const patternName = (p: BreathingPattern) =>
    p.id === "box" ? dict.patternBoxName : p.id === "4-7-8" ? dict.pattern478Name : dict.patternCoherentName;
  const patternDescription = (p: BreathingPattern) =>
    p.id === "box"
      ? dict.patternBoxDescription
      : p.id === "4-7-8"
        ? dict.pattern478Description
        : dict.patternCoherentDescription;
  const phaseLabel = (label: BreathingPhaseLabel) =>
    label === "Inhale" ? dict.phaseInhale : label === "Hold" ? dict.phaseHold : dict.phaseExhale;

  useEffect(() => {
    dispatch({ type: "HYDRATE_COUNT", count: Number(window.localStorage.getItem(STORAGE_KEY) ?? "0") });
  }, []);

  useEffect(() => {
    if (state.stage !== "active") return;
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [state.stage]);

  // The setup card is much taller than the active view — collapsing it
  // otherwise leaves the page scrolled past the exercise, since the browser
  // keeps the same scroll offset while the content above it shrinks.
  useEffect(() => {
    if (state.stage === "active") {
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state.stage]);

  const currentPhase = state.pattern.phases[state.phaseIndex];

  return (
    <div ref={containerRef} className="overflow-hidden rounded-3xl border-2 border-brand-100 bg-white shadow-sm">
      {state.stage === "setup" && (
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-2.5 rounded-xl bg-brand-50/70 p-4 text-sm text-ink/70">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" strokeWidth={2} />
            <p>{dict.infoText}</p>
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink/40">{dict.choosePattern}</p>
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
                <div className="flex items-center gap-2">
                  <ShapeSwatch shape={p.shape} />
                  <p className="font-display text-base font-semibold text-brand-900">{patternName(p)}</p>
                </div>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-brand-500">{p.tagline}</p>
                <p className="mt-1.5 text-xs text-ink/60">{patternDescription(p)}</p>
              </button>
            ))}
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink/40">{dict.howManyCycles}</p>
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
                {n} {dict.cycles}
              </button>
            ))}
          </div>

          <Button onClick={() => dispatch({ type: "START" })} className="mt-6">
            <Play className="h-4 w-4" strokeWidth={2} />
            {dict.startBreathing}
          </Button>
        </div>
      )}

      {state.stage === "active" && (
        <div className="flex flex-col items-center p-6 py-12 sm:p-8 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
            {patternName(state.pattern)} ·{" "}
            {dict.cycleLabel
              .replace("{current}", String(Math.min(state.cyclesDone + 1, state.targetCycles)))
              .replace("{total}", String(state.targetCycles))}
          </p>

          <div className="relative mt-8 flex h-48 w-48 items-center justify-center">
            <div
              className={`absolute inset-0 bg-brand-100 transition-transform ease-in-out ${shapeRounding(state.pattern.shape)}`}
              style={{
                transform: `scale(${state.shapeScale})`,
                transitionDuration: `${currentPhase.seconds}s`,
                ...shapeStyle(state.pattern.shape),
              }}
            />
            {state.pattern.shape === "triangle" ? (
              <svg
                viewBox="0 0 100 100"
                className="absolute left-6 top-6 text-brand-300"
                style={{ width: "calc(100% - 3rem)", height: "calc(100% - 3rem)" }}
              >
                <polygon points="50,4 4,96 96,96" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
              </svg>
            ) : (
              <div className={`absolute inset-6 border-2 border-brand-300 ${shapeRounding(state.pattern.shape)}`} />
            )}
            <div className="relative text-center">
              <p className="font-display text-2xl font-semibold text-brand-900">{phaseLabel(currentPhase.label)}</p>
              <p className="mt-1 text-3xl font-semibold text-brand-700">{state.secondsLeft || currentPhase.seconds}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch({ type: "RESET" })}
            className="mt-10 inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-4 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:border-brand-400 active:border-brand-400"
          >
            <Square className="h-3.5 w-3.5" strokeWidth={2} />
            {dict.stop}
          </button>
        </div>
      )}

      {state.stage === "done" && (
        <div className="animate-pop-in p-6 sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white">
            <Sparkles className="h-5 w-5" strokeWidth={2} />
          </span>
          <p className="mt-3 font-display text-lg font-semibold text-brand-900">
            {dict.doneTitle
              .replace("{cycles}", String(state.targetCycles))
              .replace("{pattern}", patternName(state.pattern).toLowerCase())}
          </p>
          <p className="mt-1 text-sm text-ink/60">
            {state.streak !== null && state.streak > 1 && dict.streakLine.replace("{n}", String(state.streak))}
            {state.count !== null &&
              state.count > 0 &&
              (state.count === 1 ? dict.sessionSoFar : dict.sessionsSoFar).replace("{n}", String(state.count))}
            {dict.savedPrivately}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button onClick={() => dispatch({ type: "RESET" })}>
              <RotateCcw className="h-4 w-4" strokeWidth={2} />
              {dict.breatheAgain}
            </Button>
            <ButtonLink href="/counseling" variant="text">
              {dict.talkToCounselor} &rarr;
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
