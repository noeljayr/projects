import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { generateSlug } from "@/lib/generateSlug";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const categoriesCollection = db.collection("wurf_categories");

    const categories = await categoriesCollection
      .find({ status: "published" })
      .sort({ createdAt: 1 })
      .toArray();

    const transformedCategories = categories.map((cat) => ({
      id: cat._id.toString(),
      name: cat.name,
      description: cat.description,
      slug: cat.slug,
      status: cat.status,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      categories: transformedCategories,
    });
  } catch (error) {
    console.error("Error fetching wurf categories:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description = "" } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const categoriesCollection = db.collection("wurf_categories");

    // Generate unique slug
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    while (await categoriesCollection.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newCategory = {
      name: name.trim(),
      description: description.trim(),
      slug,
      status: "published",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await categoriesCollection.insertOne(newCategory);

    return NextResponse.json({
      success: true,
      category: {
        id: result.insertedId.toString(),
        ...newCategory,
      },
    });
  } catch (error) {
    console.error("Error creating wurf category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create category" },
      { status: 500 }
    );
  }
}
