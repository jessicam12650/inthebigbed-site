"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";

export type SheetState = "peek" | "half" | "full";

const PEEK_PX = 130; // visible height in peek (handle + count + chips)
const HALF_DVH = 50;
const FULL_DVH = 90;

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
// strip at the bottom), half (~50% of viewport), full (~90%).
//
// Drag the sheet anywhere — handle, peek row, or the body. When dragging
// from the body, native scroll wins as long as the user isn't pulling away
// from a scroll boundary; only the boundary cases (atTop + drag-down,
// atBottom + drag-up) hijack the gesture for sheet drag.
//
// Heights use `dvh` so the sheet matches the dynamic viewport on iOS Safari
// (excluding the bottom toolbar). During drag we mutate `style.height`
// directly via a ref + rAF — avoids a React re-render per frame and keeps
// the gesture at 60fps even on older iPhones.
export default function BottomSheet({ state, onStateChange, peek, children, expandedRef }: Props) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  // Refs hold latest state/callback so the touch effect doesn't re-bind
  // listeners on every state change (causing dropped touches mid-drag).
  const stateRef = useRef(state);
  const onStateChangeRef = useRef(onStateChange);
  stateRef.current = state;
  onStateChangeRef.current = onStateChange;

  // Forward the body element to an external ref, if one was passed in.
  const setBodyRef = useCallback(
    (el: HTMLDivElement | null) => {
      bodyRef.current = el;
      if (!expandedRef) return;
      if (typeof expandedRef === "function") expandedRef(el);
      else (expandedRef as { current: HTMLDivElement | null }).current = el;
    },
    [expandedRef],
  );

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    const vhPx = () => (typeof window === "undefined" ? 800 : window.innerHeight);
    const stateHeight = (s: SheetState): number => {
      if (s === "full") return (FULL_DVH * vhPx()) / 100;
      if (s === "half") return (HALF_DVH * vhPx()) / 100;
      return PEEK_PX;
    };

    let drag:
      | { startY: number; startHeight: number; fromBody: boolean; bodyScrollAtStart: number }
      | null = null;
    let raf = 0;
    let lastHeight = 0;

    const INTERACTIVE_SELECTOR =
      'input, textarea, select, button, a, [role="button"], [contenteditable="true"], [data-no-drag]';

    const onStart = (e: TouchEvent) => {
      const target = e.target as Element | null;
      // Bail out if the gesture starts on an interactive element — we'd
      // otherwise steal taps that should focus an input or click a button.
      // The Element.closest call walks ancestors up to (and including) the
      // sheet root; the handle / peek / body containers themselves don't
      // match this selector, so drag still works from non-interactive areas.
      if (target?.closest?.(INTERACTIVE_SELECTOR)) {
        drag = null;
        return;
      }
      const fromBody = bodyRef.current?.contains(target as Node) ?? false;
      drag = {
        startY: e.touches[0].clientY,
        startHeight: stateHeight(stateRef.current),
        fromBody,
        bodyScrollAtStart: bodyRef.current?.scrollTop ?? 0,
      };
      lastHeight = drag.startHeight;
    };

    const onMove = (e: TouchEvent) => {
      if (!drag) return;
      const deltaY = drag.startY - e.touches[0].clientY; // up = positive

      // If the gesture started inside the scrollable body, let native scroll
      // handle it UNLESS we're at a scroll boundary that matches the drag
      // direction — that's when we hijack to drag the sheet.
      if (drag.fromBody) {
        const body = bodyRef.current;
        if (!body) return;
        const atTop = body.scrollTop <= 0;
        const atBottom = body.scrollTop + body.clientHeight >= body.scrollHeight - 1;
        const draggingDown = deltaY < 0;
        const draggingUp = deltaY > 0;
        const wantsSheetDrag =
          (draggingDown && atTop) ||
          (draggingUp && atBottom && stateRef.current !== "full");
        if (!wantsSheetDrag) return; // native scroll handles this
      }

      // Hijack: prevent the browser's scroll/overscroll bounce.
      e.preventDefault();
      const proposed = drag.startHeight + deltaY;
      const min = PEEK_PX;
      const max = (FULL_DVH * vhPx()) / 100;
      const clamped = Math.max(min, Math.min(max, proposed));

      // Skip the rAF if nothing changed to avoid spurious paints.
      if (Math.abs(clamped - lastHeight) < 0.5) return;
      lastHeight = clamped;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        sheet.style.transition = "none";
        sheet.style.height = `${clamped}px`;
      });
    };

    const onEnd = () => {
      if (!drag) return;
      cancelAnimationFrame(raf);
      const finalHeight = parseFloat(sheet.style.height) || drag.startHeight;
      const candidates: Array<[SheetState, number]> = [
        ["full", stateHeight("full")],
        ["half", stateHeight("half")],
        ["peek", stateHeight("peek")],
      ];
      let best: SheetState = stateRef.current;
      let bestDist = Infinity;
      for (const [s, h] of candidates) {
        const d = Math.abs(h - finalHeight);
        if (d < bestDist) {
          bestDist = d;
          best = s;
        }
      }
      // Restore CSS transition for the snap, then sync React state — the
      // state-driven inline style takes over and animates to the snap point.
      sheet.style.transition = "";
      sheet.style.height = "";
      onStateChangeRef.current(best);
      drag = null;
    };

    sheet.addEventListener("touchstart", onStart, { passive: true });
    sheet.addEventListener("touchmove", onMove, { passive: false });
    sheet.addEventListener("touchend", onEnd, { passive: true });
    sheet.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      sheet.removeEventListener("touchstart", onStart);
      sheet.removeEventListener("touchmove", onMove);
      sheet.removeEventListener("touchend", onEnd);
      sheet.removeEventListener("touchcancel", onEnd);
      cancelAnimationFrame(raf);
    };
  }, []);

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

  // CSS-driven height for snap states. Drag overrides this via inline style,
  // which is reset on touchend so the snap animates to the new state height.
  const heightStyle: React.CSSProperties =
    state === "full"
      ? { height: `${FULL_DVH}dvh` }
      : state === "half"
        ? { height: `${HALF_DVH}dvh` }
        : { height: `${PEEK_PX}px` };

  return (
    <div
      ref={sheetRef}
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
      {/* Handle is a tap target for cycle + a drag origin. touch-action:none
       * keeps the browser from claiming the gesture for native scroll. */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Drag to expand venue list"
        aria-expanded={state !== "peek"}
        onClick={cycleState}
        onKeyDown={onHandleKeyDown}
        className="shrink-0 cursor-grab select-none px-4 pt-2.5 pb-2 active:cursor-grabbing"
        style={{ touchAction: "none" }}
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-ink/25" />
      </div>
      {/* Peek row (count + chips) is also a sheet-drag origin. touch-action:
       * none lets the drag handler claim the gesture without the browser
       * trying to scroll. Chip taps still register as clicks. */}
      <div className="shrink-0 px-4 pb-2" style={{ touchAction: "none" }}>
        {peek}
      </div>
      {/* Body: native scroll. touch-action: pan-y allows vertical scroll;
       * the drag handler still hijacks at the scroll boundaries. */}
      <div
        ref={setBodyRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6"
        style={{ touchAction: "pan-y", WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>
    </div>
  );
}
