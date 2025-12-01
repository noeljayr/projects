# Database-Driven Content Setup

## Overview

All text content across the website is now stored in MongoDB instead of being hardcoded. This allows for easy content management and updates.

## Database Structure

- **Database**: `vom_sauterhof`
- **Collections**:
  - `homepage` - Homepage text content
  - `navbar` - Navigation menu text
  - `footer` - Footer text content
  - `about` - About us page content
  - `kontakt` - Contact page content
  - `banners` - Banner content for various pages
  - `newsPage` - News page UI text

## Quick Setup

### Seed All Content at Once

To populate all collections with initial content:

```bash
curl -X POST http://localhost:3000/api/seed-all
```

This will seed all collections in one go.

### Seed Individual Collections

You can also seed collections individually:

```bash
# Homepage
curl -X POST http://localhost:3000/api/seed-homepage

# Navbar
curl -X POST http://localhost:3000/api/seed-navbar

# Footer
curl -X POST http://localhost:3000/api/seed-footer

# About page
curl -X POST http://localhost:3000/api/seed-about

# Kontakt page
curl -X POST http://localhost:3000/api/seed-kontakt

# Banners
curl -X POST http://localhost:3000/api/seed-banners

# News page
curl -X POST http://localhost:3000/api/seed-news-page
```

## Collections Details

### 1. Homepage Collection

Contains all text for the homepage including hero section, features, dark section, and news heading.

**Fields**: `heroTitle`, `heroDescription`, `heroButtonText`, `contentHeading`, `contentSubheading`, `whyBreedTitle`, `whyBreedDescription`, `feature1-6`, `darkSectionTitle`, `darkSectionDescription`, `newsHeading`, `newsSeeAllText`, `newsSeeAllSubtext`

### 2. Navbar Collection

Contains navigation links and button text for both desktop and mobile menus.

**Fields**: `linkStart`, `linkAbout`, `linkNews`, `linkBreed`, `linkWurf`, `contactButton`, `mobileContactHeading`, `mobilePhone`, `mobileEmail`

### 3. Footer Collection

Contains company information, contact details, and footer links.

**Fields**: `companyName`, `address1`, `address2`, `phone`, `email`, `linksHeading`, `linkStart`, `linkAbout`, `linkNews`, `linkBeauceron`, `linkWurf`

### 4. About Collection

Contains all text content for the "Über uns" (About Us) page.

**Fields**: `bannerTitle`, `bannerDescription`, `welcomeHeading`, `welcomeText`, `homeHeading`, `homeText`, `breedingHeading`, `breedingText`, `packHeading`, `packText`, `finalText`

### 5. Kontakt Collection

Contains all text content for the "Kontakt" (Contact) page.

**Fields**: `bannerTitle`, `bannerDescription`, `familyName`, `addressLine1`, `addressLine2`, `phone`, `email`, `availabilityTitle`, `availabilityText`

### 6. Banners Collection

Contains banner titles and descriptions for different pages.

**Fields**: `page`, `title`, `description`

### 7. News Page Collection

Contains UI text for the news page.

**Fields**: `searchPlaceholder`, `sortNewest`, `sortOldest`

## How It Works

1. **Layout** (`app/layout.tsx`): Fetches navbar and footer content from MongoDB and passes to components
2. **Page Components**: Each page fetches its own content from MongoDB
3. **Client Components**: Receive content as props and render it
4. **API Routes**: Seed initial content to database

## Affected Components

- ✅ Homepage (`app/page.tsx` + `components/pages/page.tsx`)
- ✅ Navbar (`components/navbar.tsx`)
- ✅ Footer (`components/footer.tsx`)
- ✅ About Us page (`app/uber-uns/page.tsx`)
- ✅ Kontakt page (`app/kontakt/page.tsx` + `components/pages/KontaktClient.tsx`)
- ✅ News page (`app/news/page.tsx` + `components/pages/NewsPageClient.tsx`)
- ✅ Beauceron page (`app/unsere-beauceron/page.tsx`)
- ✅ Banners (`components/Banner.tsx`)

## Updating Content

You can update content in three ways:

1. **Re-run seed scripts**: Modify the seed API routes and re-run them
2. **Direct database access**: Update directly in MongoDB using a database client like MongoDB Compass
3. **Admin interface**: Create an admin panel to manage content (future enhancement)

## Important Notes

- All MongoDB ObjectIds are stripped before passing to client components to avoid serialization errors
- Content props use optional chaining with fallback values for graceful degradation
- The database connection is reused across requests for optimal performance
- Images are not stored in the database (only text content)
