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
        { success: false, message: "News ID or slug is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const newsCollection = db.collection("news");

    let news;
    if (id) {
      news = await newsCollection.findOne({ _id: new ObjectId(id) });
    } else if (slug) {
      news = await newsCollection.findOne({ slug });
    }

    if (!news) {
      return NextResponse.json(
        { success: false, message: "News not found" },
        { status: 404 }
      );
    }

    // Transform MongoDB document to match News type
    const transformedNews = {
      id: news._id.toString(),
      title: news.title,
      author: news.author,
      content: news.content,
      date: news.date,
      hasVideo: news.hasVideo || false,
      coverImage: news.coverImage || "",
      slug: news.slug,
      status: news.status,
    };

    return NextResponse.json({
      success: true,
      news: transformedNews,
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
