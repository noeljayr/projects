import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const wurfCollection = db.collection("wurf");

    // Build query filter
    const query: any = {};
    if (category) {
      query.category = category;
    }

    const wurfList = await wurfCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const transformedWurf = wurfList.map((wurf) => ({
      id: wurf._id.toString(),
      name: wurf.name,
      information: wurf.information,
      image: wurf.image || "",
      category: wurf.category || "",
      documents: wurf.documents || {},
      slug: wurf.slug,
      status: wurf.status,
    }));

    return NextResponse.json({
      success: true,
      wurf: transformedWurf,
    });
  } catch (error) {
    console.error("Error fetching wurf posts:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch wurf posts" },
      { status: 500 }
    );
  }
}
