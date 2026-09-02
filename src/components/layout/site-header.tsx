"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Wallet } from "lucide-react";
import { useState } from "react";

import { PageShell } from "@/components/common/page-shell";
import { ConnectWalletButton } from "@/components/layout/connect-wallet-button";
import { VaultTicker } from "@/components/layout/vault-ticker";
import { WingToggle } from "@/components/layout/wing-toggle";
import { WalkMark } from "@/components/layout/walk-mark";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { navItems } from "@/lib/content/nav";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";

const NO_PREFETCH_ROUTES = new Set(["/random", "/random-video"]);

function isExternalHref(href: string) {
  return /^https?:\/\//.test(href);
}

type HeaderNavLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  onNavigate?: (() => void) | undefined;
};

/** Internal or external nav link; forwards Radix menu-item props when used inside a dropdown. */
function HeaderNavLink({ children, href, onNavigate, onClick, ...rest }: HeaderNavLinkProps) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    onNavigate?.();
  };

  if (isExternalHref(href)) {
    return (
      <a {...rest} href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }

  // Anchor attributes forwarded by Radix are structurally valid Link props; the cast only
  // bridges `exactOptionalPropertyTypes` between the two prop shapes.
  const linkProps = {
    ...rest,
    href: href as Route,
    onClick: handleClick,
    ...(NO_PREFETCH_ROUTES.has(href) ? { prefetch: false as const } : {})
  } as React.ComponentProps<typeof Link>;

  return <Link {...linkProps}>{children}</Link>;
}

function WalletButtonPlaceholder() {
  return (
    <Button variant="secondary" size="sm" disabled>
      <Wallet className="h-4 w-4" aria-hidden />
      Connect Wallet
    </Button>
  );
}

const navLinkClass =
  "font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground";

export function SiteHeader() {
  const pathname = usePathname();
  const mounted = useMounted();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <PageShell className="flex h-16 items-center gap-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Random Walk NFT — home">
          <WalkMark className="h-8 w-8" />
          <span className="hidden font-mono text-[0.7rem] uppercase tracking-[0.24em] text-foreground sm:inline">
            Random Walk
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex" aria-label="Primary">
          {navItems.map((item) => {
            const itemIsExternal = isExternalHref(item.href);
            const isActive =
              (!itemIsExternal && pathname === item.href) ||
              ("children" in item ? item.children.some((child) => pathname === child.href) : false);

            if ("children" in item) {
              return (
                <DropdownMenu key={item.title}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={cn(navLinkClass, "inline-flex items-center gap-1", isActive && "text-foreground")}
                    >
                      {item.title}
                      <ChevronDown className="h-3 w-3" aria-hidden />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.href} asChild>
                        <HeaderNavLink href={child.href}>{child.title}</HeaderNavLink>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            return (
              <HeaderNavLink
                key={item.title}
                href={item.href}
                className={cn(navLinkClass, isActive && "text-foreground")}
              >
                {item.title}
              </HeaderNavLink>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <VaultTicker />
          <WingToggle />
          {mounted ? <ConnectWalletButton /> : <WalletButtonPlaceholder />}
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <VaultTicker />
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open navigation">
                <Menu className="h-4 w-4" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <nav className="space-y-5 pt-10" aria-label="Mobile">
                {navItems.map((item) => (
                  <div key={item.title} className="space-y-2">
                    <HeaderNavLink
                      href={item.href}
                      onNavigate={closeMobileNav}
                      className={cn(
                        "block font-display text-2xl",
                        pathname === item.href ? "text-foreground" : "text-foreground/80"
                      )}
                    >
                      {item.title}
                    </HeaderNavLink>
                    {"children" in item ? (
                      <div className="space-y-1.5 pl-4">
                        {item.children.map((child) => (
                          <HeaderNavLink
                            key={child.href}
                            href={child.href}
                            onNavigate={closeMobileNav}
                            className="block text-sm text-muted-foreground"
                          >
                            {child.title}
                          </HeaderNavLink>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </nav>
              <div className="mt-auto space-y-3">
                <WingToggle className="w-full justify-center" />
                <Link href="/my-nfts" onClick={closeMobileNav} className={cn(navLinkClass, "block")}>
                  My NFTs
                </Link>
                {mounted ? <ConnectWalletButton onBeforeOpen={closeMobileNav} /> : <WalletButtonPlaceholder />}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </PageShell>
    </header>
  );
}
