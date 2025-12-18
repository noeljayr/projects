import NewsPageWrapper from "@/components/pages/NewsPageWrapper";
import clientPromise from "@/lib/mongodb";
import { BannerContent } from "@/types/banner";
import {
  extractPaginationParams,
  buildMongoQuery,
  buildMongoSort,
} from "@/lib/url-utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neuigkeiten",
  description:
    "Aktuelle Neuigkeiten und Updates von unserer Beauceronzucht Vom Sauterhof. Erfahren Sie mehr über unsere Würfe, Welpen und Veranstaltungen.",
  openGraph: {
    title: "Neuigkeiten | Beauceron Vom Sauterhof",
    description:
      "Aktuelle Neuigkeiten und Updates von unserer Beauceronzucht Vom Sauterhof.",
  },
};

type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

async function Page({ searchParams }: PageProps) {
  const client = await clientPromise;
  const db = client.db("vom_sauterhof");

  // Fetch banner content
  const bannersCollection = db.collection("banners");
  const bannerData = await bannersCollection.findOne({ page: "news" });
  const bannerContent: BannerContent = bannerData
    ? {
        title: bannerData.title,
        description: bannerData.description,
      }
    : {};

  // Fetch news page content
  const newsPageCollection = db.collection("newsPage");
  const newsPageData = await newsPageCollection.findOne({});
  const newsPageContent = newsPageData
    ? {
        searchPlaceholder: newsPageData.searchPlaceholder,
        sortNewest: newsPageData.sortNewest,
        sortOldest: newsPageData.sortOldest,
      }
    : {};

  // Extract pagination and filter parameters from URL
  const { page, limit, search, sort } = extractPaginationParams(searchParams);
  const skip = (page - 1) * limit;

  // Build MongoDB query and sort
  const newsCollection = db.collection("news");
  const query = buildMongoQuery(search, { status: "published" });
  const sortOrder = buildMongoSort(sort);

  // Fetch paginated news
  const [newsData, totalCount] = await Promise.all([
    newsCollection
      .find(query)
      .sort(sortOrder)
      .skip(skip)
      .limit(limit)
      .toArray(),
    newsCollection.countDocuments(query),
  ]);

  const news = newsData.map((n) => ({
    id: n._id.toString(),
    title: n.title,
    author: n.author,
    content: n.content,
    date: n.date,
    hasVideo: n.hasVideo || false,
    coverImage: n.coverImage || "",
    slug: n.slug,
    status: n.status,
  }));

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const paginationInfo = {
    currentPage: page,
    totalPages,
    totalCount,
    hasNextPage,
    hasPrevPage,
    limit,
  };

  return (
    <NewsPageWrapper
      bannerContent={bannerContent}
      newsPageContent={newsPageContent}
      news={news}
      paginationInfo={paginationInfo}
      currentSearch={search}
      currentSort={sort}
    />
  );
}

export default Page;
