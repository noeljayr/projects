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
    const wurfCollection = db.collection("wurf");

    const objectIds = ids.map((id) => new ObjectId(id));

    const result = await wurfCollection.deleteMany({
      _id: { $in: objectIds },
    });

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} wurf post(s) deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting wurf:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete wurf" },
      { status: 500 }
    );
  }
}
