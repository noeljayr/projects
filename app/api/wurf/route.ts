import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");

    // Fetch banner content
    const bannersCollection = db.collection("banners");
    const bannerData = await bannersCollection.findOne({ page: "wurf" });
    const bannerContent = bannerData
      ? {
          title: bannerData.title,
          description: bannerData.description
            ? bannerData.description
            : "lorem",
        }
      : {};

    // Fetch all published categories
    const wurfCollection = db.collection("wurf");
    const allWurf = await wurfCollection
      .find({ status: "published" })
      .sort({ createdAt: -1 })
      .toArray();

    const categories = allWurf
      .map((w) => w.category)
      .filter((c) => c && c.trim() !== "");

    // Get the active category (from query param or first available)
    const activeCategory = category || categories[0];

    // Fetch the wurf data for the active category
    let wurfData = null;
    if (activeCategory) {
      wurfData = await wurfCollection.findOne({
        category: activeCategory,
        status: "published",
      });
    }

    const wurf = wurfData
      ? {
          id: wurfData._id.toString(),
          name: wurfData.name,
          information: wurfData.information,
          image: wurfData.image || "",
          category: wurfData.category || "",
          documents: {
            stammbaum: wurfData.documents?.stammbaum || "",
            workingDog: wurfData.documents?.workingDog || "",
            arbeit: wurfData.documents?.arbeit || "",
          },
        }
      : null;

    // Fetch timeline data for the active wurf
    const timelineCollection = db.collection("timeline");
    const timelineData = wurf
      ? await timelineCollection
          .find({ wurfId: wurf.id })
          .sort({ date: 1 })
          .toArray()
      : [];

    const timeline = timelineData.map((entry) => ({
      id: entry._id.toString(),
      wurfId: entry.wurfId,
      date: entry.date,
      title: entry.title || "",
      dogs: entry.dogs || [],
    }));

    return NextResponse.json({
      bannerContent,
      categories,
      activeCategory,
      wurf,
      timeline,
    });
  } catch (error) {
    console.error("Error in wurf API:", error);
    return NextResponse.json(
      { error: "Failed to fetch wurf data" },
      { status: 500 }
    );
  }
}
