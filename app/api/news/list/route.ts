import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const newsCollection = db.collection("news");

    // Get all news, sorted by creation date (newest first)
    const newsList = await newsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Transform MongoDB documents to match News type
    const transformedNews = newsList.map((news) => ({
      id: news._id.toString(),
      title: news.title,
      author: news.author,
      content: news.content,
      date: news.date,
      hasVideo: news.hasVideo || false,
      coverImage: news.coverImage || "",
      slug: news.slug,
      status: news.status,
    }));

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
