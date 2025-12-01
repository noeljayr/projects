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

    const { heroTitle } = await request.json();

    if (!heroTitle) {
      return NextResponse.json(
        { error: "Hero title is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const homepageCollection = db.collection("homepage");

    const result = await homepageCollection.updateOne(
      {},
      { $set: { heroTitle } },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Hero title updated successfully",
      result,
    });
  } catch (error) {
    console.error("Error updating hero title:", error);
    return NextResponse.json(
      { error: "Failed to update hero title" },
      { status: 500 }
    );
  }
}
