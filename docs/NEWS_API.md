# News API Documentation

## Overview

The News API provides endpoints for creating, reading, updating, and deleting news articles. All write operations require authentication.

## Endpoints

### 1. Create News

**POST** `/api/news/create`

Creates a new news article with support for draft and published status.

**Authentication:** Required

**Request Body:**

```json
{
  "title": "News Title",
  "content": "<p>HTML content from rich text editor</p>",
  "coverImage": "data:image/png;base64,...", // Base64 encoded image (optional)
  "status": "draft" // or "published"
}
```

**Response:**

```json
{
  "success": true,
  "message": "News published successfully",
  "newsId": "507f1f77bcf86cd799439011",
  "slug": "news-title"
}
```

---

### 2. List News

**GET** `/api/news/list`

Retrieves all news articles sorted by creation date (newest first).

**Authentication:** Not required

**Response:**

```json
{
  "success": true,
  "news": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "News Title",
      "author": "username",
      "content": "<p>HTML content</p>",
      "date": "23 October 2025",
      "hasVideo": false,
      "coverImage": "data:image/png;base64,...",
      "slug": "news-title",
      "status": "published"
    }
  ]
}
```

---

### 3. Update News

**PUT** `/api/news/update`

Updates an existing news article.

**Authentication:** Required

**Request Body:**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Updated Title",
  "content": "<p>Updated content</p>",
  "coverImage": "data:image/png;base64,...",
  "status": "published"
}
```

**Response:**

```json
{
  "success": true,
  "message": "News updated successfully"
}
```

---

### 4. Update News Status

**PUT** `/api/news/update-status`

Updates the status of multiple news articles (publish/unpublish).

**Authentication:** Required

**Request Body:**

```json
{
  "ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "status": "draft" // or "published"
}
```

**Response:**

```json
{
  "success": true,
  "message": "2 news item(s) unpublished successfully"
}
```

---

### 5. Delete News

**DELETE** `/api/news/delete`

Deletes one or multiple news articles.

**Authentication:** Required

**Query Parameters:**

- `id` - Single news ID to delete
- `ids` - Comma-separated list of news IDs to delete

**Examples:**

- `/api/news/delete?id=507f1f77bcf86cd799439011`
- `/api/news/delete?ids=507f1f77bcf86cd799439011,507f1f77bcf86cd799439012`

**Response:**

```json
{
  "success": true,
  "message": "2 news item(s) deleted successfully"
}
```

---

## Database Schema

### News Collection

```typescript
{
  _id: ObjectId,
  title: string,
  content: string,
  coverImage: string, // Base64 encoded image
  slug: string,
  author: string,
  status: "draft" | "published",
  hasVideo: boolean,
  date: string, // Formatted date string
  createdAt: Date,
  updatedAt: Date
}
```

---

## Features

### Cover Image Storage

- Cover images are stored as **base64 encoded strings** directly in the database
- Supports all common image formats (PNG, JPEG, GIF, WebP, etc.)
- No external file storage required

### Draft Support

- News can be saved as drafts before publishing
- Draft news can be edited and published later
- Published news can be unpublished back to draft status

### Slug Generation

- Automatically generates URL-friendly slugs from titles
- Handles German characters (ä, ö, ü, ß)
- Ensures unique slugs by appending timestamps if needed

### Authentication

- All write operations (create, update, delete) require authentication
- Uses session-based authentication
- Validates user permissions before allowing operations

---

## Usage Example

### Creating a News Article

```typescript
const response = await fetch("/api/news/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "My News Article",
    content: "<p>This is the content</p>",
    coverImage: "data:image/png;base64,iVBORw0KG...",
    status: "published",
  }),
});

const data = await response.json();
if (data.success) {
  console.log("News created:", data.newsId);
}
```
