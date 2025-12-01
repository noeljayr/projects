# SEO Optimization Guide

## Implemented SEO Features

### 1. Metadata Configuration

- **Root Layout** (`app/layout.tsx`): Comprehensive metadata including Open Graph, Twitter Cards, and Google verification
- **Page-specific metadata**: Each major page has custom titles and descriptions
- **Dynamic metadata**: News articles generate metadata based on content

### 2. Structured Data (JSON-LD)

- **Organization Schema**: Added to root layout for business information
- **NewsArticle Schema**: Automatically added to news detail pages
- **Breadcrumb Schema**: Component ready for navigation breadcrumbs

### 3. Sitemap & Robots

- **Dynamic Sitemap** (`app/sitemap.ts`): Auto-generates URLs including all published news articles
- **Robots.txt** (`public/robots.txt`): Configured to allow crawling while protecting admin areas

### 4. Web App Manifest

- **PWA Support** (`app/manifest.ts`): Makes the site installable as a progressive web app

### 5. Technical SEO

- Semantic HTML with proper lang attribute (`lang="de"`)
- Meta theme-color for mobile browsers
- Canonical URLs for all pages
- Proper image alt attributes (ensure these are added to images)

## Next Steps

### 1. Google Search Console Setup

1. Replace `your-google-verification-code` in `app/layout.tsx` with your actual verification code
2. Submit sitemap: `https://vom-sauterhof.de/sitemap.xml`
3. Monitor indexing status and fix any issues

### 2. Update Site URL

If your domain is different from `vom-sauterhof.de`, update:

- `app/layout.tsx` - metadataBase URL
- `lib/seo.ts` - siteConfig.url
- `app/sitemap.ts` - baseUrl
- `public/robots.txt` - Host and Sitemap URLs
- `components/StructuredData.tsx` - Organization schema URLs

### 3. Add Missing Images

Create these icon files in the `public` directory:

- `/icon-192.png` (192x192px)
- `/icon-512.png` (512x512px)
- `/apple-touch-icon.png` (180x180px)

### 4. Content Optimization

- Ensure all images have descriptive alt text
- Add internal linking between related pages
- Keep meta descriptions between 150-160 characters
- Use heading hierarchy properly (H1 → H2 → H3)

### 5. Performance

- Optimize images (use WebP format, lazy loading)
- Enable caching headers
- Consider adding a CDN
- Monitor Core Web Vitals

### 6. Social Media

- Add social media links to `components/StructuredData.tsx` sameAs array
- Create custom Open Graph images for key pages
- Test social sharing with Facebook Debugger and Twitter Card Validator

### 7. Analytics

Add analytics tracking:

```typescript
// In app/layout.tsx <head>
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
></script>
```

## SEO Checklist

- [x] Meta titles and descriptions
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] Structured data (JSON-LD)
- [x] Sitemap.xml
- [x] Robots.txt
- [x] Canonical URLs
- [x] Language attribute
- [x] Mobile-friendly meta tags
- [x] PWA manifest
- [ ] Google Search Console verification
- [ ] Image optimization
- [ ] Alt text for all images
- [ ] Analytics setup
- [ ] Social media integration
- [ ] Performance optimization

## Testing Tools

- **Google Search Console**: https://search.google.com/search-console
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **Rich Results Test**: https://search.google.com/test/rich-results
- **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
