# EditableText Component

A reusable React component for making text content editable inline with a clean UI for editing, saving, and canceling changes.

## Features

- Inline editing with hover-to-edit functionality
- Support for single-line and multi-line text
- Save/Cancel buttons with loading states
- Automatic API integration for persisting changes
- Flexible rendering as different HTML elements (h1, h2, h3, h4, p, span)
- Edit mode toggle support

## Usage

```tsx
import EditableText from "@/components/EditableText";

<EditableText
  initialValue="Your text here"
  fieldName="heroDescription"
  isEditMode={true}
  className="text-lg font-bold"
  as="h2"
  multiline={false}
/>;
```

## Props

| Prop           | Type                                            | Required | Default | Description                                               |
| -------------- | ----------------------------------------------- | -------- | ------- | --------------------------------------------------------- |
| `initialValue` | `string`                                        | Yes      | -       | The initial text value to display                         |
| `fieldName`    | `string`                                        | Yes      | -       | The field name used when saving to the API                |
| `isEditMode`   | `boolean`                                       | Yes      | -       | Whether edit mode is enabled (shows edit button on hover) |
| `className`    | `string`                                        | No       | `""`    | CSS classes to apply to the rendered element              |
| `as`           | `"h1" \| "h2" \| "h3" \| "h4" \| "p" \| "span"` | No       | `"p"`   | The HTML element to render                                |
| `multiline`    | `boolean`                                       | No       | `false` | Whether to use a textarea (true) or input (false)         |

## API Integration

The component automatically sends updates to `/api/homepage/update-content` with the following payload:

```json
{
  "[fieldName]": "updated value"
}
```

### API Route Example

```typescript
// app/api/homepage/update-content/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const client = await clientPromise;
    const db = client.db("your_database");
    const collection = db.collection("homepage");

    await collection.updateOne({}, { $set: body }, { upsert: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    );
  }
}
```

## Examples

### Simple Text

```tsx
<EditableText
  initialValue="Welcome to our site"
  fieldName="welcomeText"
  isEditMode={isEditMode}
  className="text-2xl font-bold"
  as="h1"
/>
```

### Multi-line Description

```tsx
<EditableText
  initialValue="This is a longer description that spans multiple lines..."
  fieldName="description"
  isEditMode={isEditMode}
  className="text-base opacity-75"
  as="p"
  multiline={true}
/>
```

### Inline Span

```tsx
<EditableText
  initialValue="Click here"
  fieldName="buttonText"
  isEditMode={isEditMode}
  className="font-semibold"
  as="span"
/>
```

### Feature List Item

```tsx
<div className="flex items-center gap-2">
  <Icon />
  <EditableText
    initialValue="Healthy"
    fieldName="feature1"
    isEditMode={isEditMode}
    className="text-sm"
    as="span"
  />
</div>
```

## Behavior

### View Mode (`isEditMode={false}`)

- Renders the text as the specified HTML element
- No editing functionality visible

### Edit Mode (`isEditMode={true}`)

- Shows edit icon on hover
- Clicking the edit icon opens the editor
- Editor shows input/textarea with current value
- Save button persists changes to the API
- Cancel button reverts to the last saved value
- Loading state during save operation

## Styling

The component uses Tailwind CSS classes and can be customized via the `className` prop. The edit button and form controls have predefined styles that match the design system:

- Edit button: Brown background (`#58483B`) with white icon
- Save button: Brown background with white text
- Cancel button: Gray background with black text
- Input/Textarea: Brown border with focus ring

## Notes

- The component maintains local state for the current value and temporary editing value
- Changes are only persisted when the Save button is clicked
- The edit button appears on hover when in edit mode
- The component handles loading states and error messages
- For multi-line text, the textarea automatically adjusts to 3 rows
