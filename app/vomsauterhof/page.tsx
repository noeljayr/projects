import React, { Suspense } from "react";
import Home from "@/components/pages/Home";
import clientPromise from "@/lib/mongodb";
import { HomepageContent } from "@/types/homepage";

export const revalidate = 0;

async function Page() {
  const client = await clientPromise;
  const db = client.db("vom_sauterhof");

  const homepageCollection = db.collection("homepage");
  const homepageContent = await homepageCollection.findOne({});

  // Fetch published news
  const newsCollection = db.collection("news");
  const newsData = await newsCollection
    .find({ status: "published" })
    .sort({ createdAt: -1 })
    .limit(6)
    .toArray();

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

  // Fetch images
  const imagesCollection = db.collection("images");
  const imagesData = await imagesCollection.findOne({
    _id: "site-images",
  } as any);

  const images = {
    darkSection1: imagesData?.darkSection1 || "/section-3.1.png",
    darkSection2: imagesData?.darkSection2 || "/section-3.2.png",
    darkSection3: imagesData?.darkSection3 || "/section-3.3.png",
    darkSection4: imagesData?.darkSection4 || "/section-3.4.png",
    gallery1: imagesData?.gallery1 || "/section-2.1-img.png",
    gallery2: imagesData?.gallery2 || "/section-2.2-img.png",
    gallery3: imagesData?.gallery3 || "/section-2.3-img.png",
    whyBreedDog: imagesData?.whyBreedDog || "/why-breed-dogs.png",
  };

  // Convert MongoDB document to plain object (remove _id and other non-serializable fields)
  const content: HomepageContent = homepageContent
    ? {
        heroTitle: homepageContent.heroTitle,
        heroDescription: homepageContent.heroDescription,
        heroButtonText: homepageContent.heroButtonText,
        contentHeading: homepageContent.contentHeading,
        contentSubheading: homepageContent.contentSubheading,
        whyBreedTitle: homepageContent.whyBreedTitle,
        whyBreedDescription: homepageContent.whyBreedDescription,
        feature1: homepageContent.feature1,
        feature2: homepageContent.feature2,
        feature3: homepageContent.feature3,
        feature4: homepageContent.feature4,
        feature5: homepageContent.feature5,
        feature6: homepageContent.feature6,
        darkSectionTitle: homepageContent.darkSectionTitle,
        darkSectionDescription: homepageContent.darkSectionDescription,
        newsHeading: homepageContent.newsHeading,
        newsSeeAllText: homepageContent.newsSeeAllText,
        newsSeeAllSubtext: homepageContent.newsSeeAllSubtext,
      }
    : {};

  return (
    <Suspense fallback={<></>}>
      <Home content={content} news={news} images={images} />
    </Suspense>
  );
}

export default Page;
