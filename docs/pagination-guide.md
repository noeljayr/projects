# Server-Side Pagination with URL Navigation

This guide explains how to implement server-side pagination with URL-based navigation in your Next.js app.

## Overview

The pagination system provides:

- **Server-side data fetching** - Only fetch the data you need
- **URL-based navigation** - Users can bookmark, share, and navigate with browser back/forward
- **Search and filtering** - Integrated with pagination
- **SEO-friendly** - Search engines can crawl paginated content

## Key Components

### 1. URL Utilities (`lib/url-utils.ts`)

- `extractPaginationParams()` - Extract pagination params from URL
- `updateSearchParams()` - Update URL parameters while preserving others
- `buildMongoQuery()` - Build MongoDB query from search parameters
- `buildMongoSort()` - Build MongoDB sort object

### 2. Pagination Component (`components/ui/Pagination.tsx`)

- Reusable pagination UI component
- Handles ellipsis for large page counts
- Customizable styling

## Implementation Example

### Server Component (Page)

```tsx
// app/your-page/page.tsx
import {
  extractPaginationParams,
  buildMongoQuery,
  buildMongoSort,
} from "@/lib/url-utils";

type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function YourPage({ searchParams }: PageProps) {
  // Extract URL parameters
  const { page, limit, search, sort } = extractPaginationParams(searchParams);
  const skip = (page - 1) * limit;

  // Build database query
  const collection = db.collection("your-collection");
  const query = buildMongoQuery(search, { status: "published" });
  const sortOrder = buildMongoSort(sort);

  // Fetch paginated data
  const [data, totalCount] = await Promise.all([
    collection.find(query).sort(sortOrder).skip(skip).limit(limit).toArray(),
    collection.countDocuments(query),
  ]);

  // Calculate pagination info
  const paginationInfo = {
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
    hasNextPage: page < Math.ceil(totalCount / limit),
    hasPrevPage: page > 1,
    limit,
  };

  return (
    <YourPageWrapper
      data={data}
      paginationInfo={paginationInfo}
      currentSearch={search}
      currentSort={sort}
    />
  );
}
```

### Client Component (Navigation)

```tsx
// components/YourPageClient.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { updateSearchParams } from "@/lib/url-utils";
import Pagination from "@/components/ui/Pagination";

export default function YourPageClient({ data, paginationInfo, currentSearch, currentSort }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateURL = (updates: Record<string, string | number | null>) => {
    const newURL = updateSearchParams(searchParams, updates);
    startTransition(() => {
      router.push(\`/your-page\${newURL}\`);
    });
  };

  const handleSearch = (searchQuery: string) => {
    updateURL({ search: searchQuery });
  };

  const handleSortChange = (newSort: "new" | "old") => {
    updateURL({ sort: newSort });
  };

  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  return (
    <div>
      {/* Your search and sort controls */}

      {/* Your data display */}
      {data.map(item => (
        <YourItemComponent key={item.id} item={item} />
      ))}

      {/* Pagination */}
      <Pagination
        currentPage={paginationInfo.currentPage}
        totalPages={paginationInfo.totalPages}
        onPageChange={handlePageChange}
        disabled={isPending}
        className="mt-8"
      />
    </div>
  );
}
```

## URL Structure

The system uses these URL parameters:

- `page` - Current page number (default: 1)
- `limit` - Items per page (default: 9)
- `search` - Search query string
- `sort` - Sort order: "new" or "old" (default: "new")

Example URLs:

- `/news` - First page, default settings
- `/news?page=2` - Second page
- `/news?search=beauceron&sort=old` - Search with oldest first
- `/news?page=3&search=welpen&limit=12` - Third page with search and custom limit

## Benefits

1. **Performance** - Only fetch needed data from database
2. **SEO** - Each page has unique URL for search engines
3. **User Experience** - Bookmarkable URLs, browser navigation works
4. **Scalability** - Handles large datasets efficiently
5. **Flexibility** - Easy to add new filters and sorting options

## Customization

### Change Items Per Page

```tsx
const { page, limit, search, sort } = extractPaginationParams(searchParams);
// Override default limit
const actualLimit = limit || 12; // Use 12 instead of default 9
```

### Add Custom Filters

```tsx
const category = searchParams.category as string;
const query = buildMongoQuery(search, {
  status: "published",
  ...(category && { category }),
});
```

### Custom Sort Fields

```tsx
const sortOrder = buildMongoSort(sort, "publishedAt"); // Use publishedAt instead of createdAt
```
