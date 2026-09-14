import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DocMarkdown from "@/components/DocMarkdown";
import DocsSidebar from "@/components/DocsSidebar";
import { getAllSlugs, getDocNav, getDocPage } from "@/lib/docs";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getDocPage(slug.join("/"));
  if (!page) return { title: "Docs — bakeacookie" };
  return {
    title: `${page.title} — bakeacookie docs`,
    description: page.description,
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const joined = slug.join("/");
  const page = getDocPage(joined);
  if (!page) notFound();

  const nav = getDocNav();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-5 py-12 sm:py-16 md:flex-row md:gap-8">
      <DocsSidebar nav={nav} currentSlug={page.slug} />

      <div className="min-w-0 flex-1">
        <div className="mb-6 flex flex-wrap items-center gap-2 font-body text-xs text-navy/40">
          <Link href="/" className="hover:text-navy">
            Home
          </Link>
          <span>/</span>
          <Link href="/docs" className="hover:text-navy">
            Docs
          </Link>
          <span>/</span>
          <span className="text-navy/50">{page.sectionTitle}</span>
          <span>/</span>
          <span className="font-semibold text-navy/70">{page.title}</span>
        </div>

        {page.description && (
          <p className="mb-8 font-body text-base leading-relaxed text-ink/65">
            {page.description}
          </p>
        )}

        <article id={`doc-content-${page.slug.replace(/\//g, "-")}`}>
          <h1 className="mb-4 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
            {page.title}
          </h1>
          <DocMarkdown source={page.body} />
        </article>

        <div className="mt-12 border-t-2 border-navy/10 pt-6">
          <span className="font-body text-xs text-ink/40">
            Sourced from local MDX in docs/content/docs
          </span>
        </div>
      </div>
    </div>
  );
}
