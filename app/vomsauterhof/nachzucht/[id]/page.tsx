import NachzuchtWrapper from "@/components/NachzuchtWrapper";
import clientPromise from "@/lib/mongodb";
import { BannerContent } from "@/types/banner";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";

async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await clientPromise;
  const db = client.db("vom_sauterhof");

  // Fetch wurf data
  const wurfCollection = db.collection("wurf");
  const wurfData = await wurfCollection.findOne({
    _id: new ObjectId(id),
    status: "published",
  });

  if (!wurfData) {
    notFound();
  }

  // Fetch timeline data for this wurf (for wurf-a category)
  const timelineCollection = db.collection("timeline");
  const timelineData = await timelineCollection.findOne({
    wurfId: id,
    information: { $exists: true },
  });

  const nachzucht = timelineData
    ? {
        information: timelineData.information || "",
      }
    : null;

  const wurf = {
    id: wurfData._id.toString(),
    name: wurfData.name,
    category: wurfData.category || "",
    image: wurfData.image || "",
  };

  const bannersCollection = db.collection("banners");
  const bannerData = await bannersCollection.findOne({ page: "wurf" });
  const bannerContent: BannerContent = bannerData
    ? {
        title: bannerData.title,
        description: bannerData.description ? bannerData.description : "lorem",
      }
    : {};

  return (
    <NachzuchtWrapper
      nachzucht={nachzucht}
      wurf={wurf}
      bannerContent={bannerContent}
    />
  );
}

export default Page;
