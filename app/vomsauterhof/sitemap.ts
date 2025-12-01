import { MetadataRoute } from "next";
import clientPromise from "@/lib/mongodb";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://vom-sauterhof.de";

  // Fetch all published news for dynamic routes
  const client = await clientPromise;
  const db = client.db("vom_sauterhof");
  const newsCollection = db.collection("news");
  const newsData = await newsCollection.find({ status: "published" }).toArray();

  const newsUrls = newsData.map((news) => ({
    url: `${baseUrl}/news/${news.slug}`,
    lastModified: news.updatedAt || news.createdAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/uber-uns`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/unsere-beauceron`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...newsUrls,
  ];
}
