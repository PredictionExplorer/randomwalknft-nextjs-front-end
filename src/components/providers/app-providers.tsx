"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { Toaster } from "sonner";
import { type State, WagmiProvider } from "wagmi";

import type { ContractsContextValue } from "@/components/providers/contracts-context";
import { ContractsProvider } from "@/components/providers/contracts-context";
import { MotionProvider } from "@/components/providers/motion-provider";
import { WingProvider } from "@/components/providers/wing-provider";
import { HydrationMarker } from "@/components/providers/hydration-marker";
import { WalletLifecycleBridge } from "@/components/wallet/wallet-lifecycle-bridge";
import { WalletProvider } from "@/components/wallet/wallet-provider";
import { getWagmiConfig } from "@/lib/web3/wagmi";
import type { Wing } from "@/lib/wing";

type AppProvidersProps = {
  children: React.ReactNode;
  initialState?: State | undefined;
  initialWing: Wing;
  contracts: ContractsContextValue;
};

export function AppProviders({ children, initialState, initialWing, contracts }: AppProvidersProps) {
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
          <WagmiProvider config={getWagmiConfig()} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
              <WalletProvider>
                <WalletLifecycleBridge />
                <HydrationMarker />
                {children}
              </WalletProvider>
              <Toaster position="top-right" theme={initialWing === "light" ? "light" : "dark"} richColors />
              {process.env.NODE_ENV === "development" ? <ReactQueryDevtools initialIsOpen={false} /> : null}
            </QueryClientProvider>
          </WagmiProvider>
        </ContractsProvider>
      </MotionProvider>
    </WingProvider>
  );
}
