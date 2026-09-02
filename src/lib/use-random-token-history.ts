"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";

const randomTokenResponseSchema = z.object({
  tokenId: z.number().int().nonnegative(),
  totalSupply: z.number().int().nonnegative()
});

async function fetchRandomTokenId(exclude: number | undefined, signal: AbortSignal): Promise<number | null> {
  const url = exclude !== undefined ? `/api/random-token?exclude=${exclude}` : "/api/random-token";

  const response = await fetch(url, { signal });
  if (!response.ok) return null;

  const parsed = randomTokenResponseSchema.safeParse(await response.json());
  if (!parsed.success) return null;
  return parsed.data.totalSupply > 0 ? parsed.data.tokenId : null;
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

function resolveHistoryState(state: TokenHistoryState, initialTokenId: number | undefined): TokenHistoryState {
  if (state.sourceInitialTokenId === initialTokenId) {
    return state;
  }

  return createInitialState(initialTokenId);
}

/** Random image passes `initialTokenId`; random video omits it and fetches via /api/random-token. */
export function useRandomTokenHistory(initialTokenId?: number) {
  const [storedState, setStoredState] = useState<TokenHistoryState>(() => createInitialState(initialTokenId));
  const { history, index } = resolveHistoryState(storedState, initialTokenId);
  // One in-flight "next" request at a time; rapid clicks must not fan out.
  const inFlight = useRef<AbortController | null>(null);

  useEffect(() => {
    if (initialTokenId !== undefined) return;

    const controller = new AbortController();
    fetchRandomTokenId(undefined, controller.signal)
      .then((id) => {
        if (controller.signal.aborted || id === null) return;
        setStoredState({
          sourceInitialTokenId: undefined,
          history: [id],
          index: 0
        });
      })
      .catch(() => undefined);
    return () => {
      controller.abort();
    };
  }, [initialTokenId]);

  useEffect(() => {
    return () => {
      inFlight.current?.abort();
    };
  }, []);

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

    if (inFlight.current) {
      return;
    }
    const controller = new AbortController();
    inFlight.current = controller;
    try {
      const nextId = await fetchRandomTokenId(history[index], controller.signal);
      if (controller.signal.aborted || nextId === null) return;

      setStoredState((prev) => {
        const active = resolveHistoryState(prev, initialTokenId);
        return {
          sourceInitialTokenId: initialTokenId,
          history: [...active.history.slice(0, active.index + 1), nextId],
          index: active.index + 1
        };
      });
    } catch {
      // Aborted or network failure: the visitor simply stays on the current work.
    } finally {
      if (inFlight.current === controller) {
        inFlight.current = null;
      }
    }
  }, [index, history, initialTokenId]);

  return { currentTokenId, canGoBack, goBack, goNext };
}
