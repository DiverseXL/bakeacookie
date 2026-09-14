"use client";

import Link from "next/link";
import { useState } from "react";
import type { DocNavSection } from "@/lib/docs";

export default function DocsSidebar({
  nav,
  currentSlug,
}: {
  nav: DocNavSection[];
  currentSlug: string;
}) {
  const [open, setOpen] = useState(false);
  const current = nav
    .flatMap((s) => s.pages)
    .find((p) => p.slug === currentSlug);

  return (
    <>
      <div className="mb-6 md:hidden">
        <button
          type="button"
          id="docs-mobile-nav-toggle"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border-2 border-navy bg-cream px-4 py-3 text-left text-sm font-bold text-navy shadow-[0_3px_0_0_rgba(11,31,58,0.45)]"
        >
          <span>{current?.title ?? "Documentation"}</span>
          <span aria-hidden="true">{open ? "▴" : "▾"}</span>
        </button>
        {open && (
          <nav
            className="mt-3 max-h-[60vh] overflow-y-auto rounded-xl border-2 border-navy/20 bg-cream p-3"
            aria-label="Documentation sections"
          >
            <NavTree
              nav={nav}
              currentSlug={currentSlug}
              onNavigate={() => setOpen(false)}
            />
          </nav>
        )}
      </div>

      <aside
        className="hidden w-56 shrink-0 md:block"
        aria-label="Documentation navigation"
      >
        <div className="sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto pr-1">
          <p className="mb-3 font-body text-xs font-bold uppercase tracking-widest text-navy/40">
            Documentation
          </p>
          <NavTree nav={nav} currentSlug={currentSlug} />
          <div className="mt-6 border-t-2 border-navy/10 pt-5">
            <a
              href="https://github.com/DiverseXL/bake"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-body text-xs font-semibold text-navy/50 underline-offset-2 transition-colors hover:text-navy"
            >
              CLI repo on GitHub
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavTree({
  nav,
  currentSlug,
  onNavigate,
}: {
  nav: DocNavSection[];
  currentSlug: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-5">
      {nav.map((section) => (
        <div key={section.id}>
          <p className="mb-1.5 px-3 font-body text-[10px] font-bold uppercase tracking-widest text-navy/35">
            {section.title}
          </p>
          <ul className="flex flex-col gap-0.5">
            {section.pages.map((page) => {
              const isActive = page.slug === currentSlug;
              return (
                <li key={page.slug}>
                  <Link
                    href={`/docs/${page.slug}`}
                    id={`docs-nav-${page.slug.replace(/\//g, "-")}`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={onNavigate}
                    className={[
                      "flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-semibold transition-all duration-150 no-underline",
                      isActive
                        ? "border-2 border-navy bg-cream text-navy shadow-[0_3px_0_0_rgba(11,31,58,0.55)]"
                        : "border-2 border-transparent text-navy/60 hover:border-navy/20 hover:bg-cream/70 hover:text-navy",
                    ].join(" ")}
                  >
                    {page.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
