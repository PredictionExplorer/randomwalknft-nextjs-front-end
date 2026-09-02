import type { Page } from "@playwright/test";

export const TEST_ACCOUNT = "0x1234567890abcdef1234567890abcdef12345678";

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- global augmentation requires declaration merging
  interface Window {
    __mockWallet: {
      disconnect(): void;
      requests: Array<{ method: string; params?: unknown[] | Record<string, unknown> }>;
      setAccounts(accounts: string[]): void;
      setChainId(chainId: string): void;
    };
  }
}

type InstallMockWalletOptions = {
  account?: string;
  announceEip6963?: boolean;
  chainId: string;
  isMetaMask?: boolean;
  missingChainUntilAdded?: boolean;
  persistAuthorization?: boolean;
  walletName?: string;
  walletRdns?: string;
};

export async function installMockWallet(
  page: Page,
  {
    account = TEST_ACCOUNT,
    announceEip6963 = false,
    chainId,
    isMetaMask = true,
    missingChainUntilAdded = false,
    persistAuthorization = true,
    walletName = "MetaMask",
    walletRdns = "io.metamask"
  }: InstallMockWalletOptions
) {
  await page.addInitScript(
    ({
      initialAccount,
      initialChainId,
      providerIsMetaMask,
      shouldPersistAuthorization,
      shouldAnnounceEip6963,
      startsWithoutTargetChain,
      announcedWalletName,
      announcedWalletRdns
    }: {
      initialAccount: string;
      initialChainId: string;
      providerIsMetaMask: boolean;
      shouldPersistAuthorization: boolean;
      shouldAnnounceEip6963: boolean;
      startsWithoutTargetChain: boolean;
      announcedWalletName: string;
      announcedWalletRdns: string;
    }) => {
      type Listener = (...args: unknown[]) => void;
      type ProviderRequest = {
        method: string;
        params?: unknown[] | Record<string, unknown>;
      };

      const listeners = new Map<string, Set<Listener>>();
      const authorizationKey = "__randomwalk_mock_wallet_authorized";
      let connectedAccounts: string[] = [];
      if (shouldPersistAuthorization) {
        try {
          if (window.localStorage.getItem(authorizationKey) === "true") {
            connectedAccounts = [initialAccount];
          }
        } catch {
          // Storage is optional in this test provider.
        }
      }
      let currentChainId = initialChainId.toLowerCase();
      let targetChainAdded = !startsWithoutTargetChain;
      const requests: ProviderRequest[] = [];

      function emit(event: string, ...args: unknown[]) {
        listeners.get(event)?.forEach((listener) => listener(...args));
      }

      function persistAccounts() {
        if (!shouldPersistAuthorization) {
          return;
        }
        try {
          if (connectedAccounts.length > 0) {
            window.localStorage.setItem(authorizationKey, "true");
          } else {
            window.localStorage.removeItem(authorizationKey);
          }
        } catch {
          // Storage is optional in this test provider.
        }
      }

      const provider = {
        isMetaMask: providerIsMetaMask,
        on(event: string, listener: Listener) {
          const eventListeners = listeners.get(event) ?? new Set<Listener>();
          eventListeners.add(listener);
          listeners.set(event, eventListeners);
          return provider;
        },
        removeListener(event: string, listener: Listener) {
          listeners.get(event)?.delete(listener);
          return provider;
        },
        async request({ method, params }: ProviderRequest) {
          requests.push({ method, ...(params === undefined ? {} : { params }) });

          if (method === "eth_requestAccounts") {
            connectedAccounts = [initialAccount];
            persistAccounts();
            emit("accountsChanged", connectedAccounts);
            emit("connect", { chainId: currentChainId });
            return connectedAccounts;
          }
          if (method === "wallet_requestPermissions") {
            connectedAccounts = [initialAccount];
            persistAccounts();
            emit("accountsChanged", connectedAccounts);
            return [{ parentCapability: "eth_accounts" }];
          }
          if (method === "eth_accounts") {
            return connectedAccounts;
          }
          if (method === "eth_chainId") {
            return currentChainId;
          }
          if (method === "net_version") {
            return String(Number.parseInt(currentChainId, 16));
          }
          if (method === "wallet_switchEthereumChain") {
            if (!targetChainAdded) {
              const error = new Error("Unrecognized chain") as Error & { code: number };
              error.code = 4902;
              throw error;
            }
            const nextChainId = (
              Array.isArray(params) ? (params[0] as { chainId?: string } | undefined)?.chainId : undefined
            )?.toLowerCase();
            if (nextChainId) {
              currentChainId = nextChainId;
              emit("chainChanged", currentChainId);
            }
            return null;
          }
          if (method === "wallet_addEthereumChain") {
            targetChainAdded = true;
            const nextChainId = (
              Array.isArray(params) ? (params[0] as { chainId?: string } | undefined)?.chainId : undefined
            )?.toLowerCase();
            if (nextChainId) {
              currentChainId = nextChainId;
              emit("chainChanged", currentChainId);
            }
            return null;
          }
          if (method === "personal_sign") {
            return `0x${"11".repeat(65)}`;
          }
          if (method === "eth_sendTransaction") {
            return `0x${"22".repeat(32)}`;
          }
          return null;
        }
      };

      const providerDetail = {
        info: {
          uuid: "350670db-19fa-4704-a166-e52e178b59d2",
          name: announcedWalletName,
          icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
          rdns: announcedWalletRdns
        },
        provider
      };
      const announceProvider = () => {
        window.dispatchEvent(
          new CustomEvent("eip6963:announceProvider", {
            detail: providerDetail
          })
        );
      };

      if (shouldAnnounceEip6963) {
        window.addEventListener("eip6963:requestProvider", announceProvider);
      }
      Object.defineProperty(window, "ethereum", {
        configurable: true,
        value: provider
      });
      Object.assign(window, {
        __mockWallet: {
          requests,
          setAccounts(accounts: string[]) {
            connectedAccounts = accounts;
            persistAccounts();
            emit("accountsChanged", accounts);
          },
          setChainId(nextChainId: string) {
            currentChainId = nextChainId.toLowerCase();
            emit("chainChanged", currentChainId);
          },
          disconnect() {
            connectedAccounts = [];
            persistAccounts();
            emit("disconnect", { code: 4900, message: "Disconnected" });
          }
        }
      });
    },
    {
      initialAccount: account,
      initialChainId: chainId,
      providerIsMetaMask: isMetaMask,
      shouldPersistAuthorization: persistAuthorization,
      shouldAnnounceEip6963: announceEip6963,
      startsWithoutTargetChain: missingChainUntilAdded,
      announcedWalletName: walletName,
      announcedWalletRdns: walletRdns
    }
  );
}
