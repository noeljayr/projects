# Editable Images Feature

This feature allows administrators to edit images on the website while in edit mode, similar to the EditableText component.

## Setup

### 1. Seed the Images Database

First, seed the images into the database by making a POST request to:

```bash
POST /api/images/seed
```

This will convert the default images to base64 and store them in the database.

### 2. Enable Edit Mode

Add `?mode=edit` to the URL to enable edit mode:

```
http://localhost:3000/?mode=edit
```

## Usage

### In Components

```tsx
import EditableImage from "@/components/EditableImage";

<EditableImage
  initialSrc={images.darkSection1 || "/section-3.1.png"}
  fieldName="darkSection1"
  isEditMode={isEditMode}
  alt="Person with dog"
  fill
  className="object-cover rounded-lg"
/>;
```

### Props

- `initialSrc`: The initial image source (can be URL or base64)
- `fieldName`: Unique identifier for the image in the database
- `isEditMode`: Boolean to enable/disable edit mode
- `alt`: Alt text for the image
- `fill`: (optional) Use Next.js Image fill mode
- `width`: (optional) Image width if not using fill
- `height`: (optional) Image height if not using fill
- `className`: (optional) CSS classes

## Features

- Hover over images in edit mode to see edit button
- Click edit to upload a new image
- Images are validated (type and size < 5MB)
- Images are stored as base64 in MongoDB
- Changes persist across sessions

## API Endpoints

- `POST /api/images/seed` - Seed default images
- `GET /api/images/get` - Get all images
- `POST /api/images/update` - Update a specific image
