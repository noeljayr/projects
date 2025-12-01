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
        { success: false, message: "Beauceron IDs are required" },
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

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const beauceronCollection = db.collection("beauceron");

    const objectIds = ids.map((id) => new ObjectId(id));

    const result = await beauceronCollection.updateMany(
      { _id: { $in: objectIds } },
      { $set: { status, updatedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} beauceron post(s) ${
        status === "published" ? "published" : "unpublished"
      } successfully`,
    });
  } catch (error) {
    console.error("Error updating beauceron status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update beauceron status" },
      { status: 500 }
    );
  }
}
