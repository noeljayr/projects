import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, date, title, dogs } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    if (!date || !title) {
      return NextResponse.json(
        { success: false, message: "Date and title are required" },
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

    const updateData = {
      date,
      title,
      dogs: dogs.map((dog) => ({
        name: dog.name || "",
        image: dog.image || "",
      })),
      updatedAt: new Date(),
    };

    const result = await timelineCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Timeline entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Timeline entry updated successfully",
    });
  } catch (error) {
    console.error("Error updating timeline entry:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update timeline entry" },
      { status: 500 }
    );
  }
}
