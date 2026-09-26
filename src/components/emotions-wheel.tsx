"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EMOTION_WHEEL, type WheelCore } from "@/lib/emotion-wheel-data";
import type { CoreEmotionId } from "@/lib/moods";
import { logMoodCheckIn } from "@/lib/local-journal";
import { Button } from "@/components/ui";
import type { Locale } from "@/lib/i18n/locale";

// Rounded to 2dp: raw floats from Math.cos/sin can differ in their last bit
// between the server and client JS engines, which trips a hydration
// mismatch on the numbers embedded in the SVG markup.
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function makePolar(cx: number, cy: number) {
  return function polar(r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: round2(cx + r * Math.cos(rad)), y: round2(cy + r * Math.sin(rad)) };
  };
}

function makeWedgePath(polar: ReturnType<typeof makePolar>) {
  return function wedgePath(rInner: number, rOuter: number, startDeg: number, endDeg: number) {
    const o1 = polar(rOuter, startDeg);
    const o2 = polar(rOuter, endDeg);
    const i1 = polar(rInner, endDeg);
    const i2 = polar(rInner, startDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${o1.x} ${o1.y} A ${rOuter} ${rOuter} 0 ${large} 1 ${o2.x} ${o2.y} L ${i1.x} ${i1.y} A ${rInner} ${rInner} 0 ${large} 0 ${i2.x} ${i2.y} Z`;
  };
}

const DARK_LABEL = "#123543"; // brand-900 — a dark navy, never pure black.

/** Picks white or the app's dark-navy ink color by the wedge's own
 * luminance, so a label is always readable whether its wedge is a deep
 * core shade or a pale outer tint — never hard-coded, never plain black. */
function labelColorFor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 0.5 ? "#ffffff" : DARK_LABEL;
}

// Rough average glyph advance width for Inter Semibold, as a fraction of
// font-size — used only to estimate whether a given word will fit the arc
// it's being placed on, not for precise layout.
const AVG_CHAR_WIDTH_EM = 0.58;

/** Wide wedges (36° or more) — plenty of room for a short word sitting
 * upright at mid-radius, no rotation needed. */
function UprightLabel({
  text,
  color,
  startDeg,
  endDeg,
  labelR,
  polar,
  fontSize,
  textColor,
}: {
  text: string;
  color: string;
  startDeg: number;
  endDeg: number;
  labelR: number;
  polar: ReturnType<typeof makePolar>;
  fontSize: number;
  /** Overrides the automatic luminance-based color pick below — for a
   * wedge whose label should always read a specific way regardless of
   * how light/dark its own fill happens to be. */
  textColor?: string;
}) {
  const mid = (startDeg + endDeg) / 2;
  const pt = polar(labelR, mid);
  return (
    <text
      x={pt.x}
      y={pt.y}
      textAnchor="middle"
      dominantBaseline="middle"
      fill={textColor ?? labelColorFor(color)}
      style={{ fontSize }}
      className="pointer-events-none select-none font-semibold"
    >
      {text}
    </text>
  );
}

/** Narrower wedges — the label follows the arc (tangent to the circle),
 * the same trick clock-face numerals use. Anchored at its own center
 * point, so flipping it 180° for the bottom half only changes reading
 * direction, never its position. */
function ArcLabel({
  text,
  color,
  startDeg,
  endDeg,
  labelR,
  polar,
}: {
  text: string;
  color: string;
  startDeg: number;
  endDeg: number;
  labelR: number;
  polar: ReturnType<typeof makePolar>;
}) {
  const mid = (startDeg + endDeg) / 2;
  const pt = polar(labelR, mid);
  const flip = mid > 90 && mid < 270;
  const rotate = round2(flip ? mid + 180 : mid);
  const span = endDeg - startDeg;
  const arcLength = (labelR * (span * Math.PI)) / 180;
  const fontForSpan = span * 0.34;
  const fontForWordLength = arcLength / (Math.max(text.length, 1) * AVG_CHAR_WIDTH_EM);
  const fontSize = round2(Math.max(11, Math.min(17, fontForSpan, fontForWordLength)));
  return (
    <text
      x={pt.x}
      y={pt.y}
      transform={`rotate(${rotate} ${pt.x} ${pt.y})`}
      textAnchor="middle"
      dominantBaseline="middle"
      fill={labelColorFor(color)}
      style={{ fontSize }}
      className="pointer-events-none select-none font-semibold"
    >
      {text}
    </text>
  );
}

const CORE_SLICE = 360 / EMOTION_WHEEL.length;

/** The core selector wheel — Fearful/Disgusted/Happy/Sad/Angry/Numb, tap one
 * to open its own full feelings wheel (see ExpandedWheel below). */
function CoreSelectorWheel({
  locale,
  onSelect,
  ariaLabel,
}: {
  locale: Locale;
  onSelect: (id: CoreEmotionId) => void;
  ariaLabel: string;
}) {
  const CX = 220;
  const CY = 220;
  const R0 = 60;
  const R1 = 200;
  const polar = makePolar(CX, CY);
  const wedgePath = makeWedgePath(polar);

  return (
    <svg
      viewBox="0 0 440 440"
      className="w-full max-w-[440px] drop-shadow-[0_8px_20px_rgba(18,53,67,0.12)]"
      role="img"
      aria-label={ariaLabel}
    >
      {EMOTION_WHEEL.map((core, i) => {
        const startDeg = i * CORE_SLICE;
        const endDeg = startDeg + CORE_SLICE;
        return (
          <path
            key={core.id}
            d={wedgePath(R0, R1, startDeg, endDeg)}
            fill={core.colorCore}
            stroke="white"
            strokeWidth={3}
            className="cursor-pointer transition-opacity hover:opacity-80 active:opacity-80"
            onClick={() => onSelect(core.id)}
          />
        );
      })}
      {EMOTION_WHEEL.map((core, i) => {
        const startDeg = i * CORE_SLICE;
        const endDeg = startDeg + CORE_SLICE;
        const label = locale === "ar" ? core.labelAr : core.label;
        return (
          <UprightLabel
            key={core.id}
            text={label}
            color={core.colorCore}
            startDeg={startDeg}
            endDeg={endDeg}
            labelR={(R0 + R1) / 2}
            polar={polar}
            fontSize={22}
            // "Numb"'s wedge (#9297A0) is light enough that the automatic
            // luminance pick above lands on dark text, unlike every other
            // core here — forced white instead of also darkening the
            // wedge itself, which wasn't asked for.
            textColor={core.id === "numb" ? "#ffffff" : undefined}
          />
        );
      })}
    </svg>
  );
}

/** One core's own full feelings wheel — its 5 secondary feelings and their
 * 10 tertiary feelings, each ring using the full 360° (not squeezed into a
 * slice of the core wheel), so every wedge gets as much room as the
 * core wheel's own wedges do. Tap the center to go back. */
function ExpandedWheel({
  core,
  locale,
  onBack,
  onLog,
  ariaLabel,
}: {
  core: WheelCore;
  locale: Locale;
  onBack: () => void;
  onLog: (label: string, color: string) => void;
  ariaLabel: string;
}) {
  const CX = 260;
  const CY = 260;
  const R0 = 62;
  const R1 = 175;
  const R2 = 250;
  const polar = makePolar(CX, CY);
  const wedgePath = makeWedgePath(polar);
  const secondarySlice = 360 / core.secondaries.length;
  const tertiarySlice = 360 / (core.secondaries.length * 2);

  return (
    <svg
      viewBox="0 0 520 520"
      className="w-full max-w-[600px] drop-shadow-[0_8px_20px_rgba(18,53,67,0.12)]"
      role="img"
      aria-label={ariaLabel}
    >
      {core.secondaries.map((secondary, si) => {
        const sStart = si * secondarySlice;
        const sEnd = sStart + secondarySlice;
        const sLabel = locale === "ar" ? secondary.labelAr : secondary.label;
        return (
          <path
            key={secondary.label}
            d={wedgePath(R0, R1, sStart, sEnd)}
            fill={core.colorSecondary}
            stroke="white"
            strokeWidth={2.5}
            className="cursor-pointer transition-opacity hover:opacity-80 active:opacity-80"
            onClick={() => onLog(sLabel, core.colorSecondary)}
          />
        );
      })}
      {core.secondaries.flatMap((secondary, si) =>
        secondary.tertiary.map((leaf, ti) => {
          const tStart = (si * 2 + ti) * tertiarySlice;
          const tEnd = tStart + tertiarySlice;
          const tLabel = locale === "ar" ? leaf.labelAr : leaf.label;
          return (
            <path
              key={leaf.label}
              d={wedgePath(R1, R2, tStart, tEnd)}
              fill={core.colorTertiary}
              stroke="white"
              strokeWidth={2}
              className="cursor-pointer transition-opacity hover:opacity-80 active:opacity-80"
              onClick={() => onLog(tLabel, core.colorTertiary)}
            />
          );
        }),
      )}

      <circle cx={CX} cy={CY} r={R0 - 4} className="fill-white stroke-brand-100" strokeWidth={2} />

      {core.secondaries.map((secondary, si) => {
        const sStart = si * secondarySlice;
        const sEnd = sStart + secondarySlice;
        const sLabel = locale === "ar" ? secondary.labelAr : secondary.label;
        return (
          <UprightLabel
            key={secondary.label}
            text={sLabel}
            color={core.colorSecondary}
            startDeg={sStart}
            endDeg={sEnd}
            labelR={(R0 + R1) / 2}
            polar={polar}
            fontSize={17}
          />
        );
      })}
      {core.secondaries.flatMap((secondary, si) =>
        secondary.tertiary.map((leaf, ti) => {
          const tStart = (si * 2 + ti) * tertiarySlice;
          const tEnd = tStart + tertiarySlice;
          const tLabel = locale === "ar" ? leaf.labelAr : leaf.label;
          return (
            <ArcLabel
              key={leaf.label}
              text={tLabel}
              color={core.colorTertiary}
              startDeg={tStart}
              endDeg={tEnd}
              labelR={(R1 + R2) / 2}
              polar={polar}
            />
          );
        }),
      )}

      <foreignObject x={CX - R0 + 4} y={CY - R0 + 4} width={(R0 - 4) * 2} height={(R0 - 4) * 2}>
        <button
          type="button"
          onClick={onBack}
          className="flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-full text-center"
        >
          {locale === "ar" ? (
            <ChevronRight className="h-5 w-5 text-ink/40" strokeWidth={2} />
          ) : (
            <ChevronLeft className="h-5 w-5 text-ink/40" strokeWidth={2} />
          )}
          <span className="text-sm font-semibold text-brand-900">
            {locale === "ar" ? core.labelAr : core.label}
          </span>
        </button>
      </foreignObject>
    </svg>
  );
}

/** Interactive 3-tier feelings wheel — Fearful/Disgusted/Happy/Sad/Angry/Numb at
 * the center, tap one to open its own full feelings wheel (5 secondary
 * feelings, each with 2 tertiary feelings), using the full circle rather
 * than a cramped slice so every word has room to read. Tap any wedge on
 * either wheel to log it. Logged moods are saved separately from journal
 * entries (see logMoodCheckIn in local-journal.ts) but still count toward
 * mood patterns/calendar, which resolve colors by core id only — see
 * moods.ts — so every tap here logs under its core id regardless of which
 * ring was tapped, keeping full compatibility with MoodPicker's own
 * (unrelated) short list and existing logged history. Deliberately a
 * distinct, wheel-shaped interaction from MoodPicker's pill chips, which
 * stay dedicated to tagging a journal entry while writing. */
export default function EmotionsWheel({
  userId,
  locale,
  dict,
  onLogged,
}: {
  userId: string;
  locale: Locale;
  dict: {
    wheelPrompt: string;
    wheelPickSpecific: string;
    wheelJustLog: string;
    wheelLogged: string;
    wheelBack: string;
  };
  /** Called with the core emotion id every time a wedge (or the "just log
   * the core feeling" button) is logged — e.g. so a "Journal about it"
   * link elsewhere on the page can carry it into the entry composer. */
  onLogged?: (coreId: CoreEmotionId) => void;
}) {
  const [expandedId, setExpandedId] = useState<CoreEmotionId | null>(null);
  const [logged, setLogged] = useState<{ label: string; color: string } | null>(null);

  const expanded: WheelCore | null = EMOTION_WHEEL.find((c) => c.id === expandedId) ?? null;

  async function log(coreId: CoreEmotionId, flashLabel: string, flashColor: string) {
    await logMoodCheckIn(userId, [coreId]);
    setLogged({ label: flashLabel, color: flashColor });
    onLogged?.(coreId);
    window.setTimeout(() => {
      setLogged(null);
      setExpandedId(null);
    }, 1100);
  }

  return (
    <div className="flex flex-col items-center">
      {expanded ? (
        <ExpandedWheel
          core={expanded}
          locale={locale}
          onBack={() => setExpandedId(null)}
          onLog={(label, color) => log(expanded.id, label, color)}
          ariaLabel={dict.wheelPickSpecific.replace("{core}", locale === "ar" ? expanded.labelAr : expanded.label)}
        />
      ) : (
        <CoreSelectorWheel locale={locale} onSelect={setExpandedId} ariaLabel={dict.wheelPrompt} />
      )}

      <div className="mt-5 flex min-h-[4.5rem] flex-col items-center gap-2 text-center">
        {logged ? (
          <p className="animate-pop-in flex items-center gap-2 text-lg font-medium text-brand-700">
            <span className="h-2.5 w-2.5 rounded-full border border-brand-900/10" style={{ backgroundColor: logged.color }} />
            {dict.wheelLogged}: {logged.label}
          </p>
        ) : expanded ? (
          <>
            <p className="text-base text-ink/60">
              {dict.wheelPickSpecific.replace("{core}", locale === "ar" ? expanded.labelAr : expanded.label)}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                log(expanded.id, locale === "ar" ? expanded.labelAr : expanded.label, expanded.colorCore)
              }
              className="px-5 py-2 text-sm"
            >
              {dict.wheelJustLog.replace("{core}", locale === "ar" ? expanded.labelAr : expanded.label)}
            </Button>
          </>
        ) : (
          <p className="text-base text-ink/50">{dict.wheelPrompt}</p>
        )}
      </div>
    </div>
  );
}
