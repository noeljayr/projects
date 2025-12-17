import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { generateSlug } from "@/lib/generateSlug";

// Create a new wurf category (admin only)
export async function POST(request: NextRequest) {
  try {
    const { name, description = "" } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const categoriesCollection = db.collection("wurf_categories");

    // Check if category with this name already exists
    const existingCategory = await categoriesCollection.findOne({
      name: name.trim(),
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: "Category with this name already exists" },
        { status: 400 }
      );
    }

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
      message: "Category created successfully",
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

// Delete a wurf category (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Category slug is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const categoriesCollection = db.collection("wurf_categories");
    const wurfCollection = db.collection("wurf");

    // Check if any wurf entries are using this category
    const wurfUsingCategory = await wurfCollection.findOne({
      categorySlug: slug,
    });

    if (wurfUsingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete category that is being used by wurf entries",
        },
        { status: 400 }
      );
    }

    const result = await categoriesCollection.deleteOne({ slug });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting wurf category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete category" },
      { status: 500 }
    );
  }
}
