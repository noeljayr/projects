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
        { success: false, message: "IDs array is required" },
        { status: 400 }
      );
    }

    if (!status || !["draft", "published"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Valid status is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const wurfCollection = db.collection("wurf");

    const objectIds = ids.map((id) => new ObjectId(id));

    const result = await wurfCollection.updateMany(
      { _id: { $in: objectIds } },
      { $set: { status, updatedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} wurf post(s) ${
        status === "published" ? "published" : "unpublished"
      } successfully`,
    });
  } catch (error) {
    console.error("Error updating wurf status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update wurf status" },
      { status: 500 }
    );
  }
}
