const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

export function parsePagination(
  pageValue: string | null,
  limitValue: string | null
): { page: number; limit: number } {
  const requestedPage = Number.parseInt(pageValue ?? '', 10);
  const requestedLimit = Number.parseInt(limitValue ?? '', 10);

  return {
    page: Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
    limit:
      Number.isSafeInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, MAX_PAGE_SIZE)
        : DEFAULT_PAGE_SIZE,
  };
}
