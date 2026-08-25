"use client";

import { useRef, useState } from "react";
import { hapticTap, hapticWarning } from "@/lib/haptics";

const THRESHOLD = 88;
const MAX_DRAG = 140;

/** Swipe-left-to-delete wrapper for a notification row. Dragging the child
 * far enough left and releasing permanently dismisses it (calls
 * `onDelete`, expected to hit `dismissNotification` and refresh); a short
 * drag springs back. Pointer Events cover touch + mouse in one handler set. */
export default function SwipeToDelete({
  onDelete,
  deleteLabel,
  children,
}: {
  onDelete: () => void;
  deleteLabel: string;
  children: React.ReactNode;
}) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [removing, setRemoving] = useState(false);
  const startX = useRef<number | null>(null);
  const armed = useRef(false);

  function handlePointerDown(e: React.PointerEvent) {
    if (removing) return;
    startX.current = e.clientX;
    setDragging(true);
    armed.current = false;
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (startX.current === null) return;
    const delta = e.clientX - startX.current;
    const clamped = Math.min(0, Math.max(delta, -MAX_DRAG));
    setDragX(clamped);
    if (clamped <= -THRESHOLD && !armed.current) {
      armed.current = true;
      hapticTap();
    } else if (clamped > -THRESHOLD) {
      armed.current = false;
    }
  }

  function finishDrag() {
    if (startX.current === null) return;
    startX.current = null;
    setDragging(false);
    if (armed.current) {
      hapticWarning();
      setRemoving(true);
      setDragX(-(MAX_DRAG + 60));
      setTimeout(onDelete, 160);
    } else {
      setDragX(0);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className="absolute inset-y-0 right-0 flex w-full items-center justify-end rounded-2xl bg-red-500 px-5 text-sm font-semibold text-white"
        aria-hidden
      >
        {deleteLabel}
      </div>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging ? "none" : "transform 180ms ease-out, opacity 160ms ease-out",
          opacity: removing ? 0 : 1,
          touchAction: "pan-y",
        }}
        className="relative bg-transparent"
      >
        {children}
      </div>
    </div>
  );
}
