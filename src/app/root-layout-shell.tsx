import type { Metadata } from "next";
import localFont from "next/font/local";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AppProviders } from "@/components/providers/app-providers";
import { getSiteConfig } from "@/lib/config";
import { getAppConfig } from "@/lib/server/app-config";
import { DEFAULT_WING, WING_COOKIE } from "@/lib/wing";

import "@/app/globals.css";

/**
 * Fonts use `font-display: fallback`: a ~100ms block, then the system fallback (with
 * next/font's size-adjusted metrics, so nothing shifts) unless the web font arrives
 * within about three seconds. On slow first visits the page therefore paints once and
 * stays put, instead of re-painting its largest text when the font finally lands.
 * Geist ships as files in the `geist` package; loading them here (rather than via its
 * prebuilt exports) is what lets us choose the display strategy and a single mono weight.
 */
const geistSans = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
  weight: "100 900",
  variable: "--font-geist-sans",
  display: "fallback"
});

const geistMono = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.woff2",
  weight: "400",
  variable: "--font-geist-mono",
  display: "fallback"
});

// Display face only in roman: nothing on the site sets italic, so the italic file stays unshipped.
const instrumentSerif = localFont({
  src: "../../public/fonts/InstrumentSerif-Regular.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-instrument-serif",
  display: "fallback"
});

/**
 * Runs before first paint and sets `data-wing` from the cookie, so the prerendered
 * shell (always the dark wing) never flashes for light-wing visitors. React leaves
 * the attribute alone thanks to `suppressHydrationWarning` on <html>, and the
 * WingProvider reads it back once hydrated.
 */
const WING_BOOTSTRAP = `(function(){try{var m=document.cookie.match(/(?:^|; )${WING_COOKIE}=(light|dark)(?:;|$)/);if(m){document.documentElement.dataset.wing=m[1]}}catch(e){}})();`;

export function buildRootMetadata(): Metadata {
  const { SITE_DESCRIPTION, SITE_NAME, SITE_URL } = getSiteConfig();
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

/**
 * Nothing here reads the request: the wing comes from the cookie on the client,
 * wallet state is reconnected from wagmi's cookie storage on the client, and the
 * contract addresses are cached for hours. That keeps the whole document shell
 * prerenderable, so the first paint never waits on the server.
 */
export async function RootLayoutShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const { API_BASE_URL, NFT_ADDRESS } = await getAppConfig();

  return (
    <html
      lang="en"
      data-wing={DEFAULT_WING}
      // Tells Next to suspend smooth scrolling while it restores position on route changes.
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: WING_BOOTSTRAP }} />
        {/* Artwork thumbs, films, and API data all come from this origin. */}
        <link rel="preconnect" href={API_BASE_URL} />
        <link rel="dns-prefetch" href={API_BASE_URL} />
      </head>
      <body>
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-50 -translate-y-20 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition focus:translate-y-0"
        >
          Skip to content
        </a>
        <AppProviders contracts={{ NFT_ADDRESS }}>
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
