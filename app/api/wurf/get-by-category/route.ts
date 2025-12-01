import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const wurfCollection = db.collection("wurf");

    const wurf = await wurfCollection.findOne({ category });

    if (!wurf) {
      return NextResponse.json(
        { success: false, message: "Wurf not found" },
        { status: 404 }
      );
    }

    const transformedWurf = {
      id: wurf._id.toString(),
      name: wurf.name,
      information: wurf.information,
      image: wurf.image || "",
      category: wurf.category || "",
      documents: wurf.documents || {},
      slug: wurf.slug,
      status: wurf.status,
    };

    return NextResponse.json({
      success: true,
      wurf: transformedWurf,
    });
  } catch (error) {
    console.error("Error fetching wurf by category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch wurf" },
      { status: 500 }
    );
  }
}
