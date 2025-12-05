import WelpenWrapper from "@/components/WelpenWrapper";
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

  // Fetch welpen data for this wurf
  const welpenCollection = db.collection("welpen");
  const welpenData = await welpenCollection.findOne({
    wurfId: new ObjectId(id),
  });

  const welpen = welpenData
    ? {
        information: welpenData.information || "",
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
    <div className="gap-16 flex flex-col w-full pb-16">
      <WelpenWrapper
        welpen={welpen}
        wurf={wurf}
        bannerContent={bannerContent}
      />
    </div>
  );
}

export default Page;
