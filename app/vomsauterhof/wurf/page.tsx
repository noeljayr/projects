import clientPromise from "@/lib/mongodb";
import { redirect } from "next/navigation";
import { categoryToSlug } from "@/lib/categorySlug";

async function Page() {
  const client = await clientPromise;
  const db = client.db("vom_sauterhof");

  // Fetch all published categories
  const wurfCollection = db.collection("wurf");
  const allWurf = await wurfCollection
    .find({ status: "published" })
    .sort({ createdAt: 1 })
    .toArray();

  const categories = allWurf
    .map((w) => w.category)
    .filter((c) => c && c.trim() !== "");

  // Redirect to the first category
  if (categories.length > 0) {
    redirect(`/vomsauterhof/wurf/${categoryToSlug(categories[0])}`);
  }

  // If no categories, redirect to home or show error
  redirect("/vomsauterhof");
}

export default Page;
