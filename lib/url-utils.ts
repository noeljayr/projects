/**
 * Utility functions for URL parameter management in pagination and filtering
 */

export type URLParams = Record<string, string | number | null | undefined>;

/**
 * Updates URL search parameters while preserving existing ones
 * @param currentParams - Current URLSearchParams object
 * @param updates - Object with parameter updates (null/undefined values will remove the parameter)
 * @param resetPage - Whether to reset page to 1 when other parameters change
 */
export function updateSearchParams(
  currentParams: URLSearchParams,
  updates: URLParams,
  resetPage = true
): string {
  const params = new URLSearchParams(currentParams.toString());

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      params.delete(key);
    } else if (key === "page" && value === 1) {
      // Don't include page=1 in URL (it's the default)
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  });

  return params.toString() ? `?${params.toString()}` : "";
}

/**
 * Extracts pagination parameters from search params with defaults
 */
export function extractPaginationParams(searchParams: {
  [key: string]: string | string[] | undefined;
}) {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 9;
  const search =
    typeof searchParams.search === "string" ? searchParams.search : "";
  const sort = (searchParams.sort === "old" ? "old" : "new") as "new" | "old";

  return { page, limit, search, sort };
}

/**
 * Builds MongoDB query object from search parameters
 */
export function buildMongoQuery(
  search: string,
  additionalFilters: Record<string, any> = {}
) {
  let query: any = { ...additionalFilters };

  if (search.trim()) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  return query;
}

/**
 * Builds MongoDB sort object from sort parameter
 */
export function buildMongoSort(
  sort: "new" | "old",
  defaultField = "createdAt"
) {
  return sort === "new"
    ? { [defaultField]: -1 as const }
    : { [defaultField]: 1 as const };
}
