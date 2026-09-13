import type { Metadata } from "next";
import DocViewer, { type DocEntry } from "@/components/DocViewer";

export const metadata: Metadata = {
  title: "Docs — bakeacookie",
  description:
    "Documentation for the bake CLI: installation, usage, commands, and architecture. Fetched live from the bake CLI repository.",
};

/* ─────────────────────────────────────────────────────────────────
   Content sources — fetched from the real CLI repo at build time.
   revalidate: 3600 → ISR refresh every hour so docs stay current
   without a full redeploy when the CLI's README changes.
───────────────────────────────────────────────────────────────── */
const DOCS: Omit<DocEntry, "content">[] = [
  {
    slug: "overview",
    label: "Overview",
    githubUrl:
      "https://github.com/DiverseXL/bake/blob/master/README.md",
  },
  {
    slug: "requirements",
    label: "Requirements",
    githubUrl:
      "https://github.com/DiverseXL/bake/blob/master/REQUIREMENTS.md",
  },
];

const RAW_URLS: Record<string, string> = {
  overview:     "https://raw.githubusercontent.com/DiverseXL/bake/master/README.md",
  requirements: "https://raw.githubusercontent.com/DiverseXL/bake/master/REQUIREMENTS.md",
};

async function fetchDoc(slug: string): Promise<string | null> {
  const url = RAW_URLS[slug];
  if (!url) return null;
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      // GitHub raw content — no auth needed, but set a UA to be polite
      headers: { "User-Agent": "bakeacookie-dashboard/1.0" },
    });
    if (!res.ok) {
      console.warn(`[docs] Failed to fetch ${slug}: HTTP ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.warn(`[docs] Network error fetching ${slug}:`, err);
    return null;
  }
}

export default async function DocsPage() {
  // Fetch all docs in parallel at the server level
  const contents = await Promise.all(
    DOCS.map((d) => fetchDoc(d.slug))
  );

  const docs: DocEntry[] = DOCS.map((d, i) => ({
    ...d,
    content: contents[i],
  }));

  return (
    <div className="min-h-screen">
      <DocViewer docs={docs} />
    </div>
  );
}
