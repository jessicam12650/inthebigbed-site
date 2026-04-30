"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type SheetState = "peek" | "half" | "full";

const PEEK_PX = 130; // visible height in peek (handle + count + chips)
const HALF_VH = 50;
const FULL_VH = 90;

type Props = {
  state: SheetState;
  onStateChange: (s: SheetState) => void;
  // Always-visible row at the top (count + filter chips).
  peek: ReactNode;
  // Scrollable content inside the sheet, visible at half/full states.
  children: ReactNode;
  // Optional ref into the scrollable content for focus-management on expand.
  expandedRef?: React.Ref<HTMLDivElement>;
};

// Bottom sheet for the mobile places page. Three snap points: peek (small
// strip at the bottom), half (~50% of viewport), full (~90%). Drag the
// handle vertically to slide between states; tap or Enter on the handle
// cycles peek → half → full → peek. Esc collapses to peek.
//
// Implementation note: the sheet's height itself is what changes between
// states (not a translateY on a fixed-height element). This means the
// inner scroll container has a bounded height that matches the visible
// portion, so children that exceed that height get a real `overflow-y`
// scroll inside the sheet — required for grouped venue cards (Derek's,
// Rudy's, etc.) that list multiple locations.
export default function BottomSheet({ state, onStateChange, peek, children, expandedRef }: Props) {
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const [dragHeight, setDragHeight] = useState<number | null>(null);

  function vhPx(): number {
    return typeof window === "undefined" ? 800 : window.innerHeight;
  }

  function stateToHeightPx(s: SheetState): number {
    const vh = vhPx();
    if (s === "full") return (FULL_VH * vh) / 100;
    if (s === "half") return (HALF_VH * vh) / 100;
    return PEEK_PX;
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state !== "peek") {
        e.stopPropagation();
        onStateChange("peek");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, onStateChange]);

  function onTouchStart(e: React.TouchEvent) {
    dragRef.current = {
      startY: e.touches[0].clientY,
      startHeight: stateToHeightPx(state),
    };
    setDragHeight(dragRef.current.startHeight);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!dragRef.current) return;
    // Dragging up shrinks Y → grows the sheet.
    const delta = dragRef.current.startY - e.touches[0].clientY;
    const proposed = dragRef.current.startHeight + delta;
    const min = PEEK_PX;
    const max = (FULL_VH * vhPx()) / 100;
    setDragHeight(Math.max(min, Math.min(max, proposed)));
  }

  function onTouchEnd() {
    if (!dragRef.current) return;
    const final = dragHeight ?? dragRef.current.startHeight;
    const candidates: Array<[SheetState, number]> = [
      ["full", stateToHeightPx("full")],
      ["half", stateToHeightPx("half")],
      ["peek", stateToHeightPx("peek")],
    ];
    let best: SheetState = state;
    let bestDist = Infinity;
    for (const [s, h] of candidates) {
      const d = Math.abs(h - final);
      if (d < bestDist) {
        bestDist = d;
        best = s;
      }
    }
    onStateChange(best);
    dragRef.current = null;
    setDragHeight(null);
  }

  function cycleState() {
    if (state === "peek") onStateChange("half");
    else if (state === "half") onStateChange("full");
    else onStateChange("peek");
  }

  function onHandleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      cycleState();
    }
  }

  // While dragging we drive height in px from JS (no transition for snappy
  // feel). Otherwise we use vh-based CSS so the sheet renders correctly on
  // first paint without needing window measurements.
  const heightStyle: React.CSSProperties =
    dragHeight !== null
      ? { height: `${dragHeight}px`, transition: "none" }
      : state === "full"
        ? { height: `${FULL_VH}vh` }
        : state === "half"
          ? { height: `${HALF_VH}vh` }
          : { height: `${PEEK_PX}px` };

  return (
    <div
      role="dialog"
      aria-label="Venue list"
      className="fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl border-t border-ink/10 bg-cream shadow-[0_-8px_32px_rgba(0,0,0,0.18)] md:hidden"
      style={{
        willChange: "height",
        transitionProperty: "height",
        transitionDuration: "260ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        ...heightStyle,
      }}
    >
      {/* Handle is its own touch target — sits above the scrollable content
       * so users can always grab it to drag the sheet, even when the body
       * is mid-scroll. `touch-none` prevents the browser from claiming the
       * gesture for native scroll. */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Drag to expand venue list"
        aria-expanded={state !== "peek"}
        onClick={cycleState}
        onKeyDown={onHandleKeyDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="shrink-0 cursor-grab touch-none select-none px-4 pt-2.5 pb-2 active:cursor-grabbing"
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-ink/25" />
      </div>
      <div className="shrink-0 px-4 pb-2">{peek}</div>
      {/* min-h-0 + flex-1 lets this container shrink to the remaining sheet
       * height; overflow-y-auto then engages because the sheet's outer
       * height is now bounded to the current state (not always 90vh). */}
      <div
        ref={expandedRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6"
      >
        {children}
      </div>
    </div>
  );
}
