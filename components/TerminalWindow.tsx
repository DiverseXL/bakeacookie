"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────────
   Line types for syntax coloring
───────────────────────────────────────────────────────────────── */
export type LineKind =
  | "prompt"
  | "success"
  | "accent"
  | "muted"
  | "normal"
  | "blank";

export interface TerminalLine {
  kind: LineKind;
  text: string;
}

/* ─────────────────────────────────────────────────────────────────
   Light-theme color palette
   Background: #F4F4F0 (warm light gray, distinct from cream #FFF9F0)
   Text: dark navy/charcoal for readability
───────────────────────────────────────────────────────────────── */
const LIGHT_COLORS: Record<LineKind, string> = {
  prompt:  "#B8860B",   // dark gold — $ command line, high contrast on light
  success: "#16A34A",   // dark green — ✔ lines, readable on light
  accent:  "#1D4ED8",   // deep blue — program IDs, key values
  muted:   "#6B7280",   // medium gray — secondary info
  normal:  "#1E293B",   // dark charcoal — standard output
  blank:   "transparent",
};

/* ─────────────────────────────────────────────────────────────────
   Command sequences — REAL captured output
───────────────────────────────────────────────────────────────── */
interface CommandSequence {
  label: string;
  lines: TerminalLine[];
}

const COMMANDS: CommandSequence[] = [
  {
    label: "DEPLOY",
    lines: [
      { kind: "prompt",  text: "$ bake deploy" },
      { kind: "normal",  text: "Building recipe_book (anchor build)" },
      { kind: "normal",  text: "Deploying recipe_book to cookie" },
      { kind: "normal",  text: "Registered deploy in Recipe Book (entry #0)" },
      { kind: "success", text: "✔ Deployed to cookie (entry #0)" },
      { kind: "blank",   text: "" },
      { kind: "accent",  text: "Program ID: 56Vj61zFW4hHV6wdjnisrHtVwWDqyjixjpBgnoRJvzxL" },
      { kind: "muted",   text: "Entry index: 0" },
    ],
  },
  {
    label: "ROLLBACK",
    lines: [
      { kind: "prompt",  text: "$ bake rollback" },
      { kind: "normal",  text: "Found 2 deploy(s) in Recipe Book" },
      { kind: "normal",  text: "Checking out 81445ce8" },
      { kind: "normal",  text: "Building recipe_book (anchor build)" },
      { kind: "normal",  text: "Deploying recipe_book to cookie" },
      { kind: "normal",  text: "Registered deploy in Recipe Book (entry #2)" },
      { kind: "normal",  text: "Restoring original git state" },
      { kind: "success", text: "✔ Restored to master" },
      { kind: "blank",   text: "" },
      { kind: "muted",   text: "Rolled back to: #1 (81445ce8)" },
      { kind: "muted",   text: "New entry: #2" },
    ],
  },
  {
    label: "VERIFY",
    lines: [
      { kind: "prompt",  text: "$ bake prove" },
      { kind: "muted",   text: "Entry #0" },
      { kind: "normal",  text: "Recorded hash: c1367bd7f4e02793b55..." },
      { kind: "normal",  text: "On-chain hash:  c1367bd7f4e02793b55..." },
      { kind: "success", text: "✔ On-chain bytecode matches Recipe Book entry #0" },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────
   Timing constants (ms)
───────────────────────────────────────────────────────────────── */
const LINE_STAGGER   = 120;   // delay between each line appearing
const PAUSE_AFTER    = 2500;  // hold completed output before transitioning
const CLEAR_DURATION = 300;   // fade-out duration

/* ─────────────────────────────────────────────────────────────────
   prefers-reduced-motion hook
───────────────────────────────────────────────────────────────── */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/* ─────────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────────── */
export default function TerminalWindow({ className = "" }: { className?: string }) {
  const reducedMotion = usePrefersReducedMotion();

  // Which command sequence is active (0, 1, 2)
  const [activeIdx, setActiveIdx] = useState(0);
  // How many lines of the current sequence are visible
  const [visibleCount, setVisibleCount] = useState(0);
  // Fade state for transitions
  const [fading, setFading] = useState(false);
  // Whether animation is running (false for reduced motion → show all)
  const animating = !reducedMotion;

  // Refs for cleanup
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback(
    (fn: () => void, delay: number) => {
      const id = setTimeout(fn, delay);
      timersRef.current.push(id);
      return id;
    },
    [],
  );

  // ── Animation loop ──
  useEffect(() => {
    if (!animating) {
      // Reduced motion: show first command fully, no animation
      setActiveIdx(0);
      setVisibleCount(COMMANDS[0].lines.length);
      return;
    }

    let cancelled = false;

    function runSequence(cmdIdx: number) {
      if (cancelled) return;
      const cmd = COMMANDS[cmdIdx];
      setActiveIdx(cmdIdx);
      setVisibleCount(0);
      setFading(false);

      // Stagger lines in
      let lineIdx = 0;
      function showNextLine() {
        if (cancelled) return;
        lineIdx++;
        setVisibleCount(lineIdx);
        if (lineIdx < cmd.lines.length) {
          schedule(showNextLine, LINE_STAGGER);
        } else {
          // All lines shown — pause, then fade out and advance
          schedule(() => {
            if (cancelled) return;
            setFading(true);
            schedule(() => {
              if (cancelled) return;
              const nextIdx = (cmdIdx + 1) % COMMANDS.length;
              runSequence(nextIdx);
            }, CLEAR_DURATION);
          }, PAUSE_AFTER);
        }
      }

      // Start first line after a short beat
      schedule(showNextLine, 200);
    }

    runSequence(0);

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [animating, clearTimers, schedule]);

  // ── Static (reduced-motion) content ──
  const staticLines = useMemo(() => COMMANDS[0].lines, []);

  // ── Animated content ──
  const currentCmd = COMMANDS[activeIdx];
  const shownLines = animating
    ? currentCmd.lines.slice(0, visibleCount)
    : staticLines;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* ── Tab row — shows which command is playing ── */}
      <div className="flex items-center gap-1" role="tablist" aria-label="Command output">
        {COMMANDS.map((cmd, i) => (
          <span
            key={cmd.label}
            role="tab"
            aria-selected={i === activeIdx}
            className="rounded-pill border-2 px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest transition-all duration-300"
            style={{
              borderColor: i === activeIdx ? "rgba(11,31,58,0.9)" : "rgba(11,31,58,0.15)",
              background: i === activeIdx ? "rgba(11,31,58,0.9)" : "transparent",
              color: i === activeIdx ? "#FFFFFF" : "rgba(11,31,58,0.45)",
            }}
          >
            {cmd.label}
          </span>
        ))}
      </div>

      {/* ── Terminal window — light theme ── */}
      <div
        className="w-full overflow-hidden"
        style={{
          background: "#F4F4F0",
          border: "3px solid rgba(11,31,58,0.9)",
          borderRadius: "1.25rem",
          boxShadow:
            "0 8px 0 0 rgba(11,31,58,0.78), 0 24px 60px rgba(11,31,58,0.18), inset 0 3px 0 rgba(255,255,255,0.9)",
        }}
      >
        {/* Title bar — slightly darker than body */}
        <div
          className="flex items-center gap-3 px-5 py-3.5"
          style={{
            background: "#E8E8E4",
            borderBottom: "1px solid rgba(11,31,58,0.08)",
          }}
        >
          {/* macOS traffic dots — muted for light theme */}
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: "#FF5F57" }}
            aria-hidden="true"
          />
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: "#FEBC2E" }}
            aria-hidden="true"
          />
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: "#28C840" }}
            aria-hidden="true"
          />

          {/* Command name in header */}
          <span
            className="ml-3 font-mono text-xs font-semibold"
            style={{ color: "#6B7280" }}
          >
            {currentCmd.label.toLowerCase()}
          </span>
        </div>

        {/* Output body — generous padding, no overflow */}
        <pre
          className="px-6 py-6 sm:px-8 sm:py-7 text-sm leading-[1.85] min-h-[280px] sm:min-h-[320px]"
          style={{
            fontFamily: "var(--font-mono, 'JetBrains Mono', 'Fira Code', ui-monospace, monospace)",
            margin: 0,
            overflowWrap: "break-word",
            wordBreak: "break-word",
          }}
        >
          <div
            className="transition-opacity duration-300"
            style={{ opacity: fading ? 0 : 1 }}
          >
            {shownLines.map((line, i) =>
              line.kind === "blank" ? (
                <br key={`${activeIdx}-${i}`} />
              ) : (
                <span
                  key={`${activeIdx}-${i}`}
                  className="block"
                  style={{ color: LIGHT_COLORS[line.kind] }}
                >
                  {line.text}
                </span>
              ),
            )}

            {/* Blinking cursor at the end */}
            {animating && visibleCount > 0 && visibleCount <= currentCmd.lines.length && !fading && (
              <span className="inline-block w-[2px] h-[1.1em] ml-0.5 align-middle terminal-cursor" />
            )}
          </div>
        </pre>
      </div>
    </div>
  );
}
