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
    const { title, content, coverImage, publishDate, status = "draft" } = body;

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: "Title and content are required" },
        { status: 400 }
      );
    }

    function generateRandomIntString() {
      let result = "";
      for (let i = 0; i < 6; i++) {
        result += Math.floor(Math.random() * 10); // generates a single digit (0–9)
      }
      return result;
    }

    // Generate slug from title
    const slug =
      title
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
    const newsCollection = db.collection("news");

    // Check if slug already exists
    const existingNews = await newsCollection.findOne({ slug });
    let finalSlug = slug;
    if (existingNews) {
      // Add timestamp to make it unique
      finalSlug = `${slug}-${Date.now()}`;
    }

    // Use publishDate if provided, otherwise use current date (in ISO format YYYY-MM-DD)
    const dateISO = publishDate || new Date().toISOString().split("T")[0];

    // Create news document
    const newsDocument = {
      title,
      content,
      coverImage: coverImage || "",
      slug: finalSlug,
      author: authResult.user.userName,
      status: status === "published" ? "published" : "draft",
      hasVideo: false,
      date: dateISO,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await newsCollection.insertOne(newsDocument);

    return NextResponse.json({
      success: true,
      message: `News ${
        status === "published" ? "published" : "saved as draft"
      } successfully`,
      newsId: result.insertedId,
      slug: finalSlug,
    });
  } catch (error) {
    console.error("Error creating news:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create news" },
      { status: 500 }
    );
  }
}
