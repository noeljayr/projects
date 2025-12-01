import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import fs from "fs";
import path from "path";

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("vom_sauterhof");

    // Default images for the dark section
    const defaultImages = {
      darkSection1: "/section-3.1.png",
      darkSection2: "/section-3.2.png",
      darkSection3: "/section-3.3.png",
      darkSection4: "/section-3.4.png",
    };

    // Convert images to base64
    const imagesWithBase64: Record<string, string> = {};

    for (const [key, imagePath] of Object.entries(defaultImages)) {
      try {
        const fullPath = path.join(process.cwd(), "public", imagePath);
        const imageBuffer = fs.readFileSync(fullPath);
        const base64 = imageBuffer.toString("base64");
        const ext = path.extname(imagePath).slice(1);
        imagesWithBase64[key] = `data:image/${ext};base64,${base64}`;
      } catch (error) {
        console.error(`Error reading image ${imagePath}:`, error);
        imagesWithBase64[key] = imagePath; // Fallback to path
      }
    }

    await db
      .collection("images")
      .updateOne(
        { _id: "site-images" } as any,
        { $set: { ...imagesWithBase64, updatedAt: new Date() } },
        { upsert: true }
      );

    return NextResponse.json({
      success: true,
      message: "Images seeded successfully",
    });
  } catch (error) {
    console.error("Error seeding images:", error);
    return NextResponse.json(
      { error: "Failed to seed images" },
      { status: 500 }
    );
  }
}
