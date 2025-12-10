/**
 * Migration script to convert base64 images to database URLs
 * for existing welpen and timeline entries
 */

import clientPromise from "@/lib/mongodb";
import { GridFSBucket } from "mongodb";

async function migrateImages() {
  try {
    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const bucket = new GridFSBucket(db, { bucketName: "media_files" });

    // Migrate welpen entries
    console.log("Migrating welpen entries...");
    const welpenCollection = db.collection("welpen_entries");
    const welpenEntries = await welpenCollection.find({}).toArray();

    for (const entry of welpenEntries) {
      let hasChanges = false;
      const updatedDogs = [];

      for (const dog of entry.dogs || []) {
        if (dog.image && dog.image.startsWith("data:image/")) {
          try {
            // Convert base64 to buffer
            const base64Data = dog.image.split(",")[1];
            const buffer = Buffer.from(base64Data, "base64");

            // Generate filename
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const filename = `migrated-${timestamp}-${randomString}.jpg`;

            // Upload to GridFS
            const uploadStream = bucket.openUploadStream(filename, {
              metadata: {
                originalName: `migrated-welpen-${entry._id}-${
                  dog.name || "unnamed"
                }.jpg`,
                contentType: "image/jpeg",
                uploadedAt: new Date(),
                fileType: "image",
                migratedFrom: "base64",
              },
            });

            await new Promise((resolve, reject) => {
              uploadStream.write(buffer);
              uploadStream.end();
              uploadStream.on("finish", () => resolve(uploadStream.id));
              uploadStream.on("error", reject);
            });

            // Update dog with database URL
            updatedDogs.push({
              ...dog,
              image: `/api/media/${uploadStream.id.toString()}`,
            });
            hasChanges = true;
            console.log(
              `Migrated image for welpen entry ${entry._id}, dog: ${
                dog.name || "unnamed"
              }`
            );
          } catch (error) {
            console.error(
              `Failed to migrate image for welpen entry ${entry._id}:`,
              error
            );
            updatedDogs.push(dog); // Keep original if migration fails
          }
        } else {
          updatedDogs.push(dog);
        }
      }

      if (hasChanges) {
        await welpenCollection.updateOne(
          { _id: entry._id },
          { $set: { dogs: updatedDogs, updatedAt: new Date() } }
        );
        console.log(`Updated welpen entry ${entry._id}`);
      }
    }

    // Migrate timeline entries
    console.log("Migrating timeline entries...");
    const timelineCollection = db.collection("timeline");
    const timelineEntries = await timelineCollection.find({}).toArray();

    for (const entry of timelineEntries) {
      let hasChanges = false;
      const updatedDogs = [];

      for (const dog of entry.dogs || []) {
        if (dog.image && dog.image.startsWith("data:image/")) {
          try {
            // Convert base64 to buffer
            const base64Data = dog.image.split(",")[1];
            const buffer = Buffer.from(base64Data, "base64");

            // Generate filename
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const filename = `migrated-${timestamp}-${randomString}.jpg`;

            // Upload to GridFS
            const uploadStream = bucket.openUploadStream(filename, {
              metadata: {
                originalName: `migrated-timeline-${entry._id}-${
                  dog.name || "unnamed"
                }.jpg`,
                contentType: "image/jpeg",
                uploadedAt: new Date(),
                fileType: "image",
                migratedFrom: "base64",
              },
            });

            await new Promise((resolve, reject) => {
              uploadStream.write(buffer);
              uploadStream.end();
              uploadStream.on("finish", () => resolve(uploadStream.id));
              uploadStream.on("error", reject);
            });

            // Update dog with database URL
            updatedDogs.push({
              ...dog,
              image: `/api/media/${uploadStream.id.toString()}`,
            });
            hasChanges = true;
            console.log(
              `Migrated image for timeline entry ${entry._id}, dog: ${
                dog.name || "unnamed"
              }`
            );
          } catch (error) {
            console.error(
              `Failed to migrate image for timeline entry ${entry._id}:`,
              error
            );
            updatedDogs.push(dog); // Keep original if migration fails
          }
        } else {
          updatedDogs.push(dog);
        }
      }

      if (hasChanges) {
        await timelineCollection.updateOne(
          { _id: entry._id },
          { $set: { dogs: updatedDogs, updatedAt: new Date() } }
        );
        console.log(`Updated timeline entry ${entry._id}`);
      }
    }

    // Migrate wurf cover images
    console.log("Migrating wurf cover images...");
    const wurfCollection = db.collection("wurf");
    const wurfEntries = await wurfCollection.find({}).toArray();

    for (const entry of wurfEntries) {
      if (entry.image && entry.image.startsWith("data:image/")) {
        try {
          // Convert base64 to buffer
          const base64Data = entry.image.split(",")[1];
          const buffer = Buffer.from(base64Data, "base64");

          // Generate filename
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const filename = `migrated-${timestamp}-${randomString}.jpg`;

          // Upload to GridFS
          const uploadStream = bucket.openUploadStream(filename, {
            metadata: {
              originalName: `migrated-wurf-${entry._id}-${
                entry.name || "unnamed"
              }.jpg`,
              contentType: "image/jpeg",
              uploadedAt: new Date(),
              fileType: "image",
              migratedFrom: "base64",
            },
          });

          await new Promise((resolve, reject) => {
            uploadStream.write(buffer);
            uploadStream.end();
            uploadStream.on("finish", () => resolve(uploadStream.id));
            uploadStream.on("error", reject);
          });

          // Update wurf with database URL
          await wurfCollection.updateOne(
            { _id: entry._id },
            {
              $set: {
                image: `/api/media/${uploadStream.id.toString()}`,
                updatedAt: new Date(),
              },
            }
          );
          console.log(
            `Migrated cover image for wurf entry ${entry._id}: ${entry.name}`
          );
        } catch (error) {
          console.error(
            `Failed to migrate cover image for wurf entry ${entry._id}:`,
            error
          );
        }
      }
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateImages()
    .then(() => {
      console.log("Migration script finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration script failed:", error);
      process.exit(1);
    });
}

export { migrateImages };
