export function clampPage(page: number, totalPages: number) {
  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.min(page, Math.max(totalPages, 1));
}

export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = clampPage(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: items.slice(start, end),
    totalItems,
    totalPages,
    page: safePage
  };
}

export function getDescendingTokenPage(totalSupply: number, page: number, pageSize: number) {
  const totalItems = Math.max(totalSupply, 0);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = clampPage(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = Math.min(start + pageSize, totalItems);

  return {
    items: Array.from({ length: Math.max(end - start, 0) }, (_, index) => totalItems - 1 - (start + index)),
    totalItems,
    totalPages,
    page: safePage
  };
}

export function getPaginationWindow(page: number, totalPages: number, siblingCount = 1) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const safePage = clampPage(page, totalPages);
  const left = Math.max(safePage - siblingCount, 2);
  const right = Math.min(safePage + siblingCount, totalPages - 1);
  const pages: Array<number | "ellipsis"> = [1];

  if (left > 2) {
    pages.push("ellipsis");
  }

  for (let current = left; current <= right; current += 1) {
    pages.push(current);
  }

  if (right < totalPages - 1) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);
  return pages;
}
