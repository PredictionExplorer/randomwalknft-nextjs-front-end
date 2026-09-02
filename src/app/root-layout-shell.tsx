import type { Metadata } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { cookieToInitialState } from "wagmi";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AppProviders } from "@/components/providers/app-providers";
import { getBaseConfig } from "@/lib/config";
import { getAppConfig } from "@/lib/server/app-config";
import { getWagmiConfig } from "@/lib/web3/wagmi";
import { wingFromCookieHeader } from "@/lib/wing";

import "@/app/globals.css";

const instrumentSerif = localFont({
  src: [
    { path: "../../public/fonts/InstrumentSerif-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/InstrumentSerif-Italic.woff2", weight: "400", style: "italic" }
  ],
  variable: "--font-instrument-serif",
  display: "swap"
});

export function buildRootMetadata(): Metadata {
  const { SITE_DESCRIPTION, SITE_NAME, SITE_URL } = getBaseConfig();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    icons: {
      icon: [{ url: "/images/logo2.png", type: "image/png" }],
      apple: [{ url: "/images/logo2.png" }]
    },
    // No root-level canonical on purpose: a site-wide fallback pointing at "/"
    // makes any page that forgets its own canonical declare itself a duplicate
    // of the homepage. Every indexable route sets its own canonical instead.
    openGraph: {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      type: "website",
      url: SITE_URL,
      siteName: SITE_NAME
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: SITE_DESCRIPTION
    }
  };
}

export async function RootLayoutShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookie = (await headers()).get("cookie");
  const initialState = cookieToInitialState(getWagmiConfig(), cookie);
  const wing = wingFromCookieHeader(cookie);
  const { API_BASE_URL, NFT_ADDRESS } = await getAppConfig();

  return (
    <html
      lang="en"
      data-wing={wing}
      // Tells Next to suspend smooth scrolling while it restores position on route changes.
      data-scroll-behavior="smooth"
      className={`${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Artwork thumbs, films, and API data all come from this origin. */}
        <link rel="preconnect" href={API_BASE_URL} />
        <link rel="dns-prefetch" href={API_BASE_URL} />
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-50 -translate-y-20 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition focus:translate-y-0"
        >
          Skip to content
        </a>
        <AppProviders initialState={initialState} initialWing={wing} contracts={{ NFT_ADDRESS }}>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
