"use client";

import { useCallback, useEffect, useRef, useState } from "react";

async function fetchRandomTokenId(exclude?: number): Promise<number | null> {
  const url = exclude !== undefined
    ? `/api/random-token?exclude=${exclude}`
    : "/api/random-token";

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = (await response.json()) as { tokenId: number; totalSupply: number };
  return data.totalSupply > 0 ? data.tokenId : null;
}

export function useRandomTokenHistory(initialTokenId?: number) {
  const [history, setHistory] = useState<number[]>(
    () => (initialTokenId !== undefined ? [initialTokenId] : [])
  );
  const [index, setIndex] = useState(
    () => (initialTokenId !== undefined ? 0 : -1)
  );
  const bootstrapped = useRef(initialTokenId !== undefined);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    void fetchRandomTokenId().then((id) => {
      if (id !== null) {
        setHistory([id]);
        setIndex(0);
      }
    });
  }, []);

  const currentTokenId = index >= 0 ? history[index] : undefined;
  const canGoBack = index > 0;

  const goBack = useCallback(() => {
    setIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goNext = useCallback(async () => {
    if (index < history.length - 1) {
      setIndex((prev) => prev + 1);
      return;
    }

    const current = history[index];
    const nextId = await fetchRandomTokenId(current);
    if (nextId === null) return;

    setHistory((prev) => [...prev.slice(0, index + 1), nextId]);
    setIndex((prev) => prev + 1);
  }, [index, history]);

  return { currentTokenId, canGoBack, goBack, goNext };
}
