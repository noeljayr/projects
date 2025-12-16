import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("vom_sauterhof");

    const gallery = await db
      .collection("gallery")
      .find({})
      .sort({ order: 1, createdAt: 1 })
      .toArray();

    return NextResponse.json(gallery);
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, alt, order } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");

    const newImage = {
      imageUrl,
      alt: alt || "Gallery image",
      order: order || 0,
      createdAt: new Date(),
    };

    const result = await db.collection("gallery").insertOne(newImage);

    return NextResponse.json(
      { id: result.insertedId, ...newImage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding gallery image:", error);
    return NextResponse.json(
      { error: "Failed to add gallery image" },
      { status: 500 }
    );
  }
}
