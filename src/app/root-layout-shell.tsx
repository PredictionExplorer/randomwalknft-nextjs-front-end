import type { Metadata } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import "@rainbow-me/rainbowkit/styles.css";
import { cookieToInitialState } from "wagmi";

import { AppProviders } from "@/components/providers/app-providers";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getConfig } from "@/lib/config";
import { getWagmiConfig } from "@/lib/web3/wagmi";

import "@/app/globals.css";

const kelson = localFont({
  src: [
    {
      path: "../../public/fonts/KelsonSans-Light.woff2",
      weight: "300",
      style: "normal"
    },
    {
      path: "../../public/fonts/KelsonSans-Normal.woff2",
      weight: "400",
      style: "normal"
    },
    {
      path: "../../public/fonts/KelsonSans-Bold.woff2",
      weight: "700",
      style: "normal"
    }
  ],
  variable: "--font-kelson",
  display: "swap"
});

export async function buildRootMetadata(): Promise<Metadata> {
  const { SITE_DESCRIPTION, SITE_NAME, SITE_URL } = getConfig();
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
    alternates: {
      canonical: "/"
    },
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

  return (
    <html lang="en" className={kelson.variable}>
      <body>
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-50 -translate-y-20 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition focus:translate-y-0"
        >
          Skip to content
        </a>
        <AppProviders initialState={initialState}>
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
