import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { generateSlug } from "@/lib/generateSlug";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const categoriesCollection = db.collection("wurf_categories");

    const category = await categoriesCollection.findOne({ slug });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category: {
        id: category._id.toString(),
        name: category.name,
        description: category.description,
        slug: category.slug,
        status: category.status,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching wurf category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { name, description } = await request.json();

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const categoriesCollection = db.collection("wurf_categories");
    const wurfCollection = db.collection("wurf");

    const category = await categoriesCollection.findOne({ slug });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    // If name is being updated, generate new slug
    let newSlug = slug;
    if (name && name.trim() !== category.name) {
      const baseSlug = generateSlug(name);
      newSlug = baseSlug;
      let counter = 1;

      while (
        await categoriesCollection.findOne({
          slug: newSlug,
          _id: { $ne: category._id },
        })
      ) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      updateData.name = name.trim();
      updateData.slug = newSlug;

      // Update all wurf entries that reference this category
      await wurfCollection.updateMany(
        { categorySlug: slug },
        { $set: { categorySlug: newSlug, updatedAt: new Date() } }
      );
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    await categoriesCollection.updateOne({ slug }, { $set: updateData });

    const updatedCategory = await categoriesCollection.findOne({
      slug: newSlug,
    });

    return NextResponse.json({
      success: true,
      category: {
        id: updatedCategory!._id.toString(),
        name: updatedCategory!.name,
        description: updatedCategory!.description,
        slug: updatedCategory!.slug,
        status: updatedCategory!.status,
        createdAt: updatedCategory!.createdAt,
        updatedAt: updatedCategory!.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating wurf category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update category" },
      { status: 500 }
    );
  }
}
