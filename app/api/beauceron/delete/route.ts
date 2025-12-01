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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const ids = searchParams.get("ids");

    if (!id && !ids) {
      return NextResponse.json(
        { success: false, message: "Beauceron ID(s) required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const beauceronCollection = db.collection("beauceron");

    let result;

    if (ids) {
      const idArray = ids.split(",").map((id) => new ObjectId(id.trim()));
      result = await beauceronCollection.deleteMany({
        _id: { $in: idArray },
      });
    } else if (id) {
      result = await beauceronCollection.deleteOne({ _id: new ObjectId(id) });
    }

    if (result && result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Beauceron post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${
        result?.deletedCount || 0
      } beauceron post(s) deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting beauceron post:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete beauceron post" },
      { status: 500 }
    );
  }
}
