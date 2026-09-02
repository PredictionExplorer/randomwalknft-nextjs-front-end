"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { Toaster } from "sonner";
import { WagmiProvider } from "wagmi";

import type { ContractsContextValue } from "@/components/providers/contracts-context";
import { ContractsProvider } from "@/components/providers/contracts-context";
import { MotionProvider } from "@/components/providers/motion-provider";
import { useWing, WingProvider } from "@/components/providers/wing-provider";
import { HydrationMarker } from "@/components/providers/hydration-marker";
import { WalletLifecycleBridge } from "@/components/wallet/wallet-lifecycle-bridge";
import { WalletProvider } from "@/components/wallet/wallet-provider";
import { getWagmiConfig } from "@/lib/web3/wagmi";
import type { Wing } from "@/lib/wing";

type AppProvidersProps = {
  children: React.ReactNode;
  /** Wing to assume until the client reads the cookie (tests and previews pass it). */
  initialWing?: Wing;
  contracts: ContractsContextValue;
};

/** Toasts follow the wing so they never look pasted on from the other one. */
function WingAwareToaster() {
  const { wing } = useWing();
  return <Toaster position="top-right" theme={wing === "light" ? "light" : "dark"} richColors />;
}

export function AppProviders({ children, initialWing, contracts }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return (
    <WingProvider initialWing={initialWing}>
      <MotionProvider>
        <ContractsProvider value={contracts}>
          {/* No server-side wallet state: the client reconnects from wagmi's cookie storage. */}
          <WagmiProvider config={getWagmiConfig()}>
            <QueryClientProvider client={queryClient}>
              <WalletProvider>
                <WalletLifecycleBridge />
                <HydrationMarker />
                {children}
              </WalletProvider>
              <WingAwareToaster />
              {process.env.NODE_ENV === "development" ? <ReactQueryDevtools initialIsOpen={false} /> : null}
            </QueryClientProvider>
          </WagmiProvider>
        </ContractsProvider>
      </MotionProvider>
    </WingProvider>
  );
}
