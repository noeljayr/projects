import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("vom_sauterhof");

    // Check if gallery already has data
    const existingCount = await db.collection("gallery").countDocuments();

    if (existingCount > 0) {
      return NextResponse.json(
        { message: "Gallery already has data" },
        { status: 200 }
      );
    }

    // Seed initial gallery data
    const initialGalleryImages = [
      {
        imageUrl: "/section-2.1-img.png",
        alt: "Rottweiler puppies in field",
        order: 1,
        createdAt: new Date(),
      },
      {
        imageUrl: "/section-2.2-img.png",
        alt: "Person with dogs in mountains",
        order: 2,
        createdAt: new Date(),
      },
      {
        imageUrl: "/section-2.3-img.png",
        alt: "Dogs on mountain rocks",
        order: 3,
        createdAt: new Date(),
      },
    ];

    await db.collection("gallery").insertMany(initialGalleryImages);

    return NextResponse.json(
      {
        message: "Gallery seeded successfully",
        count: initialGalleryImages.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error seeding gallery:", error);
    return NextResponse.json(
      { error: "Failed to seed gallery" },
      { status: 500 }
    );
  }
}
