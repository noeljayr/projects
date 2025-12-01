import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { page, ...updates } = body;

    if (!page) {
      return NextResponse.json(
        { error: "Page identifier is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");

    await db.collection("banners").updateOne(
      { page },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Banner content updated successfully",
    });
  } catch (error) {
    console.error("Error updating banner content:", error);
    return NextResponse.json(
      { error: "Failed to update banner content" },
      { status: 500 }
    );
  }
}
