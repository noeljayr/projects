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
    const {
      id,
      name,
      description,
      image,
      images,
      dob,
      weight,
      height,
      status,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Beauceron ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const beauceronCollection = db.collection("beauceron");

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (images !== undefined)
      updateData.images = Array.isArray(images) ? images : [];
    if (dob !== undefined) updateData.dob = dob;
    if (weight !== undefined) updateData.weight = weight;
    if (height !== undefined) updateData.height = height;
    if (status) updateData.status = status;

    const result = await beauceronCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Beauceron post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Beauceron post updated successfully",
    });
  } catch (error) {
    console.error("Error updating beauceron post:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update beauceron post" },
      { status: 500 }
    );
  }
}
