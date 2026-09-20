"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EMOTION_WHEEL, type WheelCore } from "@/lib/emotion-wheel-data";
import type { CoreEmotionId } from "@/lib/moods";
import { logMoodCheckIn } from "@/lib/local-journal";
import { Button } from "@/components/ui";
import type { Locale } from "@/lib/i18n/locale";

const CX = 220;
const CY = 220;
// Center hub, then core / secondary / tertiary rings, each band wide
// enough for its own label style (tangential for the first two, radial
// for the crowded 7.2°-wide tertiary wedges — see RadialLabel below).
const R0 = 40;
const R1 = 95;
const R2 = 140;
const R3 = 200;

// Rounded to 2dp: raw floats from Math.cos/sin can differ in their last bit
// between the server and client JS engines, which trips a hydration
// mismatch on the numbers embedded in the SVG markup.
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function polar(r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: round2(CX + r * Math.cos(rad)), y: round2(CY + r * Math.sin(rad)) };
}

function wedgePath(rInner: number, rOuter: number, startDeg: number, endDeg: number) {
  const o1 = polar(rOuter, startDeg);
  const o2 = polar(rOuter, endDeg);
  const i1 = polar(rInner, endDeg);
  const i2 = polar(rInner, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${o1.x} ${o1.y} A ${rOuter} ${rOuter} 0 ${large} 1 ${o2.x} ${o2.y} L ${i1.x} ${i1.y} A ${rInner} ${rInner} 0 ${large} 0 ${i2.x} ${i2.y} Z`;
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
// font-size — used only to estimate whether a given word will fit the
// space it's being placed in, not for precise layout.
const AVG_CHAR_WIDTH_EM = 0.58;

/** Core ring (5 wide, 72°-each wedges) — plenty of room for a short word
 * sitting upright at mid-radius, no rotation needed. */
function CoreWedgeLabel({ text, color, startDeg, endDeg }: { text: string; color: string; startDeg: number; endDeg: number }) {
  const mid = (startDeg + endDeg) / 2;
  const pt = polar((R0 + R1) / 2, mid);
  return (
    <text
      x={pt.x}
      y={pt.y}
      textAnchor="middle"
      dominantBaseline="middle"
      fill={labelColorFor(color)}
      className="pointer-events-none select-none text-[17px] font-semibold"
    >
      {text}
    </text>
  );
}

/** Secondary ring label — follows the arc (tangent to the circle), the
 * same trick clock-face numerals use. Anchored at its own center point, so
 * flipping it 180° for the bottom half only changes reading direction,
 * never its position. */
function ArcLabel({
  text,
  color,
  startDeg,
  endDeg,
  labelR,
}: {
  text: string;
  color: string;
  startDeg: number;
  endDeg: number;
  labelR: number;
}) {
  const mid = (startDeg + endDeg) / 2;
  const pt = polar(labelR, mid);
  const flip = mid > 90 && mid < 270;
  const rotate = round2(flip ? mid + 180 : mid);
  const span = endDeg - startDeg;
  const arcLength = (labelR * (span * Math.PI)) / 180;
  const fontForSpan = span * 0.6;
  const fontForWordLength = arcLength / (Math.max(text.length, 1) * AVG_CHAR_WIDTH_EM);
  const fontSize = round2(Math.max(8, Math.min(13, fontForSpan, fontForWordLength)));
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

/** Tertiary ring label — these wedges are only 7.2° wide (10 per core), far
 * too narrow for text to follow the arc, but each wedge is nice and deep
 * radially. So the label runs outward along the wedge's own spoke instead
 * (rotated to point away from center), giving it the wedge's full radial
 * depth to work with rather than its cramped angular width. Wedges whose
 * outward direction would render upside-down (the left half of the wheel)
 * flip to read inward instead, staying upright either way. */
function RadialLabel({
  text,
  color,
  startDeg,
  endDeg,
  rInner,
  rOuter,
}: {
  text: string;
  color: string;
  startDeg: number;
  endDeg: number;
  rInner: number;
  rOuter: number;
}) {
  const mid = (startDeg + endDeg) / 2;
  const pt = polar((rInner + rOuter) / 2, mid);
  const flip = mid > 180 && mid < 360;
  const rotate = round2(flip ? mid + 90 : mid - 90);
  const radialLength = rOuter - rInner;
  const fontSize = round2(Math.max(7, Math.min(12, radialLength / (Math.max(text.length, 1) * AVG_CHAR_WIDTH_EM))));
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

/** Interactive 3-tier feelings wheel — Fearful/Disgusted/Happy/Sad/Angry at
 * the center, tap one to reveal its 5 more specific secondary feelings and
 * their 10 even-more-specific tertiary feelings, stacked around that same
 * slice (the other four cores stay collapsed). Tap any visible wedge —
 * core, secondary, or tertiary — to log it. Logged moods are saved
 * separately from journal entries (see logMoodCheckIn in local-journal.ts)
 * but still count toward mood patterns/calendar, which resolve colors by
 * core id only — see moods.ts — so every tap here logs under its core id
 * regardless of which ring was tapped, keeping full compatibility with
 * MoodPicker's own (unrelated) short list and existing logged history.
 * Deliberately a distinct, wheel-shaped interaction from MoodPicker's pill
 * chips, which stay dedicated to tagging a journal entry while writing. */
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
  onLogged?: () => void;
}) {
  const [expandedId, setExpandedId] = useState<CoreEmotionId | null>(null);
  const [logged, setLogged] = useState<{ label: string; color: string } | null>(null);

  const expanded: WheelCore | null = EMOTION_WHEEL.find((c) => c.id === expandedId) ?? null;

  async function log(coreId: CoreEmotionId, flashLabel: string, flashColor: string) {
    await logMoodCheckIn(userId, [coreId]);
    setLogged({ label: flashLabel, color: flashColor });
    onLogged?.();
    window.setTimeout(() => {
      setLogged(null);
      setExpandedId(null);
    }, 1100);
  }

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 440 440"
        className="w-full max-w-[480px] drop-shadow-[0_8px_20px_rgba(18,53,67,0.12)]"
        role="img"
        aria-label={dict.wheelPrompt}
      >
        {/* Wedges and labels render in two separate passes — all paths, then
            all labels — rather than interleaved per wedge, so a label that
            overflows its own wedge's space never gets visually cropped by
            the next wedge's opaque fill painting over it. */}
        {EMOTION_WHEEL.map((core, i) => {
          const startDeg = i * CORE_SLICE;
          const endDeg = startDeg + CORE_SLICE;
          const isExpanded = core.id === expandedId;
          const secondarySlice = CORE_SLICE / core.secondaries.length;
          const tertiarySlice = CORE_SLICE / (core.secondaries.length * 2);
          return (
            <g key={core.id}>
              <path
                d={wedgePath(R0, R1, startDeg, endDeg)}
                fill={core.colorCore}
                stroke="white"
                strokeWidth={2}
                className="cursor-pointer transition-opacity hover:opacity-80 active:opacity-80"
                onClick={() => setExpandedId(isExpanded ? null : core.id)}
              />
              {isExpanded &&
                core.secondaries.map((secondary, si) => {
                  const sStart = startDeg + si * secondarySlice;
                  const sEnd = sStart + secondarySlice;
                  const sLabel = locale === "ar" ? secondary.labelAr : secondary.label;
                  return (
                    <path
                      key={secondary.label}
                      d={wedgePath(R1, R2, sStart, sEnd)}
                      fill={core.colorSecondary}
                      stroke="white"
                      strokeWidth={1.5}
                      className="cursor-pointer transition-opacity hover:opacity-80 active:opacity-80"
                      onClick={() => log(core.id, sLabel, core.colorSecondary)}
                    />
                  );
                })}
              {isExpanded &&
                core.secondaries.flatMap((secondary, si) =>
                  secondary.tertiary.map((leaf, ti) => {
                    const tStart = startDeg + (si * 2 + ti) * tertiarySlice;
                    const tEnd = tStart + tertiarySlice;
                    const tLabel = locale === "ar" ? leaf.labelAr : leaf.label;
                    return (
                      <path
                        key={leaf.label}
                        d={wedgePath(R2, R3, tStart, tEnd)}
                        fill={core.colorTertiary}
                        stroke="white"
                        strokeWidth={1}
                        className="cursor-pointer transition-opacity hover:opacity-80 active:opacity-80"
                        onClick={() => log(core.id, tLabel, core.colorTertiary)}
                      />
                    );
                  }),
                )}
            </g>
          );
        })}

        <circle cx={CX} cy={CY} r={R0 - 4} className="fill-white stroke-brand-100" strokeWidth={2} />

        {EMOTION_WHEEL.map((core, i) => {
          const startDeg = i * CORE_SLICE;
          const endDeg = startDeg + CORE_SLICE;
          const isExpanded = core.id === expandedId;
          const secondarySlice = CORE_SLICE / core.secondaries.length;
          const tertiarySlice = CORE_SLICE / (core.secondaries.length * 2);
          const coreLabel = locale === "ar" ? core.labelAr : core.label;
          return (
            <g key={core.id}>
              <CoreWedgeLabel text={coreLabel} color={core.colorCore} startDeg={startDeg} endDeg={endDeg} />
              {isExpanded &&
                core.secondaries.map((secondary, si) => {
                  const sStart = startDeg + si * secondarySlice;
                  const sEnd = sStart + secondarySlice;
                  const sLabel = locale === "ar" ? secondary.labelAr : secondary.label;
                  return (
                    <ArcLabel
                      key={secondary.label}
                      text={sLabel}
                      color={core.colorSecondary}
                      startDeg={sStart}
                      endDeg={sEnd}
                      labelR={(R1 + R2) / 2}
                    />
                  );
                })}
              {isExpanded &&
                core.secondaries.flatMap((secondary, si) =>
                  secondary.tertiary.map((leaf, ti) => {
                    const tStart = startDeg + (si * 2 + ti) * tertiarySlice;
                    const tEnd = tStart + tertiarySlice;
                    const tLabel = locale === "ar" ? leaf.labelAr : leaf.label;
                    return (
                      <RadialLabel
                        key={leaf.label}
                        text={tLabel}
                        color={core.colorTertiary}
                        startDeg={tStart}
                        endDeg={tEnd}
                        rInner={R2}
                        rOuter={R3}
                      />
                    );
                  }),
                )}
            </g>
          );
        })}

        {expanded && (
          <foreignObject x={CX - R0 + 4} y={CY - R0 + 4} width={(R0 - 4) * 2} height={(R0 - 4) * 2}>
            <button
              type="button"
              onClick={() => setExpandedId(null)}
              className="flex h-full w-full items-center justify-center rounded-full"
              aria-label={dict.wheelBack}
            >
              {locale === "ar" ? (
                <ChevronRight className="h-5 w-5 text-ink/40" strokeWidth={2} />
              ) : (
                <ChevronLeft className="h-5 w-5 text-ink/40" strokeWidth={2} />
              )}
            </button>
          </foreignObject>
        )}
      </svg>

      <div className="mt-5 flex min-h-[4.5rem] flex-col items-center gap-2 text-center">
        {logged ? (
          <p className="animate-pop-in flex items-center gap-2 text-lg font-medium text-brand-700">
            <span className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ backgroundColor: logged.color }} />
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
