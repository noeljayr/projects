import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const ids = searchParams.get("ids");

    if (!id && !ids) {
      return NextResponse.json(
        { success: false, message: "News ID(s) required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const newsCollection = db.collection("news");

    let result;

    if (ids) {
      // Delete multiple news items
      const idArray = ids.split(",").map((id) => new ObjectId(id.trim()));
      result = await newsCollection.deleteMany({
        _id: { $in: idArray },
      });
    } else if (id) {
      // Delete single news item
      result = await newsCollection.deleteOne({ _id: new ObjectId(id) });
    }

    if (result && result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "News not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${result?.deletedCount || 0} news item(s) deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting news:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete news" },
      { status: 500 }
    );
  }
}
