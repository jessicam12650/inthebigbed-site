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
export default function BottomSheet({ state, onStateChange, peek, children, expandedRef }: Props) {
  const dragRef = useRef<{ startY: number; startTranslate: number } | null>(null);
  const [dragTranslate, setDragTranslate] = useState<number | null>(null);

  function vhPx(): number {
    return typeof window === "undefined" ? 800 : window.innerHeight;
  }

  function stateToTranslate(s: SheetState): number {
    const vh = vhPx();
    const sheetHeight = (FULL_VH * vh) / 100;
    if (s === "full") return 0;
    if (s === "half") return sheetHeight - (HALF_VH * vh) / 100;
    return sheetHeight - PEEK_PX;
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
      startTranslate: stateToTranslate(state),
    };
    setDragTranslate(dragRef.current.startTranslate);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!dragRef.current) return;
    const delta = e.touches[0].clientY - dragRef.current.startY;
    const proposed = dragRef.current.startTranslate + delta;
    const max = stateToTranslate("peek");
    const min = stateToTranslate("full");
    setDragTranslate(Math.max(min, Math.min(max, proposed)));
  }

  function onTouchEnd() {
    if (!dragRef.current) return;
    const final = dragTranslate ?? dragRef.current.startTranslate;
    const candidates: SheetState[] = ["full", "half", "peek"];
    let best: SheetState = state;
    let bestDist = Infinity;
    for (const s of candidates) {
      const d = Math.abs(stateToTranslate(s) - final);
      if (d < bestDist) {
        bestDist = d;
        best = s;
      }
    }
    onStateChange(best);
    dragRef.current = null;
    setDragTranslate(null);
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

  // While dragging we drive the transform from JS in px (no transition).
  // Otherwise we use vh-based CSS so the sheet renders correctly on first
  // paint without needing window measurements.
  const transformStyle: React.CSSProperties =
    dragTranslate !== null
      ? { transform: `translateY(${dragTranslate}px)`, transition: "none" }
      : state === "full"
        ? { transform: "translateY(0)" }
        : state === "half"
          ? { transform: `translateY(${FULL_VH - HALF_VH}vh)` }
          : { transform: `translateY(calc(${FULL_VH}vh - ${PEEK_PX}px))` };

  return (
    <div
      role="dialog"
      aria-label="Venue list"
      className="fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl border-t border-ink/10 bg-cream shadow-[0_-8px_32px_rgba(0,0,0,0.18)] md:hidden"
      style={{
        height: `${FULL_VH}vh`,
        willChange: "transform",
        transitionProperty: "transform",
        transitionDuration: "260ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        ...transformStyle,
      }}
    >
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
      <div ref={expandedRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
        {children}
      </div>
    </div>
  );
}
