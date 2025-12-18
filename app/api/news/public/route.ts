import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const newsCollection = db.collection("news");

    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Validate pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 50); // Max 50 items per page for public
    const skip = (validatedPage - 1) * validatedLimit;

    // Only fetch published news for public endpoint
    const filter = { status: "published" };

    // Get total count for pagination metadata
    const totalCount = await newsCollection.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / validatedLimit);

    // Get paginated news, sorted by creation date (newest first)
    const newsList = await newsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(validatedLimit)
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
      pagination: {
        currentPage: validatedPage,
        totalPages,
        totalCount,
        limit: validatedLimit,
        hasNextPage: validatedPage < totalPages,
        hasPreviousPage: validatedPage > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching public news:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
