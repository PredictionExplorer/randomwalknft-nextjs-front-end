import type { APIRequestContext } from "@playwright/test";

/** Where the deterministic upstream (tests/e2e/mock-upstream) listens during a run. */
export const MOCK_UPSTREAM_URL = `http://127.0.0.1:${process.env.MOCK_UPSTREAM_PORT ?? 3900}`;

export const isLiveUpstream = process.env.E2E_UPSTREAM === "live";

type MockStatePatch = {
  totalSupply?: number;
  withdrawalAmountEth?: number;
  mintPriceEth?: number;
  secondsUntilWithdrawal?: number;
  numWithdrawals?: number;
  lastMinter?: string;
  timeUntilSale?: number;
  pendingTokens?: number[];
  pendingMintHashes?: string[];
  names?: Record<number, string>;
  voteCount?: number;
};

/** Shapes the mock world for one scenario. No-op against the live upstream. */
export async function setMockState(request: APIRequestContext, patch: MockStatePatch) {
  if (isLiveUpstream) return;
  const response = await request.post(`${MOCK_UPSTREAM_URL}/__mock/state`, { data: patch });
  if (!response.ok()) {
    throw new Error(`mock upstream refused state patch: ${response.status()}`);
  }
}

export async function resetMockState(request: APIRequestContext) {
  if (isLiveUpstream) return;
  await request.post(`${MOCK_UPSTREAM_URL}/__mock/reset`);
}

/**
 * The app memoises vault reads for a few seconds; wait until its own /api/vault
 * reflects the mock world before driving the UI, so a scenario never races the cache.
 */
export async function waitForVault(
  request: APIRequestContext,
  predicate: (vault: { secondsUntilWithdrawal: number; mintedCount: number; prizeEth: number }) => boolean,
  timeoutMs = 30_000
) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const response = await request.get("/api/vault");
    if (response.ok()) {
      const vault = (await response.json()) as {
        secondsUntilWithdrawal: number;
        mintedCount: number;
        prizeEth: number;
      };
      if (predicate(vault)) return vault;
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error("timed out waiting for /api/vault to reflect the mock state");
}
