# API Authentication Protection

## Overview

All content editing API endpoints are now protected with authentication checks. Only authenticated users with valid sessions can modify content.

## Protected Endpoints

### Image Management

- `POST /api/images/update` - Update site images

### Homepage Content

- `POST /api/homepage/update-content` - Update homepage content
- `POST /api/homepage/update-hero-title` - Update hero title

### Banner Content

- `POST /api/banners/update-content` - Update banner content for any page

### About Page Content

- `POST /api/about/update-content` - Update about page content

### Footer Content

- `POST /api/footer/update-content` - Update footer content

### News Management (Already Protected)

- `POST /api/news/create` - Create news articles
- `PUT /api/news/update` - Update news articles
- `DELETE /api/news/delete` - Delete news articles
- `PUT /api/news/update-status` - Update news status (publish/draft)

## Authentication Flow

1. User must be logged in with a valid session cookie
2. Each protected endpoint calls `verifyAuth(request)` from `lib/auth.ts`
3. The auth check verifies:

   - Session token exists in cookies
   - User data exists in cookies
   - Session is valid in the database
   - Session hasn't expired
   - User account is enabled

4. If authentication fails, the API returns:
   ```json
   {
     "error": "Unauthorized"
   }
   ```
   with HTTP status `401`

## Implementation Details

All protected routes follow this pattern:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ... rest of the endpoint logic
  } catch (error) {
    // ... error handling
  }
}
```

## Testing

To test authentication:

1. Try accessing any protected endpoint without being logged in - should return 401
2. Log in through `/auth/login`
3. Access the same endpoint - should work successfully
4. Log out through `/auth/signout`
5. Try accessing the endpoint again - should return 401

## Security Notes

- All content editing operations require authentication
- Session tokens are stored in HTTP-only cookies
- Sessions have expiration times
- Disabled user accounts cannot access protected endpoints
- The middleware also protects `/content` routes at the page level
