"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { type State, WagmiProvider } from "wagmi";
import { Toaster } from "sonner";

import { wagmiConfig } from "@/lib/web3/wagmi";
import { rainbowKitAppInfo, rainbowKitTheme } from "@/lib/web3/rainbowkit";

type AppProvidersProps = {
  children: React.ReactNode;
  initialState?: State | undefined;
};

export function AppProviders({ children, initialState }: AppProvidersProps) {
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
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider appInfo={rainbowKitAppInfo} modalSize="compact" theme={rainbowKitTheme}>
          {children}
        </RainbowKitProvider>
        <Toaster position="top-right" richColors />
        {process.env.NODE_ENV === "development" ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
