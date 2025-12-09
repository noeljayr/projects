# Video Upload Feature

## Overview

The Rich Text Editor now supports video uploads in addition to images. Users can upload, resize, caption, and manage video content directly within the editor.

## Features

### Video Upload

- **Button Upload**: Click the video icon in the toolbar to select a video file
- **Drag & Drop**: Drag video files directly into the editor
- **Supported Formats**: MP4, WebM, MOV, and other browser-supported video formats
- **File Size Limit**: Maximum 100MB per video file

### Video Controls

- **Native Controls**: Videos include built-in play/pause, volume, and fullscreen controls
- **Resize Handles**: 8 resize handles (corners and sides) for adjusting video size
- **Aspect Ratio**: Videos maintain their aspect ratio when resizing
- **Captions**: Optional text captions below each video
- **Remove Button**: Delete videos with the × button (appears on hover)

### Video Management

- **Selection**: Click on a video to select it (shows blue border)
- **Keyboard Delete**: Press Delete or Backspace to remove selected videos
- **Drag to Reorder**: Drag videos to reorder them within the content
- **Undo/Redo**: Video operations are tracked in the editor history

## Usage

### Programmatic Usage

```tsx
import RichTextEditor from "@/components/editor/RichTextEditor";

function MyComponent() {
  const [content, setContent] = useState("");

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      disableVideoButton={false} // Enable video uploads (default)
    />
  );
}
```

### Disable Video Uploads

```tsx
<RichTextEditor
  value={content}
  onChange={setContent}
  disableVideoButton={true} // Disable video button
/>
```

## Technical Details

### Video Wrapper Structure

```html
<div class="video-wrapper" contenteditable="false">
  <video src="/uploads/video.mp4" controls preload="metadata"></video>
  <input
    type="text"
    class="video-caption"
    placeholder="Videounterschrift hinzufügen (optional)"
  />
  <button class="video-remove-btn">×</button>
  <!-- 8 resize handles -->
</div>
```

### Upload Process

1. User selects or drops a video file
2. File is validated (type and size)
3. Upload progress indicator appears
4. File is uploaded to `/api/images/upload`
5. Server returns the video URL
6. Video wrapper is inserted at cursor position
7. Video is ready for playback and editing

### Storage

- Videos are stored in `/public/uploads/`
- Filenames are generated with timestamp and random string
- Format: `{timestamp}-{random}.{extension}`

## API Endpoint

The existing `/api/images/upload` endpoint has been updated to handle both images and videos:

```typescript
POST /api/images/upload
Content-Type: multipart/form-data

Body:
- file: File (image or video)

Response:
{
  "url": "/uploads/filename.mp4",
  "type": "video" | "image"
}
```

## Styling

Video-specific CSS classes:

- `.video-wrapper` - Container for video and controls
- `.video-caption` - Caption input field
- `.video-remove-btn` - Remove button
- `.upload-progress` - Upload progress indicator
- `.upload-progress-bar` - Progress bar container
- `.upload-progress-fill` - Progress bar fill

## Browser Compatibility

Videos use the native HTML5 `<video>` element with the following attributes:

- `controls` - Shows native playback controls
- `preload="metadata"` - Loads video metadata for thumbnail
- Browser support: All modern browsers (Chrome, Firefox, Safari, Edge)

## Performance Considerations

- **File Size**: 100MB limit prevents excessive upload times
- **Lazy Loading**: Videos use `preload="metadata"` to load only metadata initially
- **Resize Observer**: Efficiently tracks video dimension changes
- **Memory Management**: ResizeObservers are properly cleaned up on unmount

## Future Enhancements

Potential improvements:

- Video thumbnail/poster image upload
- Video trimming/editing capabilities
- Multiple video format conversion
- Progress bar during upload
- Video compression before upload
- Cloud storage integration (S3, Cloudinary, etc.)
