import { Suspense } from "react";
import clientPromise from "@/lib/mongodb";
import { KontaktContent } from "@/types/kontakt";
import KontaktClient from "@/components/pages/KontaktClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontaktieren Sie uns für Fragen zu unseren Beaucerons. Familie Sauter freut sich auf Ihre Nachricht.",
  openGraph: {
    title: "Kontakt | Beauceron Vom Sauterhof",
    description: "Kontaktieren Sie uns für Fragen zu unseren Beaucerons.",
  },
};

export const revalidate = 0;

async function Page() {
  const client = await clientPromise;
  const db = client.db("vom_sauterhof");

  const kontaktCollection = db.collection("kontakt");
  const kontaktData = await kontaktCollection.findOne({});
  const content: KontaktContent = kontaktData
    ? {
        bannerTitle: kontaktData.bannerTitle,
        bannerDescription: kontaktData.bannerDescription,
        familyName: kontaktData.familyName,
        addressLine1: kontaktData.addressLine1,
        addressLine2: kontaktData.addressLine2,
        phone: kontaktData.phone,
        email: kontaktData.email,
        availabilityTitle: kontaktData.availabilityTitle,
        availabilityText: kontaktData.availabilityText,
      }
    : {};

  return (
    <Suspense fallback={<div></div>}>
      <KontaktClient content={content} />
    </Suspense>
  );
}

export default Page;
