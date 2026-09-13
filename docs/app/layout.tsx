import "./global.css";
import { RootProvider } from "fumadocs-ui/provider";
import type { ReactNode } from "react";

export const metadata = {
  title: "bake — Documentation",
  description:
    "The Vercel CLI for Cookie Chain. Build, deploy, verify, and roll back Anchor programs with permanent on-chain deploy history.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
