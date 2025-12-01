import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const beauceronCollection = db.collection("beauceron");

    const beauceronList = await beauceronCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const transformedBeauceron = beauceronList.map((beauceron) => ({
      id: beauceron._id.toString(),
      name: beauceron.name,
      description: beauceron.description,
      image: beauceron.image || "",
      images: beauceron.images || [],
      dob: beauceron.dob || "",
      weight: beauceron.weight,
      height: beauceron.height,
      slug: beauceron.slug,
      status: beauceron.status,
    }));

    return NextResponse.json({
      success: true,
      beauceron: transformedBeauceron,
    });
  } catch (error) {
    console.error("Error fetching beauceron posts:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch beauceron posts" },
      { status: 500 }
    );
  }
}
