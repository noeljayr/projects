import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, information, image, categorySlug, documents, status } =
      body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }

    if (!categorySlug) {
      return NextResponse.json(
        { success: false, message: "Category is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const wurfCollection = db.collection("wurf");
    const categoriesCollection = db.collection("wurf_categories");

    // Validate that the category exists
    const categoryExists = await categoriesCollection.findOne({
      slug: categorySlug,
      status: "published",
    });

    if (!categoryExists) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ungültige Kategorie. Bitte wählen Sie eine gültige Kategorie.",
        },
        { status: 400 }
      );
    }

    // Check if category already has a different wurf entry
    const existingCategoryWurf = await wurfCollection.findOne({
      categorySlug: categorySlug,
      _id: { $ne: new ObjectId(id) },
    });
    if (existingCategoryWurf) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Diese Kategorie hat bereits einen Wurf-Eintrag. Bitte wählen Sie eine andere Kategorie.",
        },
        { status: 400 }
      );
    }

    const updateData: any = {
      name,
      information,
      image: image || "",
      category: categoryExists.name, // Keep for backward compatibility
      categorySlug: categorySlug,
      documents: {
        stammbaum: documents?.stammbaum || "",
        workingDog: documents?.workingDog || "",
        arbeit: documents?.arbeit || "",
      },
      updatedAt: new Date(),
    };

    if (status) {
      updateData.status = status;
    }

    const result = await wurfCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Wurf not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Wurf updated successfully",
    });
  } catch (error) {
    console.error("Error updating wurf:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update wurf" },
      { status: 500 }
    );
  }
}
