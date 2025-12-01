import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (!id && !slug) {
      return NextResponse.json(
        { success: false, message: "Beauceron ID or slug is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const beauceronCollection = db.collection("beauceron");

    let beauceron;
    if (id) {
      beauceron = await beauceronCollection.findOne({ _id: new ObjectId(id) });
    } else if (slug) {
      beauceron = await beauceronCollection.findOne({ slug });
    }

    if (!beauceron) {
      return NextResponse.json(
        { success: false, message: "Beauceron post not found" },
        { status: 404 }
      );
    }

    const transformedBeauceron = {
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
    };

    return NextResponse.json({
      success: true,
      beauceron: transformedBeauceron,
    });
  } catch (error) {
    console.error("Error fetching beauceron post:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch beauceron post" },
      { status: 500 }
    );
  }
}
