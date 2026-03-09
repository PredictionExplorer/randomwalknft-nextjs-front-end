"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { PageShell } from "@/components/common/page-shell";
import { ConnectWalletButton } from "@/components/layout/connect-wallet-button";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { navItems } from "@/lib/content/nav";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();

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
            const isActive =
              pathname === item.href ||
              (item.href.startsWith("/#") && pathname === "/") ||
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
                        <Link href={child.href}>{child.title}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "text-sm uppercase tracking-[0.18em] text-muted-foreground transition hover:text-foreground",
                  isActive && "text-secondary"
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden lg:block">
          <ConnectWalletButton />
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
                  <Link
                    href={item.href}
                    className={cn(
                      "block text-lg font-medium tracking-[0.14em]",
                      pathname === item.href ? "text-secondary" : "text-foreground"
                    )}
                  >
                    {item.title}
                  </Link>
                  {"children" in item && item.children ? (
                    <div className="space-y-1 pl-4">
                      {item.children.map((child: (typeof item.children)[number]) => (
                        <Link key={child.href} href={child.href} className="block text-sm text-muted-foreground">
                          {child.title}
                        </Link>
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
              <div className={cn(buttonVariants({ variant: "ghost" }), "justify-start px-0")}>
                <Link href="/my-offers">My Offers</Link>
              </div>
              <ConnectWalletButton />
            </div>
          </SheetContent>
        </Sheet>
      </PageShell>
    </header>
  );
}
