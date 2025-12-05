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
    const { wurfId, information, date, title, dogs } = body;

    if (!wurfId) {
      return NextResponse.json(
        { success: false, message: "Wurf ID is required" },
        { status: 400 }
      );
    }

    // Validate that either information or dogs is provided
    if (!information && (!dogs || dogs.length === 0)) {
      return NextResponse.json(
        { success: false, message: "Information or dogs data is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const welpenCollection = db.collection("welpen");

    // Check if welpen document exists for this wurf
    const existingWelpen = await welpenCollection.findOne({
      wurfId: new ObjectId(wurfId),
    });

    // Prepare update data based on what's provided
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (information !== undefined) {
      updateData.information = information;
      // Clear timeline fields if switching to free-form
      updateData.date = "";
      updateData.title = "";
      updateData.dogs = [];
    }

    if (dogs !== undefined) {
      updateData.dogs = dogs;
      updateData.date = date || "";
      updateData.title = title || "";
      // Clear information if switching to timeline-style
      updateData.information = "";
    }

    if (existingWelpen) {
      // Update existing welpen document
      await welpenCollection.updateOne(
        { wurfId: new ObjectId(wurfId) },
        {
          $set: updateData,
        }
      );

      return NextResponse.json({
        success: true,
        message: "Welpen updated successfully",
      });
    } else {
      // Create new welpen document
      const welpenDocument = {
        wurfId: new ObjectId(wurfId),
        information: information || "",
        date: date || "",
        title: title || "",
        dogs: dogs || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await welpenCollection.insertOne(welpenDocument);

      return NextResponse.json({
        success: true,
        message: "Welpen created successfully",
      });
    }
  } catch (error) {
    console.error("Error updating welpen:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update welpen" },
      { status: 500 }
    );
  }
}
