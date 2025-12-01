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
      description,
      image,
      images = [],
      dob,
      weight,
      height,
      status = "draft",
    } = body;

    // Validation
    if (!name || !description) {
      return NextResponse.json(
        { success: false, message: "Name and description are required" },
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

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const beauceronCollection = db.collection("beauceron");

    // Check if slug already exists
    const existingBeauceron = await beauceronCollection.findOne({ slug });
    let finalSlug = slug;
    if (existingBeauceron) {
      finalSlug = `${slug}-${Date.now()}`;
    }

    // Create beauceron document
    const beauceronDocument = {
      name,
      description,
      image: image || "",
      images: Array.isArray(images) ? images : [],
      dob: dob || "",
      weight: weight || undefined,
      height: height || undefined,
      slug: finalSlug,
      status: status === "published" ? "published" : "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await beauceronCollection.insertOne(beauceronDocument);

    return NextResponse.json({
      success: true,
      message: `Beauceron post ${
        status === "published" ? "published" : "saved as draft"
      } successfully`,
      beauceronId: result.insertedId,
      slug: finalSlug,
    });
  } catch (error) {
    console.error("Error creating beauceron post:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create beauceron post" },
      { status: 500 }
    );
  }
}
