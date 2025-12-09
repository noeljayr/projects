import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";

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

    if (!dogs || !Array.isArray(dogs) || dogs.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one dog is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const timelineCollection = db.collection("timeline");

    const timelineEntry = {
      wurfId,
      date,
      title,
      description: description || "",
      dogs: dogs.map((dog) => ({
        name: dog.name || "",
        image: dog.image || "",
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await timelineCollection.insertOne(timelineEntry);

    return NextResponse.json({
      success: true,
      message: "Timeline entry created successfully",
      timelineId: result.insertedId,
    });
  } catch (error) {
    console.error("Error creating timeline entry:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create timeline entry" },
      { status: 500 }
    );
  }
}
