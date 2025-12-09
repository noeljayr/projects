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
    const welpenEntriesCollection = db.collection("welpen_entries");

    const entries = await welpenEntriesCollection
      .find({ wurfId: new ObjectId(wurfId) })
      .sort({ date: -1 })
      .toArray();

    const formattedEntries = entries.map((entry) => ({
      id: entry._id.toString(),
      wurfId: entry.wurfId.toString(),
      date: entry.date,
      title: entry.title,
      description: entry.description || "",
      dogs: entry.dogs || [],
    }));

    return NextResponse.json({
      success: true,
      welpen: formattedEntries,
    });
  } catch (error) {
    console.error("Error fetching welpen entries:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch welpen entries" },
      { status: 500 }
    );
  }
}
