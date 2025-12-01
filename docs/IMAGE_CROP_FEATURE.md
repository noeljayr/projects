# Image Crop Feature

## Overview

Added a square aspect ratio image cropping feature to the Rich Text Editor. All images uploaded or dropped into the editor will now be cropped to a 1:1 (square) aspect ratio before insertion.

## Changes Made

### 1. New Component: `ImageCropModal.tsx`

- Created a modal component using `react-easy-crop` library
- Provides an interactive cropping interface with:
  - Square aspect ratio (1:1) enforced
  - Zoom slider (1x to 3x)
  - Drag to reposition the crop area
  - Cancel and Crop buttons

### 2. Updated: `RichTextEditor.tsx`

- Added state management for crop modal:
  - `showCropModal`: Controls modal visibility
  - `imageToCrop`: Stores the image data URL to be cropped
- Modified `handleImageUpload`: Now opens crop modal instead of directly inserting
- Modified `handleDroppedFiles`: Opens crop modal for drag-and-drop images
- Added handlers:
  - `handleCropComplete`: Inserts the cropped image into the editor
  - `handleCropCancel`: Closes the modal without inserting

### 3. Updated: `RichTextEditor.css`

- Added styles for the crop modal
- Styled the zoom slider
- Added crop area border styling

## Dependencies

- `react-easy-crop@^5.5.5` - Already installed

## Benefits

- Consistent image dimensions across all editor content
- Easier styling and layout management
- Better visual consistency
- User-friendly cropping interface

## Usage

1. Click the image button or drag an image into the editor
2. The crop modal appears with the image
3. Adjust the crop area by dragging and zooming
4. Click "Zuschneiden" (Crop) to insert the cropped image
5. Click "Stornieren" (Cancel) to abort

All images are automatically cropped to square format, ensuring uniform dimensions throughout your content.
