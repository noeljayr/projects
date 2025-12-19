import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";

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
        { success: false, message: "WurfId is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const timelineCollection = db.collection("timeline");

    // For wurf-a category, we look for a single timeline entry with information field
    const timeline = await timelineCollection.findOne({
      wurfId,
      information: { $exists: true },
    });

    if (!timeline) {
      // Create a default entry if none exists
      const defaultTimeline = {
        wurfId,
        information: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await timelineCollection.insertOne(defaultTimeline);

      return NextResponse.json({
        success: true,
        timeline: {
          id: result.insertedId.toString(),
          wurfId,
          information: "",
        },
      });
    }

    return NextResponse.json({
      success: true,
      timeline: {
        id: timeline._id.toString(),
        wurfId: timeline.wurfId,
        information: timeline.information || "",
      },
    });
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}
