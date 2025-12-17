/**
 * Migration script to convert existing wurf categories to the new structure
 *
 * This script:
 * 1. Extracts unique categories from existing wurf entries
 * 2. Creates wurf_categories collection entries
 * 3. Updates wurf entries to reference category slugs instead of names
 *
 * Run with: npx tsx scripts/migrate-wurf-categories.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

import clientPromise from "../lib/mongodb";
import { generateSlug } from "../lib/generateSlug";

async function migrateWurfCategories() {
  console.log("Starting wurf categories migration...");

  try {
    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const wurfCollection = db.collection("wurf");
    const categoriesCollection = db.collection("wurf_categories");

    // Get all unique categories from wurf entries
    const allWurf = await wurfCollection.find({}).toArray();
    const uniqueCategories = [
      ...new Set(
        allWurf
          .map((w: any) => w.category)
          .filter((c: any) => c && typeof c === "string" && c.trim() !== "")
      ),
    ] as string[];

    console.log(`Found ${uniqueCategories.length} unique categories`);

    // Create category entries
    const categoryMap = new Map<string, string>(); // old name -> new slug

    for (const categoryName of uniqueCategories) {
      const baseSlug = generateSlug(categoryName);
      let slug = baseSlug;
      let counter = 1;

      // Ensure unique slug
      while (await categoriesCollection.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const newCategory = {
        name: categoryName.trim(),
        description: "", // Empty for now, can be filled later
        slug,
        status: "published",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await categoriesCollection.insertOne(newCategory);
      categoryMap.set(categoryName, slug);

      console.log(`Created category: ${categoryName} -> ${slug}`);
    }

    // Update wurf entries to use category slugs
    console.log("\nUpdating wurf entries...");
    let updatedCount = 0;

    for (const [oldName, newSlug] of categoryMap.entries()) {
      const result = await wurfCollection.updateMany(
        { category: oldName },
        { $set: { categorySlug: newSlug, updatedAt: new Date() } }
      );

      updatedCount += result.modifiedCount;
      console.log(
        `Updated ${result.modifiedCount} wurf entries for category: ${oldName}`
      );
    }

    console.log(`\nMigration complete!`);
    console.log(`- Created ${uniqueCategories.length} category entries`);
    console.log(`- Updated ${updatedCount} wurf entries`);
    console.log(
      `\nNote: Old 'category' field is kept for backward compatibility.`
    );
    console.log(`You can remove it after verifying everything works.`);
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration
migrateWurfCategories()
  .then(() => {
    console.log("\nMigration successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nMigration failed:", error);
    process.exit(1);
  });
