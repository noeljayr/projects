import { Suspense } from "react";
import clientPromise from "@/lib/mongodb";
import { AboutContent } from "@/types/about";
import AboutUsClient from "@/components/pages/AboutUsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Über Uns",
  description:
    "Lernen Sie unsere Familie und unsere Beauceronzucht kennen. Erfahren Sie mehr über unsere Philosophie, unser Zuhause und unser Rudel.",
  openGraph: {
    title: "Über Uns | Beauceron Vom Sauterhof",
    description: "Lernen Sie unsere Familie und unsere Beauceronzucht kennen.",
  },
};

export const revalidate = 0;

async function Page() {
  const client = await clientPromise;
  const db = client.db("vom_sauterhof");

  const aboutCollection = db.collection("about");
  const aboutData = await aboutCollection.findOne({});
  const content: AboutContent = aboutData
    ? {
        bannerTitle: aboutData.bannerTitle,
        bannerDescription: aboutData.bannerDescription,
        welcomeHeading: aboutData.welcomeHeading,
        welcomeText: aboutData.welcomeText,
        homeHeading: aboutData.homeHeading,
        homeText: aboutData.homeText,
        breedingHeading: aboutData.breedingHeading,
        breedingText: aboutData.breedingText,
        packHeading: aboutData.packHeading,
        packText: aboutData.packText,
        finalText: aboutData.finalText,
      }
    : {};

  // Fetch images
  const imagesCollection = db.collection("images");
  const imagesData = await imagesCollection.findOne({
    _id: "site-images",
  } as any);

  const images = {
    aboutFamily: imagesData?.aboutFamily || "/family.png",
    aboutFarm: imagesData?.aboutFarm || "/farm.png",
    aboutPack: imagesData?.aboutPack || "/Hunderudel.png",
    aboutFinal: imagesData?.aboutFinal || "/IMG_7126_edited_edited_edited.png",
  };

  return (
    <Suspense fallback={<div></div>}>
      <AboutUsClient content={content} images={images} />
    </Suspense>
  );
}

export default Page;
