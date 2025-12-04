import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const wurfId = searchParams.get("wurfId");

    if (!wurfId) {
      return NextResponse.json(
        { success: false, message: "Wurf ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const welpenCollection = db.collection("welpen");

    const welpen = await welpenCollection.findOne({
      wurfId: new ObjectId(wurfId),
    });

    if (!welpen) {
      // Return empty welpen data if not found
      return NextResponse.json({
        success: true,
        welpen: {
          information: "",
          date: "",
          title: "",
          dogs: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      welpen: {
        ...welpen,
        _id: welpen._id.toString(),
        wurfId: welpen.wurfId.toString(),
      },
    });
  } catch (error) {
    console.error("Error fetching welpen:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch welpen" },
      { status: 500 }
    );
  }
}
