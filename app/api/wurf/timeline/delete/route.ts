import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "IDs array is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const timelineCollection = db.collection("timeline");

    const objectIds = ids.map((id) => new ObjectId(id));

    const result = await timelineCollection.deleteMany({
      _id: { $in: objectIds },
    });

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} timeline entry(s) deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting timeline entries:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete timeline entries" },
      { status: 500 }
    );
  }
}
