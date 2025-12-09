import clientPromise from "@/lib/mongodb";
import { BannerContent } from "@/types/banner";
import WurfPageWrapper from "@/components/pages/WurfPageWrapper";
import { notFound } from "next/navigation";
import { slugToCategory } from "@/lib/categorySlug";

async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
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

  // Convert slug back to category name
  const activeCategory = slugToCategory(slug, categories);

  // Check if category exists
  if (!activeCategory) {
    notFound();
  }

  // Fetch the wurf data for the active category
  const wurfData = await wurfCollection.findOne({
    category: activeCategory,
    status: "published",
  });

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
    description: entry.description || "",
    dogs: entry.dogs || [],
    category: "nachzucht",
  }));

  // Fetch welpen data for the active wurf
  const welpenCollection = db.collection("welpen");
  const welpenData =
    wurf && wurfData
      ? await welpenCollection.findOne({
          wurfId: wurfData._id,
        })
      : null;

  const welpen = welpenData
    ? {
        information: welpenData.information || "",
        date: welpenData.date || "",
        title: welpenData.title || "",
        dogs: welpenData.dogs || [],
      }
    : null;

  return (
    <WurfPageWrapper
      bannerContent={bannerContent}
      categories={categories}
      activeCategory={activeCategory}
      wurf={wurf}
      timeline={timeline}
      welpen={welpen}
    />
  );
}

export default Page;
