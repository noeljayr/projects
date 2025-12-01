import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("vom_sauterhof");

    const images = await db
      .collection("images")
      .findOne({ _id: "site-images" } as any);

    if (!images) {
      return NextResponse.json({
        darkSection1: "/section-3.1.png",
        darkSection2: "/section-3.2.png",
        darkSection3: "/section-3.3.png",
        darkSection4: "/section-3.4.png",
      });
    }

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
