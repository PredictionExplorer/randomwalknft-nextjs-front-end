"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { type State, WagmiProvider } from "wagmi";
import { Toaster } from "sonner";

import type { ContractsContextValue } from "@/components/providers/contracts-context";
import { ContractsProvider } from "@/components/providers/contracts-context";
import { logBundledNextPublicEnvOnce } from "@/lib/debug/public-env";
import { getWagmiConfig } from "@/lib/web3/wagmi";
import { getRainbowKitAppInfo, rainbowKitTheme } from "@/lib/web3/rainbowkit";

type AppProvidersProps = {
  children: React.ReactNode;
  initialState?: State | undefined;
  contracts: ContractsContextValue;
};

export function AppProviders({ children, initialState, contracts }: AppProvidersProps) {
  useEffect(() => {
    logBundledNextPublicEnvOnce();
  }, []);

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
    <ContractsProvider value={contracts}>
      <WagmiProvider config={getWagmiConfig()} initialState={initialState}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider appInfo={getRainbowKitAppInfo()} modalSize="compact" theme={rainbowKitTheme}>
            {children}
          </RainbowKitProvider>
        <Toaster position="top-right" richColors />
        {process.env.NODE_ENV === "development" ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </QueryClientProvider>
    </WagmiProvider>
    </ContractsProvider>
  );
}
