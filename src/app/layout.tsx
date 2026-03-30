import type { Metadata, Viewport } from "next";

import { EnvMissingPage } from "@/components/env-missing-page";
import { getMissingEnvKeys } from "@/lib/env";

import { buildRootMetadata, RootLayoutShell } from "./root-layout-shell";

export async function generateMetadata(): Promise<Metadata> {
  if (getMissingEnvKeys().length > 0) {
    return {
      title: "Configuration required"
    };
  }
  return buildRootMetadata();
}

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const missing = getMissingEnvKeys();
  if (missing.length > 0) {
    return (
      <html lang="en">
        <body>
          <EnvMissingPage missingKeys={missing} />
        </body>
      </html>
    );
  }

  return <RootLayoutShell>{children}</RootLayoutShell>;
}
