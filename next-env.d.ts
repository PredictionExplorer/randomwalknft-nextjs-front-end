/// <reference types="next" />
/// <reference types="next/types/global" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.

interface Window {
    ethereum?: {
      isMetaMask?: true;
      on?: (...args: any[]) => void;
      removeListener?: (...args: any[]) => void;
      autoRefreshOnNetworkChange?: boolean;
      request: (arg: any) => void;
    };
    web3?: Record<string, unknown>;
  }
  