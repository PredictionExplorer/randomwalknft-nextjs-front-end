import type {
  CollectionQueryState,
  CollectionViewMode
} from "@/lib/types";

function parsePositiveInteger(value: string | string[] | undefined) {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

export function parseCollectionQueryState(
  searchParams: Record<string, string | string[] | undefined>
): CollectionQueryState {
  const sortBy = searchParams.sortBy === "beauty" ? "beauty" : "tokenId";
  const view = searchParams.view === "compact" ? "compact" : "gallery";
  const page = Math.max(parsePositiveInteger(searchParams.page) ?? 1, 1);
  const query = parsePositiveInteger(searchParams.query);
  const address = typeof searchParams.address === "string" ? searchParams.address : undefined;

  return {
    address,
    query,
    sortBy,
    page,
    view
  };
}

export function buildCollectionSearchParams(state: CollectionQueryState) {
  const params = new URLSearchParams();

  if (state.address) {
    params.set("address", state.address);
  }
  if (state.query !== undefined) {
    params.set("query", String(state.query));
  }
  if (state.sortBy !== "tokenId") {
    params.set("sortBy", state.sortBy);
  }
  if (state.page > 1) {
    params.set("page", String(state.page));
  }
  if (state.view !== "gallery") {
    params.set("view", state.view);
  }

  return params;
}

export function getCollectionViewLabel(view: CollectionViewMode) {
  return view === "compact" ? "Compact" : "Gallery";
}
