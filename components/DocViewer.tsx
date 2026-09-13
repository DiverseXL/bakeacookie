"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

/* ─────────────────────────────────────────────────────────────────
   Docs available to the viewer — keyed by slug
───────────────────────────────────────────────────────────────── */
export interface DocEntry {
  slug: string;
  label: string;
  githubUrl: string;
  content: string | null; // null = fetch failed
}

interface Props {
  docs: DocEntry[];
}

/* ─────────────────────────────────────────────────────────────────
   Custom react-markdown component map
   Applies the bakeacookie design system to rendered markdown.
───────────────────────────────────────────────────────────────── */
const MD_COMPONENTS: Components = {
  // Headings — Bricolage Grotesque, tight tracking, navy
  h1: ({ children }) => (
    <h1 className="mb-4 mt-10 font-display text-3xl font-extrabold tracking-tight text-navy first:mt-0 sm:text-4xl">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-8 border-b-2 border-navy/10 pb-2 font-display text-2xl font-bold tracking-tight text-navy">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-6 font-display text-lg font-bold text-navy">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-1.5 mt-4 font-display text-base font-semibold text-navy">
      {children}
    </h4>
  ),

  // Body text
  p: ({ children }) => (
    <p className="mb-4 font-body text-base leading-relaxed text-ink/80">
      {children}
    </p>
  ),

  // Links — navy with underline
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="font-semibold text-navy underline underline-offset-2 transition-colors hover:text-sky-deep"
    >
      {children}
    </a>
  ),

  // Inline code
  code: ({ children, className }) => {
    const isBlock = className?.startsWith("language-");
    if (isBlock) return null; // handled by pre
    return (
      <code
        className="rounded bg-navy/8 px-1.5 py-0.5 font-mono text-[0.85em] text-navy"
        style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
      >
        {children}
      </code>
    );
  },

  // Code blocks — terminal-ish light style (readable, not dark)
  pre: ({ children }) => {
    // Extract the raw text from the nested <code> element
    const codeEl = React.Children.toArray(children)[0] as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
    const lang = codeEl?.props?.className?.replace("language-", "") ?? "";
    const raw = String(codeEl?.props?.children ?? "").trimEnd();

    return (
      <div
        className="mb-5 mt-3 overflow-hidden rounded-[1rem]"
        style={{
          border: "2.5px solid rgba(11,31,58,0.2)",
          boxShadow: "0 4px 0 0 rgba(11,31,58,0.12), 0 12px 32px rgba(11,31,58,0.08)",
        }}
      >
        {/* Header bar */}
        {lang && (
          <div
            className="flex items-center gap-2 px-4 py-2"
            style={{
              background: "rgba(11,31,58,0.05)",
              borderBottom: "1.5px solid rgba(11,31,58,0.1)",
            }}
          >
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-navy/40">
              {lang}
            </span>
          </div>
        )}
        {/* Code body */}
        <pre
          className="overflow-x-auto px-5 py-5 text-sm leading-relaxed"
          style={{
            background: "rgba(11,31,58,0.03)",
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
            margin: 0,
            color: "#0b1f3a",
          }}
        >
          {raw}
        </pre>
      </div>
    );
  },

  // Lists
  ul: ({ children }) => (
    <ul className="mb-4 ml-5 list-disc space-y-1.5 font-body text-base text-ink/80">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 ml-5 list-decimal space-y-1.5 font-body text-base text-ink/80">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,

  // Blockquote
  blockquote: ({ children }) => (
    <blockquote
      className="mb-4 border-l-4 border-sky-deep pl-4 font-body text-sm italic text-ink/65"
    >
      {children}
    </blockquote>
  ),

  // Tables (remark-gfm)
  table: ({ children }) => (
    <div className="mb-5 overflow-x-auto rounded-xl border-2 border-navy/15">
      <table className="w-full border-collapse font-body text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ background: "rgba(11,31,58,0.05)" }}>{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border-b-2 border-navy/15 px-4 py-3 text-left font-display text-xs font-bold uppercase tracking-wider text-navy/70">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-navy/8 px-4 py-3 text-ink/75 last:border-0">
      {children}
    </td>
  ),

  // Horizontal rule
  hr: () => <hr className="my-8 border-t-2 border-navy/10" />,

  // Strong / em
  strong: ({ children }) => (
    <strong className="font-semibold text-navy">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-ink/70">{children}</em>,
};

/* ─────────────────────────────────────────────────────────────────
   Main client component
───────────────────────────────────────────────────────────────── */
export default function DocViewer({ docs }: Props) {
  const [active, setActive] = useState(docs[0]?.slug ?? "");
  const current = docs.find((d) => d.slug === active) ?? docs[0];

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-8 px-5 py-12 sm:py-16">

      {/* ── SIDEBAR ── */}
      <aside
        className="hidden w-52 shrink-0 md:block"
        aria-label="Documentation navigation"
      >
        <div className="sticky top-24">
          {/* Sidebar heading */}
          <p className="mb-3 font-body text-xs font-bold uppercase tracking-widest text-navy/40">
            Documentation
          </p>

          <nav className="flex flex-col gap-1">
            {docs.map((doc) => {
              const isActive = doc.slug === active;
              return (
                <button
                  key={doc.slug}
                  id={`docs-nav-${doc.slug}`}
                  onClick={() => setActive(doc.slug)}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-all duration-150",
                    isActive
                      ? "border-2 border-navy bg-cream text-navy shadow-[0_3px_0_0_rgba(11,31,58,0.55)]"
                      : "border-2 border-transparent text-navy/60 hover:border-navy/20 hover:bg-cream/70 hover:text-navy",
                  ].join(" ")}
                >
                  <DocIcon />
                  {doc.label}
                </button>
              );
            })}
          </nav>

          {/* Divider + external link */}
          <div className="mt-6 border-t-2 border-navy/10 pt-5">
            <a
              href="https://github.com/DiverseXL/bake"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-body text-xs font-semibold text-navy/50 underline-offset-2 transition-colors hover:text-navy"
            >
              <GitHubIcon />
              CLI repo on GitHub
            </a>
          </div>
        </div>
      </aside>

      {/* ── MOBILE: tab strip ── */}
      <div className="mb-6 flex gap-2 md:hidden">
        {docs.map((doc) => (
          <button
            key={doc.slug}
            id={`docs-tab-${doc.slug}`}
            onClick={() => setActive(doc.slug)}
            aria-current={doc.slug === active ? "page" : undefined}
            className={[
              "rounded-pill border-2 px-4 py-2 text-sm font-bold transition-all duration-150",
              doc.slug === active
                ? "border-navy bg-navy text-white shadow-[0_3px_0_0_rgba(11,31,58,0.6)]"
                : "border-navy/30 bg-cream/70 text-navy/60 hover:border-navy hover:text-navy",
            ].join(" ")}
          >
            {doc.label}
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="min-w-0 flex-1">
        {current?.content ? (
          <>
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 font-body text-xs text-navy/40">
              <a href="/" className="hover:text-navy">Home</a>
              <span>/</span>
              <a href="/docs" className="hover:text-navy">Docs</a>
              <span>/</span>
              <span className="font-semibold text-navy/70">{current.label}</span>
            </div>

            {/* Rendered markdown */}
            <article id={`doc-content-${current.slug}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={MD_COMPONENTS}
              >
                {current.content}
              </ReactMarkdown>
            </article>

            {/* Footer: edit link */}
            <div className="mt-12 border-t-2 border-navy/10 pt-6 flex items-center justify-between">
              <span className="font-body text-xs text-ink/40">
                Fetched from the bake CLI repo · refreshes hourly
              </span>
              <a
                href={current.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-navy/60 underline underline-offset-2 hover:text-navy"
              >
                View on GitHub →
              </a>
            </div>
          </>
        ) : (
          /* ── Error / fetch failure fallback ── */
          <div
            className="card-chunky flex flex-col items-start gap-4 p-10"
            id={`doc-error-${current?.slug ?? "unknown"}`}
          >
            <span className="text-3xl" aria-label="error">⚠️</span>
            <h2 className="font-display text-xl font-bold text-navy">
              Couldn't load this document
            </h2>
            <p className="font-body text-sm leading-relaxed text-ink/70">
              The docs are fetched live from the bake CLI repository on GitHub.
              This usually means a network issue or a temporary GitHub rate limit.
              The content is still there — just read it directly:
            </p>
            <a
              href={current?.githubUrl ?? "https://github.com/DiverseXL/bake"}
              target="_blank"
              rel="noopener noreferrer"
              id="docs-fallback-github-link"
              className="btn-navy text-sm"
            >
              <GitHubIcon />
              View {current?.label ?? "README"} on GitHub
            </a>
          </div>
        )}
      </main>
    </div>
  );
}

function DocIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
