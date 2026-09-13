"use client";

import React from "react";
import TerminalWindow from "./TerminalWindow";

/**
 * Command Showcase section — wraps the animated terminal with
 * a section header and footer caption.
 *
 * The TerminalWindow component handles all animation internally:
 * sequential playback of bake deploy → bake rollback → bake prove
 * with line-by-line reveal, pause, fade, and loop.
 */
export default function CommandShowcase() {
  return (
    <section
      id="command-showcase"
      aria-labelledby="showcase-heading"
      className="w-full max-w-4xl px-5"
    >
      {/* Section header */}
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <h2
          id="showcase-heading"
          className="font-display text-3xl font-extrabold tracking-[-0.03em] text-navy sm:text-4xl"
        >
          See it in action
        </h2>
        <p className="max-w-xl font-body text-base text-ink/60">
          Real output. Real commands. No mockups.
        </p>
      </div>

      {/* The animated terminal window */}
      <TerminalWindow />

      {/* Footer note */}
      <p className="mt-5 text-center font-body text-xs text-ink/40">
        Output from a local Cookie Chain validator. Program ID preserved exactly from real deployment.
      </p>
    </section>
  );
}
