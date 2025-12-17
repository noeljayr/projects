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
      categorySlug,
      documents = {},
      status = "draft",
    } = body;

    // Validation
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

    // Connect to MongoDB
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

    // Check if category already has a wurf entry
    const existingCategoryWurf = await wurfCollection.findOne({
      categorySlug: categorySlug,
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
      category: categoryExists.name, // Keep for backward compatibility
      categorySlug: categorySlug,
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
