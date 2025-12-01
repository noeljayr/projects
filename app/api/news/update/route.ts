import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, title, content, coverImage, publishDate, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "News ID is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const newsCollection = db.collection("news");

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (status) updateData.status = status;

    // Update date if provided (use ISO format YYYY-MM-DD)
    if (publishDate !== undefined) {
      updateData.date = publishDate || new Date().toISOString().split("T")[0];
    }

    const result = await newsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "News not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "News updated successfully",
    });
  } catch (error) {
    console.error("Error updating news:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update news" },
      { status: 500 }
    );
  }
}
