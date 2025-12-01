import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
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
    const timelineCollection = db.collection("timeline");

    const timelineEntries = await timelineCollection
      .find({ wurfId })
      .sort({ date: -1 })
      .toArray();

    const transformedTimeline = timelineEntries.map((entry) => ({
      id: entry._id.toString(),
      wurfId: entry.wurfId,
      date: entry.date,
      title: entry.title || "",
      dogs: entry.dogs || [],
      createdAt: entry.createdAt,
    }));

    return NextResponse.json({
      success: true,
      timeline: transformedTimeline,
    });
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}
