import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      information,
      image,
      category,
      documents = {},
      status = "draft",
    } = body;

    // Validation
    if (!name || !information) {
      return NextResponse.json(
        { success: false, message: "Name and information are required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
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

    // Check if category already exists (if category is provided)
    if (category && category.trim()) {
      const existingCategory = await wurfCollection.findOne({
        category: category.trim(),
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

    function generateRandomIntString() {
      let result = "";
      for (let i = 0; i < 6; i++) {
        result += Math.floor(Math.random() * 10);
      }
      return result;
    }

    // Generate slug from name
    const slug =
      name
        .toLowerCase()
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") +
      "-" +
      generateRandomIntString();

    // Check if slug already exists
    const existingWurf = await wurfCollection.findOne({ slug });
    let finalSlug = slug;
    if (existingWurf) {
      finalSlug = `${slug}-${Date.now()}`;
    }

    // Create wurf document
    const wurfDocument = {
      name,
      information,
      image: image || "",
      category: category || "",
      documents: {
        stammbaum: documents.stammbaum || "",
        workingDog: documents.workingDog || "",
        arbeit: documents.arbeit || "",
      },
      slug: finalSlug,
      status: status === "published" ? "published" : "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await wurfCollection.insertOne(wurfDocument);

    return NextResponse.json({
      success: true,
      message: `Wurf post ${
        status === "published" ? "published" : "saved as draft"
      } successfully`,
      wurfId: result.insertedId,
      slug: finalSlug,
    });
  } catch (error) {
    console.error("Error creating wurf post:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create wurf post" },
      { status: 500 }
    );
  }
}
