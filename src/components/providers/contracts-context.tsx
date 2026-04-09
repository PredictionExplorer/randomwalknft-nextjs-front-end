"use client";

import { createContext, useContext } from "react";

export type ContractsContextValue = {
  NFT_ADDRESS: `0x${string}`;
  MARKET_ADDRESS: `0x${string}`;
};

const ContractsContext = createContext<ContractsContextValue | null>(null);

export function ContractsProvider({
  value,
  children
}: {
  value: ContractsContextValue;
  children: React.ReactNode;
}) {
  return <ContractsContext.Provider value={value}>{children}</ContractsContext.Provider>;
}

export function useContracts(): ContractsContextValue {
  const v = useContext(ContractsContext);
  if (!v) {
    throw new Error("useContracts must be used under ContractsProvider");
  }
  return v;
}
