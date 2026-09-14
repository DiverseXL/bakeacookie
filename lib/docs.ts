import fs from "fs";
import path from "path";

export const DOCS_ROOT = path.join(process.cwd(), "docs", "content", "docs");

const SECTION_ORDER = [
  "get-started",
  "guides",
  "recipe-book",
  "reference",
  "troubleshooting",
  "about",
] as const;

export type DocNavPage = {
  slug: string;
  title: string;
};

export type DocNavSection = {
  id: string;
  title: string;
  pages: DocNavPage[];
};

export type DocPage = {
  slug: string;
  title: string;
  description?: string;
  body: string;
  sectionTitle: string;
};

type Frontmatter = {
  title?: string;
  description?: string;
};

function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
  if (!raw.startsWith("---")) {
    return { data: {}, body: raw };
  }
  const end = raw.indexOf("\n---", 3);
  if (end === -1) {
    return { data: {}, body: raw };
  }
  const yaml = raw.slice(4, end).trim();
  const body = raw.slice(end + 4).replace(/^\s*\n/, "");
  const data: Frontmatter = {};
  for (const line of yaml.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (key === "title") data.title = value;
    if (key === "description") data.description = value;
  }
  return { data, body };
}

function titleFromSlug(slug: string): string {
  const leaf = slug.split("/").pop() ?? slug;
  return leaf
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function readMetaPages(sectionDir: string): string[] | null {
  const metaPath = path.join(sectionDir, "meta.json");
  if (!fs.existsSync(metaPath)) return null;
  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as {
      pages?: string[];
    };
    return Array.isArray(meta.pages) ? meta.pages : null;
  } catch {
    return null;
  }
}

function listMdxFiles(sectionDir: string): string[] {
  return fs
    .readdirSync(sectionDir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => f.replace(/\.(mdx|md)$/, ""));
}

function fileForPage(sectionDir: string, pageId: string): string | null {
  for (const ext of [".mdx", ".md"]) {
    const p = path.join(sectionDir, `${pageId}${ext}`);
    if (fs.existsSync(p)) return p;
  }
  if (pageId === "index" || pageId === "") {
    for (const ext of [".mdx", ".md"]) {
      const p = path.join(sectionDir, `index${ext}`);
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

function loadPageFile(filePath: string, slug: string, sectionTitle: string): DocPage {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, body } = parseFrontmatter(raw);
  return {
    slug,
    title: data.title ?? titleFromSlug(slug),
    description: data.description,
    body,
    sectionTitle,
  };
}

function sectionTitleFromMeta(sectionDir: string, fallback: string): string {
  const metaPath = path.join(sectionDir, "meta.json");
  if (fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as {
        title?: string;
      };
      if (meta.title) return meta.title;
    } catch {
      /* ignore */
    }
  }
  return titleFromSlug(fallback);
}

export function getDocNav(): DocNavSection[] {
  if (!fs.existsSync(DOCS_ROOT)) return [];

  const dirs = fs
    .readdirSync(DOCS_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const ordered = [
    ...SECTION_ORDER.filter((id) => dirs.includes(id)),
    ...dirs.filter((id) => !(SECTION_ORDER as readonly string[]).includes(id)),
  ];

  const sections: DocNavSection[] = [];

  for (const id of ordered) {
    const sectionDir = path.join(DOCS_ROOT, id);
    const title = sectionTitleFromMeta(sectionDir, id);
    const fromMeta = readMetaPages(sectionDir);
    const pageIds = fromMeta ?? listMdxFiles(sectionDir);

    const pages: DocNavPage[] = [];
    for (const pageId of pageIds) {
      const filePath = fileForPage(sectionDir, pageId);
      if (!filePath) continue;
      const slug = pageId === "index" ? id : `${id}/${pageId}`;
      const raw = fs.readFileSync(filePath, "utf8");
      const { data } = parseFrontmatter(raw);
      pages.push({
        slug,
        title: data.title ?? titleFromSlug(pageId === "index" ? id : pageId),
      });
    }

    if (pages.length > 0) {
      sections.push({ id, title, pages });
    }
  }

  // Loose files at the docs root
  const rootFiles = listMdxFiles(DOCS_ROOT);
  if (rootFiles.length > 0) {
    const pages: DocNavPage[] = rootFiles.map((pageId) => {
      const filePath = fileForPage(DOCS_ROOT, pageId)!;
      const raw = fs.readFileSync(filePath, "utf8");
      const { data } = parseFrontmatter(raw);
      return {
        slug: pageId,
        title: data.title ?? titleFromSlug(pageId),
      };
    });
    sections.unshift({ id: "root", title: "Docs", pages });
  }

  return sections;
}

export function getAllSlugs(): string[] {
  return getDocNav().flatMap((s) => s.pages.map((p) => p.slug));
}

export function getDocPage(slug: string): DocPage | null {
  if (!slug || slug.includes("..")) return null;

  const parts = slug.split("/").filter(Boolean);
  let filePath: string | null = null;
  let sectionTitle = "Docs";

  if (parts.length === 1) {
    filePath = fileForPage(DOCS_ROOT, parts[0]);
    if (!filePath) {
      const sectionDir = path.join(DOCS_ROOT, parts[0]);
      if (fs.existsSync(sectionDir)) {
        filePath = fileForPage(sectionDir, "index");
        sectionTitle = sectionTitleFromMeta(sectionDir, parts[0]);
      }
    }
  } else if (parts.length === 2) {
    const sectionDir = path.join(DOCS_ROOT, parts[0]);
    filePath = fileForPage(sectionDir, parts[1]);
    sectionTitle = sectionTitleFromMeta(sectionDir, parts[0]);
  }

  if (!filePath) return null;
  return loadPageFile(filePath, slug, sectionTitle);
}

export function getFirstDocSlug(): string {
  const nav = getDocNav();
  return nav[0]?.pages[0]?.slug ?? "get-started/welcome";
}
