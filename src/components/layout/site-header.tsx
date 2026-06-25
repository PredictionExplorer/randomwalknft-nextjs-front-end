"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ChevronDown, Menu, Wallet } from "lucide-react";
import { usePathname } from "next/navigation";

import { PageShell } from "@/components/common/page-shell";
import { ConnectWalletButton } from "@/components/layout/connect-wallet-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { useMounted } from "@/lib/use-mounted";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { navItems } from "@/lib/content/nav";
import { cn } from "@/lib/utils";

function isExternalHref(href: string) {
  return /^https?:\/\//.test(href);
}

function HeaderNavLink({
  children,
  className,
  href,
  prefetch
}: {
  children: React.ReactNode;
  className?: string | undefined;
  href: string;
  prefetch?: false | undefined;
}) {
  if (isExternalHref(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  const linkProps = prefetch === false ? { prefetch: false as const } : {};

  return (
    <Link href={href as Route} className={className} {...linkProps}>
      {children}
    </Link>
  );
}

function WalletButtonPlaceholder() {
  return (
    <Button variant="secondary" size="sm" disabled>
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const mounted = useMounted();

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/84 backdrop-blur-xl">
      <PageShell className="flex items-center gap-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/images/logo2.png" alt="Random Walk mark" width={54} height={54} priority />
          <span className="hidden text-sm font-semibold tracking-[0.24em] text-muted-foreground sm:inline">
            RANDOM WALK NFT
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          {navItems.map((item) => {
            const itemIsExternal = isExternalHref(item.href);
            const isActive =
              (!itemIsExternal && pathname === item.href) ||
              (!itemIsExternal && item.href.startsWith("/#") && pathname === "/") ||
              ("children" in item && item.children ? item.children.some((child) => pathname === child.href) : false);

            if ("children" in item && item.children) {
              return (
                <DropdownMenu key={item.title}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-1 text-sm uppercase tracking-[0.18em] text-muted-foreground transition hover:text-foreground",
                        isActive && "text-secondary"
                      )}
                    >
                      {item.title}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.href} asChild>
                        <Link
                          href={child.href}
                          {...(child.href === "/random" || child.href === "/random-video"
                            ? { prefetch: false as const }
                            : {})}
                        >
                          {child.title}
                        </Link>
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
                className={cn(
                  "text-sm uppercase tracking-[0.18em] text-muted-foreground transition hover:text-foreground",
                  isActive && "text-secondary"
                )}
              >
                {item.title}
              </HeaderNavLink>
            );
          })}
        </nav>

        <div className="ml-auto hidden lg:block">
          {mounted ? <ConnectWalletButton /> : <WalletButtonPlaceholder />}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="ml-auto lg:hidden" aria-label="Open navigation">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col gap-6">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <div className="space-y-4 pt-10">
              {navItems.map((item) => (
                <div key={item.title} className="space-y-2">
                  <HeaderNavLink
                    href={item.href}
                    prefetch={item.href === "/random" ? false : undefined}
                    className={cn(
                      "block text-lg font-medium tracking-[0.14em]",
                      pathname === item.href ? "text-secondary" : "text-foreground"
                    )}
                  >
                    {item.title}
                  </HeaderNavLink>
                  {"children" in item && item.children ? (
                    <div className="space-y-1 pl-4">
                      {item.children.map((child: (typeof item.children)[number]) => (
                        <HeaderNavLink
                          key={child.href}
                          href={child.href}
                          prefetch={child.href === "/random" || child.href === "/random-video" ? false : undefined}
                          className="block text-sm text-muted-foreground"
                        >
                          {child.title}
                        </HeaderNavLink>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-auto space-y-3">
              <div className={cn(buttonVariants({ variant: "ghost" }), "justify-start px-0")}>
                <Link href="/my-nfts">My NFTs</Link>
              </div>
              {mounted ? <ConnectWalletButton /> : <WalletButtonPlaceholder />}
            </div>
          </SheetContent>
        </Sheet>
      </PageShell>
    </header>
  );
}
