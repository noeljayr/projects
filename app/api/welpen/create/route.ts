import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { wurfId, date, title, description, dogs } = body;

    if (!wurfId || !date || !title) {
      return NextResponse.json(
        { success: false, message: "Wurf ID, date, and title are required" },
        { status: 400 }
      );
    }

    if (!dogs || dogs.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one dog is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const welpenEntriesCollection = db.collection("welpen_entries");

    const welpenEntry = {
      wurfId: new ObjectId(wurfId),
      date,
      title,
      description: description || "",
      dogs,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await welpenEntriesCollection.insertOne(welpenEntry);

    return NextResponse.json({
      success: true,
      message: "Welpen entry created successfully",
      id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Error creating welpen entry:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create welpen entry" },
      { status: 500 }
    );
  }
}
