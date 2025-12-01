import BeauceronPageWrapper from "@/components/pages/BeauceronPageWrapper";
import clientPromise from "@/lib/mongodb";
import { BannerContent } from "@/types/banner";
import { Beauceron } from "@/types/Beauceron";

async function Page() {
  const client = await clientPromise;
  const db = client.db("vom_sauterhof");

  const bannersCollection = db.collection("banners");
  const bannerData = await bannersCollection.findOne({ page: "beauceron" });
  const bannerContent: BannerContent = bannerData
    ? {
        title: bannerData.title,
        description: bannerData.description,
      }
    : {};

  // Fetch Beauceron data from database
  const beauceronCollection = db.collection("beauceron");
  const beauceronData = await beauceronCollection.find({}).toArray();

  // Transform MongoDB documents to Beauceron type
  const beauceron: Beauceron[] = beauceronData.map((dog) => ({
    id: dog.id || dog._id.toString(),
    slug: dog.slug,
    name: dog.name,
    image: dog.image,
    images: dog.images || [],
    dob: dog.dob,
    weight: dog.weight,
    height: dog.height,
    description: dog.description,
    status: dog.status || "active",
  }));

  return (
    <BeauceronPageWrapper bannerContent={bannerContent} beauceron={beauceron} />
  );
}

export default Page;
