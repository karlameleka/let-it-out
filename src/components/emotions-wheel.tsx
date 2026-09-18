"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CORE_EMOTIONS, getSecondaryEmotions, type CoreEmotionId, type Mood } from "@/lib/moods";
import { logMoodCheckIn } from "@/lib/local-journal";
import type { Locale } from "@/lib/i18n/locale";

const CX = 150;
const CY = 150;
const R_OUTER = 150;
const R_INNER = 56;

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

function wedgePath(startDeg: number, endDeg: number) {
  const o1 = polar(R_OUTER, startDeg);
  const o2 = polar(R_OUTER, endDeg);
  const i1 = polar(R_INNER, endDeg);
  const i2 = polar(R_INNER, startDeg);
  return `M ${o1.x} ${o1.y} A ${R_OUTER} ${R_OUTER} 0 0 1 ${o2.x} ${o2.y} L ${i1.x} ${i1.y} A ${R_INNER} ${R_INNER} 0 0 0 ${i2.x} ${i2.y} Z`;
}

const DARK_LABEL = "#123543"; // brand-900, matches the rest of the app's ink color

/** Some secondary shades run nearly black (e.g. "Calm" at #0C2027) — dark
 * text on those is unreadable, so pick white or the app's ink color by the
 * wedge's own luminance rather than hard-coding one text color for all. */
function labelColorFor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 0.45 ? "#ffffff" : DARK_LABEL;
}

/** The 6 core wedges are wide (60° each) — plenty of room for a short word
 * sitting upright at a fixed mid-radius, no rotation needed. */
function CoreWedgeLabel({ text, color, startDeg, endDeg }: { text: string; color: string; startDeg: number; endDeg: number }) {
  const mid = (startDeg + endDeg) / 2;
  const pt = polar((R_INNER + R_OUTER) / 2, mid);
  return (
    <text
      x={pt.x}
      y={pt.y}
      textAnchor="middle"
      dominantBaseline="middle"
      fill={labelColorFor(color)}
      className="pointer-events-none select-none text-[12px] font-semibold"
    >
      {text}
    </text>
  );
}

/** Secondary wedges can be thin (up to 14 for "happy"), so the label follows
 * the arc (tangent to the circle) instead — the same trick clock-face
 * numerals use. The label is always centered on its point (anchor="middle"),
 * so flipping it 180° for the bottom half only changes reading direction,
 * never its position — unlike a radial (spoke-like) label, this can't come
 * out upside-down or drift to the wrong side of the wedge. */
function SecondaryWedgeLabel({ text, color, startDeg, endDeg }: { text: string; color: string; startDeg: number; endDeg: number }) {
  const mid = (startDeg + endDeg) / 2;
  const labelR = R_INNER + (R_OUTER - R_INNER) * 0.62;
  const pt = polar(labelR, mid);
  const flip = mid > 90 && mid < 270;
  const rotate = round2(flip ? mid + 180 : mid);
  return (
    <text
      x={pt.x}
      y={pt.y}
      transform={`rotate(${rotate} ${pt.x} ${pt.y})`}
      textAnchor="middle"
      dominantBaseline="middle"
      fill={labelColorFor(color)}
      className="pointer-events-none select-none text-[7px] font-medium"
    >
      {text}
    </text>
  );
}

/** Interactive radial emotions wheel — tap a core feeling to reveal its more
 * specific secondary feelings arranged around the same circle, tap one to
 * log it. Logged moods are saved separately from journal entries (see
 * logMoodCheckIn in local-journal.ts) but still count toward mood patterns.
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
  const [openCore, setOpenCore] = useState<CoreEmotionId | null>(null);
  const [logged, setLogged] = useState<string | null>(null);

  const coreSlice = 360 / CORE_EMOTIONS.length;
  const secondary: Mood[] = openCore ? getSecondaryEmotions(openCore) : [];
  const secondarySlice = secondary.length > 0 ? 360 / secondary.length : 0;
  const openCoreMeta = CORE_EMOTIONS.find((c) => c.id === openCore) ?? null;

  async function log(moodIds: string[], flashLabel: string) {
    await logMoodCheckIn(userId, moodIds);
    setLogged(flashLabel);
    onLogged?.();
    window.setTimeout(() => {
      setLogged(null);
      setOpenCore(null);
    }, 1100);
  }

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 300" className="w-full max-w-[280px]" role="img" aria-label={dict.wheelPrompt}>
        {openCore === null
          ? CORE_EMOTIONS.map((core, i) => {
              const startDeg = i * coreSlice;
              const endDeg = startDeg + coreSlice;
              const label = locale === "ar" ? core.labelAr : core.label;
              return (
                <g key={core.id}>
                  <path
                    d={wedgePath(startDeg, endDeg)}
                    fill={core.color}
                    stroke="white"
                    strokeWidth={2}
                    className="cursor-pointer transition-opacity hover:opacity-80 active:opacity-80"
                    onClick={() => setOpenCore(core.id)}
                  />
                  <CoreWedgeLabel text={label} color={core.color} startDeg={startDeg} endDeg={endDeg} />
                </g>
              );
            })
          : secondary.map((mood, i) => {
              const startDeg = i * secondarySlice;
              const endDeg = startDeg + secondarySlice;
              const label = locale === "ar" ? mood.labelAr : mood.label;
              return (
                <g key={mood.id}>
                  <path
                    d={wedgePath(startDeg, endDeg)}
                    fill={mood.color}
                    stroke="white"
                    strokeWidth={2}
                    className="cursor-pointer transition-opacity hover:opacity-80 active:opacity-80"
                    onClick={() => log([openCore, mood.id], label)}
                  />
                  <SecondaryWedgeLabel text={label} color={mood.color} startDeg={startDeg} endDeg={endDeg} />
                </g>
              );
            })}

        <circle cx={CX} cy={CY} r={R_INNER - 4} className="fill-white" />

        {openCoreMeta && (
          <foreignObject x={CX - R_INNER + 4} y={CY - R_INNER + 4} width={(R_INNER - 4) * 2} height={(R_INNER - 4) * 2}>
            <button
              type="button"
              onClick={() => setOpenCore(null)}
              className="flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-full text-center"
              aria-label={dict.wheelBack}
            >
              {locale === "ar" ? (
                <ChevronRight className="h-4 w-4 text-ink/40" strokeWidth={2} />
              ) : (
                <ChevronLeft className="h-4 w-4 text-ink/40" strokeWidth={2} />
              )}
              <span className="text-xs font-semibold text-brand-900">
                {locale === "ar" ? openCoreMeta.labelAr : openCoreMeta.label}
              </span>
            </button>
          </foreignObject>
        )}
      </svg>

      <div className="mt-3 min-h-[2.5rem] text-center">
        {logged ? (
          <p className="animate-pop-in text-sm font-medium text-brand-700">{dict.wheelLogged}: {logged}</p>
        ) : openCoreMeta ? (
          <>
            <p className="text-sm text-ink/60">{dict.wheelPickSpecific.replace("{core}", locale === "ar" ? openCoreMeta.labelAr : openCoreMeta.label)}</p>
            <button
              type="button"
              onClick={() => log([openCoreMeta.id], locale === "ar" ? openCoreMeta.labelAr : openCoreMeta.label)}
              className="mt-1 text-sm font-medium text-brand-600 link-grow w-fit"
            >
              {dict.wheelJustLog.replace("{core}", locale === "ar" ? openCoreMeta.labelAr : openCoreMeta.label)}
            </button>
          </>
        ) : (
          <p className="text-sm text-ink/50">{dict.wheelPrompt}</p>
        )}
      </div>
    </div>
  );
}
