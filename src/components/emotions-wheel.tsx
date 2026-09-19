"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CORE_EMOTIONS, getSecondaryEmotions, type CoreEmotionId, type Mood } from "@/lib/moods";
import { logMoodCheckIn } from "@/lib/local-journal";
import { Button } from "@/components/ui";
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
      className="pointer-events-none select-none text-[16px] font-semibold"
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
// Rough average glyph advance width for Inter Semibold, as a fraction of
// font-size — used only to estimate whether a given word will fit the arc
// it's being placed on, not for precise layout.
const AVG_CHAR_WIDTH_EM = 0.58;

function SecondaryWedgeLabel({ text, color, startDeg, endDeg }: { text: string; color: string; startDeg: number; endDeg: number }) {
  const mid = (startDeg + endDeg) / 2;
  // Pushed out to 0.78 (was 0.62) — closer to the rim means more
  // circumferential room per wedge, which matters most for the crowded
  // 14-wedge "Happy" ring, without the text's own height reaching R_OUTER.
  const labelR = R_INNER + (R_OUTER - R_INNER) * 0.78;
  const pt = polar(labelR, mid);
  const flip = mid > 90 && mid < 270;
  const rotate = round2(flip ? mid + 180 : mid);
  const span = endDeg - startDeg;
  // Two independent ceilings, whichever is stricter wins: how wide the
  // wedge itself is (span-based, as before — keeps short words from
  // ballooning in a roomy wedge), and how much arc length this specific
  // word actually needs at labelR (character-count-based — the part that
  // was missing before, which is why long words like "Passionate" or
  // "Confident" still overflowed a merely-span-sized font). A wedge with
  // few, short words is limited by the first; the crowded Happy ring's
  // longer words are limited by the second.
  const arcLength = labelR * (span * Math.PI) / 180;
  const fontForSpan = span * 0.44;
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
  const [logged, setLogged] = useState<{ label: string; color: string } | null>(null);

  const coreSlice = 360 / CORE_EMOTIONS.length;
  const secondary: Mood[] = openCore ? getSecondaryEmotions(openCore) : [];
  const secondarySlice = secondary.length > 0 ? 360 / secondary.length : 0;
  const openCoreMeta = CORE_EMOTIONS.find((c) => c.id === openCore) ?? null;

  async function log(moodIds: string[], flashLabel: string, flashColor: string) {
    await logMoodCheckIn(userId, moodIds);
    setLogged({ label: flashLabel, color: flashColor });
    onLogged?.();
    window.setTimeout(() => {
      setLogged(null);
      setOpenCore(null);
    }, 1100);
  }

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 300" className="w-full max-w-[440px] drop-shadow-[0_8px_20px_rgba(18,53,67,0.12)]" role="img" aria-label={dict.wheelPrompt}>
        {/* Wedges and labels render in two separate passes — all paths, then
            all labels — rather than interleaved per wedge. A label can be
            wider than its own wedge's arc (long sub-emotion words in the
            crowded 14-wedge ring); interleaving would let the next wedge's
            opaque fill paint over — and visually crop — the previous
            label's overflow. Labels drawn last always stay on top. */}
        {openCore === null
          ? CORE_EMOTIONS.map((core, i) => {
              const startDeg = i * coreSlice;
              const endDeg = startDeg + coreSlice;
              return (
                <path
                  key={core.id}
                  d={wedgePath(startDeg, endDeg)}
                  fill={core.color}
                  stroke="white"
                  strokeWidth={2}
                  className="cursor-pointer transition-opacity hover:opacity-80 active:opacity-80"
                  onClick={() => setOpenCore(core.id)}
                />
              );
            })
          : secondary.map((mood, i) => {
              const startDeg = i * secondarySlice;
              const endDeg = startDeg + secondarySlice;
              const label = locale === "ar" ? mood.labelAr : mood.label;
              return (
                <path
                  key={mood.id}
                  d={wedgePath(startDeg, endDeg)}
                  fill={mood.color}
                  stroke="white"
                  strokeWidth={2}
                  className="cursor-pointer transition-opacity hover:opacity-80 active:opacity-80"
                  onClick={() => log([openCore, mood.id], label, mood.color)}
                />
              );
            })}

        <circle cx={CX} cy={CY} r={R_INNER - 4} className="fill-white stroke-brand-100" strokeWidth={2} />

        {openCore === null
          ? CORE_EMOTIONS.map((core, i) => {
              const startDeg = i * coreSlice;
              const endDeg = startDeg + coreSlice;
              const label = locale === "ar" ? core.labelAr : core.label;
              return <CoreWedgeLabel key={core.id} text={label} color={core.color} startDeg={startDeg} endDeg={endDeg} />;
            })
          : secondary.map((mood, i) => {
              const startDeg = i * secondarySlice;
              const endDeg = startDeg + secondarySlice;
              const label = locale === "ar" ? mood.labelAr : mood.label;
              return <SecondaryWedgeLabel key={mood.id} text={label} color={mood.color} startDeg={startDeg} endDeg={endDeg} />;
            })}

        {openCoreMeta && (
          <foreignObject x={CX - R_INNER + 4} y={CY - R_INNER + 4} width={(R_INNER - 4) * 2} height={(R_INNER - 4) * 2}>
            <button
              type="button"
              onClick={() => setOpenCore(null)}
              className="flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-full text-center"
              aria-label={dict.wheelBack}
            >
              {locale === "ar" ? (
                <ChevronRight className="h-5 w-5 text-ink/40" strokeWidth={2} />
              ) : (
                <ChevronLeft className="h-5 w-5 text-ink/40" strokeWidth={2} />
              )}
              <span className="text-base font-semibold text-brand-900">
                {locale === "ar" ? openCoreMeta.labelAr : openCoreMeta.label}
              </span>
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
        ) : openCoreMeta ? (
          <>
            <p className="text-base text-ink/60">{dict.wheelPickSpecific.replace("{core}", locale === "ar" ? openCoreMeta.labelAr : openCoreMeta.label)}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                log([openCoreMeta.id], locale === "ar" ? openCoreMeta.labelAr : openCoreMeta.label, openCoreMeta.color)
              }
              className="px-5 py-2 text-sm"
            >
              {dict.wheelJustLog.replace("{core}", locale === "ar" ? openCoreMeta.labelAr : openCoreMeta.label)}
            </Button>
          </>
        ) : (
          <p className="text-base text-ink/50">{dict.wheelPrompt}</p>
        )}
      </div>
    </div>
  );
}
