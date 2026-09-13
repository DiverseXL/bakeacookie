import React from "react";

const FEATURES = [
  {
    icon: "⚡",
    title: "Sub-second deploys",
    body: "bake ships your program to the buffer and registers the deploy in the same breath. No waiting around.",
    id: "why-speed",
  },
  {
    icon: "⛓️",
    title: "On-chain history",
    body: "Every deploy writes a permanent Entry to the Recipe Book — commit hash, build hash, deployer, timestamp. Immutable. Public. Forever.",
    id: "why-history",
  },
  {
    icon: "↩️",
    title: "Rollback as a command",
    body: "Broke prod? `bake rollback` reads the on-chain history, picks the last good build, and re-deploys. One command, zero drama.",
    id: "why-rollback",
  },
];

export default function WhyBake() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4" aria-labelledby="why-bake-heading">
      <h2
        id="why-bake-heading"
        className="text-center font-display font-bold text-2xl text-navy mb-8 tracking-tight"
      >
        Why bake?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {FEATURES.map((f) => (
          <article
            key={f.id}
            id={f.id}
            className="card-chunky p-7 flex flex-col gap-3 bg-cream"
          >
            <span className="text-3xl" role="img" aria-label={f.title}>
              {f.icon}
            </span>
            <h3 className="font-display font-bold text-lg text-navy leading-tight">
              {f.title}
            </h3>
            <p className="font-body text-sm text-ink/70 leading-relaxed">
              {f.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
