import clientPromise from "@/lib/mongodb";
import { BannerContent } from "@/types/banner";
import WurfPageWrapper from "@/components/pages/WurfPageWrapper";

async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const client = await clientPromise;
  const db = client.db("vom_sauterhof");

  // Fetch banner content
  const bannersCollection = db.collection("banners");
  const bannerData = await bannersCollection.findOne({ page: "wurf" });
  const bannerContent: BannerContent = bannerData
    ? {
        title: bannerData.title,
        description: bannerData.description ? bannerData.description : "lorem",
      }
    : {};

  // Fetch all published categories
  const wurfCollection = db.collection("wurf");
  const allWurf = await wurfCollection
    .find({ status: "published" })
    .sort({ createdAt: 1 })
    .toArray();

  const categories = allWurf
    .map((w) => w.category)
    .filter((c) => c && c.trim() !== "");

  // Get the active category (from query param or first available)
  const params = await searchParams;
  const activeCategory = params.category || categories[0];

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

  return (
    <WurfPageWrapper
      bannerContent={bannerContent}
      categories={categories}
      activeCategory={activeCategory}
      wurf={wurf}
      timeline={timeline}
    />
  );
}

export default Page;
