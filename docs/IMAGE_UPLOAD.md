# Image Upload System

## Overview

The rich text editor now uses file uploads instead of base64 encoding to handle images. This prevents "entity too large" errors when saving content with images.

## How It Works

1. **User uploads an image** via the rich text editor
2. **Image is cropped** using the crop modal
3. **Cropped image is uploaded** to `/api/images/upload`
4. **Server saves the image** to `/public/uploads/` with a unique filename
5. **URL is returned** and inserted into the editor (e.g., `/uploads/1234567890-abc123.jpg`)
6. **Content is saved** with the image URL instead of base64 data

## API Endpoint

### POST `/api/images/upload`

Uploads an image file and returns its public URL.

**Request:**

- Content-Type: `multipart/form-data`
- Body: FormData with `file` field containing the image

**Response:**

```json
{
  "url": "/uploads/1234567890-abc123.jpg"
}
```

**Error Responses:**

- 400: No file provided or file is not an image
- 500: Server error during upload

## File Storage

- Uploaded images are stored in `/public/uploads/`
- Filenames are generated using: `{timestamp}-{random}.{extension}`
- The uploads folder is gitignored to avoid committing user-uploaded content

## Benefits

- **No more "entity too large" errors** - URLs are much smaller than base64 strings
- **Better performance** - Images are loaded separately, not embedded in HTML
- **Easier caching** - Browsers can cache images independently
- **Smaller database** - Only URLs are stored, not entire image data
