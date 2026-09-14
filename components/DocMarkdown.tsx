import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import CopyCodeButton from "@/components/CopyCodeButton";

/**
 * Important commands that devs will copy-paste frequently.
 * Checked against the first non-comment, non-empty line of a code block.
 */
const IMPORTANT_COMMANDS = [
  "npm install -g bakeacookie",
  "npm uninstall -g bakeacookie",
  "bake deploy",
  "bake rollback",
  "bake logs",
  "bake prove",
  "bake doctor",
  "bake login",
  "bake use",
  "bake init",
  "bake fork",
  "bake stats",
  "bake --help",
  "bake --version",
] as const;

function extractCommands(raw: string): string[] {
  const lines = raw.split("\n");
  const found: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) continue;
    // Check if this line starts with an important command
    for (const cmd of IMPORTANT_COMMANDS) {
      if (trimmed === cmd || trimmed.startsWith(cmd + " ") || trimmed.startsWith(cmd + "\t")) {
        found.push(trimmed);
        break;
      }
    }
  }
  return found;
}

const MD_COMPONENTS: Components = {
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
  p: ({ children }) => (
    <p className="mb-4 font-body text-base leading-relaxed text-ink/80">
      {children}
    </p>
  ),
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
  code: ({ children, className }) => {
    const isBlock = className?.startsWith("language-");
    if (isBlock) return null;
    return (
      <code
        className="rounded bg-navy/8 px-1.5 py-0.5 font-mono text-[0.85em] text-navy"
        style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => {
    const codeEl = React.Children.toArray(children)[0] as React.ReactElement<{
      className?: string;
      children?: React.ReactNode;
    }>;
    const lang = codeEl?.props?.className?.replace("language-", "") ?? "";
    const raw = String(codeEl?.props?.children ?? "").trimEnd();

    // Detect important commands and collect the first one for copying
    const commands = extractCommands(raw);
    const copyText = commands.length > 0 ? commands[0] : null;

    return (
      <div
        className="mb-5 mt-3 overflow-hidden rounded-[1rem]"
        style={{
          border: "2.5px solid rgba(11,31,58,0.2)",
          boxShadow:
            "0 4px 0 0 rgba(11,31,58,0.12), 0 12px 32px rgba(11,31,58,0.08)",
        }}
      >
        {(lang || copyText) && (
          <div
            className="flex items-center gap-2 px-4 py-2"
            style={{
              background: "rgba(11,31,58,0.05)",
              borderBottom: "1.5px solid rgba(11,31,58,0.1)",
            }}
          >
            {lang && (
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-navy/40">
                {lang}
              </span>
            )}
            {copyText && (
              <span className="ml-auto">
                <CopyCodeButton text={copyText} />
              </span>
            )}
          </div>
        )}
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
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-4 border-sky-deep pl-4 font-body text-sm italic text-ink/65">
      {children}
    </blockquote>
  ),
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
  hr: () => <hr className="my-8 border-t-2 border-navy/10" />,
  strong: ({ children }) => (
    <strong className="font-semibold text-navy">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-ink/70">{children}</em>,
};

export default function DocMarkdown({ source }: { source: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
      {source}
    </ReactMarkdown>
  );
}
