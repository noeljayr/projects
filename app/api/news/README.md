# News API Documentation

## Endpoints

### GET /api/news/list

Fetches paginated news articles (admin endpoint - includes all statuses).

**Query Parameters:**

- `page` (optional): Page number, default is 1
- `limit` (optional): Items per page, default is 10, max is 100
- `status` (optional): Filter by status ("published" or "draft")

**Example Request:**

```
GET /api/news/list?page=1&limit=10&status=published
```

**Response:**

```json
{
  "success": true,
  "news": [
    {
      "id": "...",
      "title": "...",
      "author": "...",
      "content": "...",
      "date": "...",
      "hasVideo": false,
      "coverImage": "...",
      "slug": "...",
      "status": "published"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "limit": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### GET /api/news/public

Fetches paginated published news articles (public endpoint - only published articles).

**Query Parameters:**

- `page` (optional): Page number, default is 1
- `limit` (optional): Items per page, default is 12, max is 50

**Example Request:**

```
GET /api/news/public?page=1&limit=12
```

**Response:**
Same structure as `/api/news/list` but only includes published articles.

## Usage Examples

### Using the Custom Hook

```typescript
import { useNews, usePublicNews } from "@/hooks/useNews";

// Admin usage - with status filter
function AdminNewsPage() {
  const { news, pagination, isLoading, error, refetch } = useNews({
    page: 1,
    limit: 10,
    status: "published",
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {news.map((article) => (
        <div key={article.id}>{article.title}</div>
      ))}
    </div>
  );
}

// Public usage
function PublicNewsPage() {
  const { news, pagination, isLoading } = usePublicNews({
    page: 1,
    limit: 12,
  });

  return (
    <div>
      {news.map((article) => (
        <div key={article.id}>{article.title}</div>
      ))}
    </div>
  );
}
```

### Using the Pagination Component

```typescript
import Pagination from "@/components/ui/Pagination";

function MyComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ... fetch data with pagination

  return (
    <div>
      {/* Your content */}

      <Pagination
        pagination={pagination}
        onPageChange={setCurrentPage}
        onLimitChange={(limit) => {
          setItemsPerPage(limit);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
```

## Types

```typescript
export type PaginationMeta = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedNewsResponse = {
  success: boolean;
  news: News[];
  pagination: PaginationMeta;
  message?: string;
};
```
