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
    const { wurfId, information } = body;

    if (!wurfId) {
      return NextResponse.json(
        { success: false, message: "Wurf ID is required" },
        { status: 400 }
      );
    }

    if (!information) {
      return NextResponse.json(
        { success: false, message: "Information is required" },
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

    if (existingWelpen) {
      // Update existing welpen document
      const result = await welpenCollection.updateOne(
        { wurfId: new ObjectId(wurfId) },
        {
          $set: {
            information,
            updatedAt: new Date(),
          },
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
        information,
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
