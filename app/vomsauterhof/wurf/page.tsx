import clientPromise from "@/lib/mongodb";
import { redirect } from "next/navigation";

async function Page() {
  const client = await clientPromise;
  const db = client.db("vom_sauterhof");

  // Fetch all published categories from wurf_categories collection
  const categoriesCollection = db.collection("wurf_categories");
  const categories = await categoriesCollection
    .find({ status: "published" })
    .sort({ createdAt: 1 })
    .toArray();

  // Redirect to the first category
  if (categories.length > 0) {
    redirect(`/vomsauterhof/wurf/${categories[0].slug}`);
  }

  // If no categories, redirect to home or show error
  redirect("/vomsauterhof");
}

export default Page;
