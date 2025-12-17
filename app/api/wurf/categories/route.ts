import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const categoriesCollection = db.collection("wurf_categories");

    // Get all published categories
    const categories = await categoriesCollection
      .find({ status: "published" })
      .sort({ createdAt: 1 })
      .toArray();

    const transformedCategories = categories.map((cat) => ({
      id: cat._id.toString(),
      name: cat.name,
      description: cat.description,
      slug: cat.slug,
    }));

    return NextResponse.json({
      success: true,
      categories: transformedCategories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
