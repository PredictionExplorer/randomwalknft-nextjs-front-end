"use client";

import { useCallback, useEffect, useState } from "react";

async function fetchRandomTokenId(exclude?: number): Promise<number | null> {
  const url =
    exclude !== undefined ? `/api/random-token?exclude=${exclude}` : "/api/random-token";

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = (await response.json()) as { tokenId: number; totalSupply: number };
  return data.totalSupply > 0 ? data.tokenId : null;
}

type TokenHistoryState = {
  sourceInitialTokenId: number | undefined;
  history: number[];
  index: number;
};

function createInitialState(initialTokenId: number | undefined): TokenHistoryState {
  return {
    sourceInitialTokenId: initialTokenId,
    history: initialTokenId !== undefined ? [initialTokenId] : [],
    index: initialTokenId !== undefined ? 0 : -1
  };
}

function resolveHistoryState(
  state: TokenHistoryState,
  initialTokenId: number | undefined
): TokenHistoryState {
  if (state.sourceInitialTokenId === initialTokenId) {
    return state;
  }

  return createInitialState(initialTokenId);
}

/** Random image passes `initialTokenId`; random video omits it and fetches via /api/random-token. */
export function useRandomTokenHistory(initialTokenId?: number) {
  const [storedState, setStoredState] = useState<TokenHistoryState>(() =>
    createInitialState(initialTokenId)
  );
  const { history, index } = resolveHistoryState(storedState, initialTokenId);

  useEffect(() => {
    if (initialTokenId !== undefined) return;

    let cancelled = false;
    void fetchRandomTokenId().then((id) => {
      if (cancelled || id === null) return;
      setStoredState({
        sourceInitialTokenId: undefined,
        history: [id],
        index: 0
      });
    });
    return () => {
      cancelled = true;
    };
  }, [initialTokenId]);

  const currentTokenId = index >= 0 ? history[index] : undefined;
  const canGoBack = index > 0;

  const goBack = useCallback(() => {
    setStoredState((prev) => {
      const active = resolveHistoryState(prev, initialTokenId);
      return {
        ...active,
        index: Math.max(active.index - 1, 0)
      };
    });
  }, [initialTokenId]);

  const goNext = useCallback(async () => {
    if (index < history.length - 1) {
      setStoredState((prev) => {
        const active = resolveHistoryState(prev, initialTokenId);
        return {
          ...active,
          index: active.index + 1
        };
      });
      return;
    }

    const current = history[index];
    const nextId = await fetchRandomTokenId(current);
    if (nextId === null) return;

    setStoredState((prev) => {
      const active = resolveHistoryState(prev, initialTokenId);
      return {
        sourceInitialTokenId: initialTokenId,
        history: [...active.history.slice(0, active.index + 1), nextId],
        index: active.index + 1
      };
    });
  }, [index, history, initialTokenId]);

  return { currentTokenId, canGoBack, goBack, goNext };
}
