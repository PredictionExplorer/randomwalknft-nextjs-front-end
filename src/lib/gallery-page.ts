import { PAGE_SIZE } from "@/lib/config";
import { getDescendingTokenPage, paginateItems } from "@/lib/pagination";
import type { CollectionQueryState } from "@/lib/types";

export type GalleryPageData = ReturnType<typeof paginateItems<number>>;

type GalleryInputs = {
  state: CollectionQueryState;
  /** Total minted; ignored for wallet views. */
  totalSupply: number;
  /** Ids in the wallet when `state.address` is set (any order). */
  walletTokenIds?: readonly number[] | undefined;
  /** API beauty order, worst first; required only when sorting by beauty. */
  ratingOrder?: readonly number[] | undefined;
};

/**
 * Turns a gallery URL state plus the raw chain/API data into the page of ids to
 * hang. Pure, so every branch — wallet walls, beauty rooms, jump-to-token, out of
 * range pages — is unit-tested without a server.
 */
export function resolveGalleryPage({
  state,
  totalSupply,
  walletTokenIds = [],
  ratingOrder = []
}: GalleryInputs): GalleryPageData {
  const { address, sortBy, query, page } = state;

  if (address) {
    let ids = [...walletTokenIds].sort((left, right) => right - left);
    if (sortBy === "beauty") {
      const owned = new Set(ids);
      ids = [...ratingOrder].reverse().filter((id) => owned.has(id));
    }
    if (query !== undefined) {
      ids = ids.filter((id) => id === query);
    }
    return paginateItems(ids, page, PAGE_SIZE);
  }

  if (query !== undefined) {
    const exists = query < totalSupply;
    return { items: exists ? [query] : [], totalItems: exists ? 1 : 0, totalPages: 1, page: 1 };
  }

  if (sortBy === "beauty") {
    return paginateItems([...ratingOrder].reverse(), page, PAGE_SIZE);
  }

  // Newest first without materialising thousands of ids.
  return getDescendingTokenPage(totalSupply, page, PAGE_SIZE);
}
