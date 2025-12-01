import Banner from "@/components/Banner";
import NewsCard from "@/components/news/NewsCard";
import { NewsArticleSchema } from "@/components/StructuredData";
import clientPromise from "@/lib/mongodb";
import { News } from "@/types/News";
import { IconArrowLeft } from "@tabler/icons-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import paw from "@/public/pawprint.png";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const client = await clientPromise;
  const db = client.db("vom_sauterhof");
  const newsCollection = db.collection("news");

  const newsData = await newsCollection.findOne({
    slug: slug,
    status: "published",
  });

  if (!newsData) {
    return {
      title: "Artikel nicht gefunden",
    };
  }

  const imageUrl = newsData.coverImage?.startsWith("data:")
    ? "/vomsauterhof/opengraph-image.png"
    : `/vomsauterhof/news/${newsData.coverImage}`;

  return {
    title: newsData.title,
    description: newsData.content?.substring(0, 160).replace(/<[^>]*>/g, ""),
    openGraph: {
      title: newsData.title,
      description: newsData.content?.substring(0, 160).replace(/<[^>]*>/g, ""),
      type: "article",
      publishedTime: newsData.createdAt,
      modifiedTime: newsData.updatedAt,
      authors: [newsData.author],
      images: [imageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title: newsData.title,
      description: newsData.content?.substring(0, 160).replace(/<[^>]*>/g, ""),
      images: [imageUrl],
    },
  };
}

async function Page({ params }: Props) {
  const { slug } = await params;
  const client = await clientPromise;
  const db = client.db("vom_sauterhof");
  const newsCollection = db.collection("news");

  const newsData = await newsCollection.findOne({
    slug: slug,
    status: "published",
  });

  if (!newsData) {
    notFound();
  }

  const selectedNews: News = {
    id: newsData._id.toString(),
    title: newsData.title,
    author: newsData.author,
    content: newsData.content,
    date: newsData.date,
    hasVideo: newsData.hasVideo || false,
    coverImage: newsData.coverImage || "",
    slug: newsData.slug,
    status: newsData.status,
  };

  // Fetch other news
  const otherNewsData = await newsCollection
    .find({
      status: "published",
      slug: { $ne: slug },
    })
    .limit(3)
    .toArray();

  const otherNews: News[] = otherNewsData.map((n) => ({
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

  const imageUrl = selectedNews.coverImage.startsWith("data:")
    ? selectedNews.coverImage
    : `/vomsauterhof/news/${selectedNews.coverImage}`;

  return (
    <>
      <NewsArticleSchema
        title={selectedNews.title}
        description={selectedNews.content
          .substring(0, 160)
          .replace(/<[^>]*>/g, "")}
        image={imageUrl}
        datePublished={selectedNews.date}
        author={selectedNews.author}
        url={`https://vom-sauterhof.de/news/${selectedNews.slug}`}
      />
      <div className="flex flex-col">
        <Banner />
        <div className="flex flex-col relative w-[60%] max-[900]:w-[80%] max-[720px]:w-[90%] mx-auto top-[-12rem] ">
          <Link
            href="/vomsauterhof/news"
            className="bg-[#FBF2EA] w-fit font-medium flex font-p4 items-center border border-[var(--c-border)] px-4 py-2 rounded-3xl"
          >
            <IconArrowLeft className="h-4 w-4 mr-2" color="#CD6917" />
            Zurück zur Übersicht
          </Link>

          <div className="flex w-full relative">
            <img
              src={imageUrl}
              alt={selectedNews.title}
              className="w-full h-fit object-cover rounded-[1rem] my-4"
            />
          </div>

          <div className="py-2 border-b flex max-[720px]:flex-col-reverse max-[720px]:items-start items-center border-b-[var(--c-border)]">
            <h4>{selectedNews.title}</h4>
            <span className="opacity-50 font-p4 ml-auto max-[720px]:ml-0 max-[720px]:mb-2 max-[720px]:w-fit">
              Gepostet am {selectedNews.date}
            </span>
          </div>

          <div
            className="prose max-w-none flex flex-col news-content mt-10"
            dangerouslySetInnerHTML={{ __html: selectedNews.content }}
          />
        </div>

        {otherNews.length > -1 && (
          <div className="w-full py-32 bg-[#58483B] relative">
            <div className="news-grid grid grid-cols-1  w-[60%] mx-auto md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {otherNews.map((n) => (
                <NewsCard color="#ffff" news={n} key={n.id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Page;
