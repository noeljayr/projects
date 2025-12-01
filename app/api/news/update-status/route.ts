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
    const { ids, status } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "News IDs are required" },
        { status: 400 }
      );
    }

    if (!status || !["published", "draft"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid status is required (published or draft)",
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const newsCollection = db.collection("news");

    const objectIds = ids.map((id) => new ObjectId(id));

    const result = await newsCollection.updateMany(
      { _id: { $in: objectIds } },
      { $set: { status, updatedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} news item(s) ${
        status === "published" ? "published" : "unpublished"
      } successfully`,
    });
  } catch (error) {
    console.error("Error updating news status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update news status" },
      { status: 500 }
    );
  }
}
