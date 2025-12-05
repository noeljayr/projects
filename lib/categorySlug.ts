// Convert category name to URL-friendly slug
export function categoryToSlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}

// Convert slug back to category name
export function slugToCategory(
  slug: string,
  categories: string[]
): string | null {
  const normalized = slug.toLowerCase();

  // Find matching category (case-insensitive comparison of slugified versions)
  const match = categories.find((cat) => categoryToSlug(cat) === normalized);

  return match || null;
}
