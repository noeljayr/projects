import clientPromise from "@/lib/mongodb";
import { BannerContent } from "@/types/banner";
import WurfPageWrapper from "@/components/pages/WurfPageWrapper";
import { notFound } from "next/navigation";

async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  const client = await clientPromise;
  const db = client.db("vom_sauterhof");

  // Fetch all published categories
  const categoriesCollection = db.collection("wurf_categories");
  const categoriesData = await categoriesCollection
    .find({ status: "published" })
    .sort({ createdAt: 1 })
    .toArray();

  // Transform categories to plain objects
  const allCategories = categoriesData.map((cat) => ({
    _id: cat._id.toString(),
    name: cat.name,
    description: cat.description,
    slug: cat.slug,
    status: cat.status,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString(),
  }));

  // Check if category exists
  const activeCategory = allCategories.find((cat) => cat.slug === categorySlug);
  if (!activeCategory) {
    notFound();
  }

  // Fetch banner content - use category data for banner
  const bannerContent: BannerContent = {
    title: activeCategory.name,
    description:
      activeCategory.description ||
      "Entdecken Sie unsere Würfe und deren Entwicklung.",
  };

  // Fetch the wurf data for the active category
  const wurfCollection = db.collection("wurf");
  const wurfData = await wurfCollection.findOne({
    categorySlug: categorySlug,
    status: "published",
  });

  const wurf = wurfData
    ? {
        id: wurfData._id.toString(),
        name: wurfData.name,
        information: wurfData.information,
        image: wurfData.image || "",
        category: wurfData.category || "",
        categorySlug: wurfData.categorySlug || "",
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
  const welpenCollection = db.collection("welpen_entries");
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
      categories={allCategories}
      activeCategory={activeCategory}
      wurf={wurf}
      timeline={timeline}
      welpen={welpen}
    />
  );
}

export default Page;
