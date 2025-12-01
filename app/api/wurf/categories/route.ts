import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const wurfCollection = db.collection("wurf");

    // Get all distinct categories, excluding empty ones
    const categories = await wurfCollection.distinct("category", {
      category: { $exists: true, $ne: "" },
      status: "published", // Only get categories from published wurf
    });

    return NextResponse.json({
      success: true,
      categories: categories.sort(),
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
