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
    const { id, name, information, image, category, documents, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    if (!name || !information) {
      return NextResponse.json(
        { success: false, message: "Name and information are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const wurfCollection = db.collection("wurf");

    // Validate category is one of the allowed values
    const allowedCategories = ["wurf a", "wurf b", "wurf c"];
    if (
      category &&
      category.trim() &&
      !allowedCategories.includes(category.trim().toLowerCase())
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Ungültige Kategorie. Bitte wählen Sie Wurf A, B oder C.",
        },
        { status: 400 }
      );
    }

    // Check if category already exists for a different wurf (if category is provided)
    if (category && category.trim()) {
      const existingCategory = await wurfCollection.findOne({
        category: category.trim(),
        _id: { $ne: new ObjectId(id) },
      });
      if (existingCategory) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Diese Kategorie existiert bereits. Bitte wählen Sie eine andere Kategorie.",
          },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      name,
      information,
      image: image || "",
      category: category || "",
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
