import { source } from "@/lib/source";
import {
  DocsLayout,
  type DocsLayoutProps,
} from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";

const docsOptions: DocsLayoutProps = {
  tree: source.pageTree,
  nav: {
    title: "bake 🍪",
    url: "/docs",
  },
  links: [
    {
      text: "GitHub",
      url: "https://github.com/DiverseXL/bake",
      external: true,
    },
    {
      text: "npm",
      url: "https://www.npmjs.com/package/bakeacookie",
      external: true,
    },
  ],
};

export default function Layout({ children }: { children: ReactNode }) {
  return <DocsLayout {...docsOptions}>{children}</DocsLayout>;
}
