# Seed Images Script

To seed the images into the database, you can use one of these methods:

## Method 1: Using curl (if server is running)

```bash
curl -X POST http://localhost:3000/api/images/seed
```

## Method 2: Using browser console

1. Open your browser's developer console (F12)
2. Run this code:

```javascript
fetch("/api/images/seed", { method: "POST" })
  .then((r) => r.json())
  .then(console.log);
```

## Method 3: Create a test page

Visit: `http://localhost:3000/api/images/seed` (if you add a GET handler)

## Verify Images Were Seeded

```javascript
fetch("/api/images/get")
  .then((r) => r.json())
  .then(console.log);
```

You should see the base64 encoded images in the response.
