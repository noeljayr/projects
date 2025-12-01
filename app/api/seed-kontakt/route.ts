import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("vom_sauterhof");

    const kontaktCollection = db.collection("kontakt");

    const kontaktContent = {
      bannerTitle: "Kontakt",
      bannerDescription:
        "Haben Sie Fragen zu unseren Beaucerons oder möchten Sie uns kennenlernen? Wir freuen uns auf Ihre Nachricht!",
      familyName: "Familie Sauter",
      addressLine1: "Mühlerain 873",
      addressLine2: "CH-9116 Wolfertswil SG",
      phone: "078 770 49 24",
      email: "ti.genoveva@bluewin.ch",
      availabilityTitle: "Erreichbarkeit",
      availabilityText:
        "Wir sind am besten telefonisch oder per E-Mail erreichbar. Bitte haben Sie Verständnis, dass wir nicht immer sofort antworten können, da wir uns intensiv um unsere Hunde kümmern. Wir melden uns so schnell wie möglich bei Ihnen zurück.",
    };

    await kontaktCollection.deleteMany({});
    await kontaktCollection.insertOne(kontaktContent);

    return NextResponse.json({
      success: true,
      message: "Kontakt content seeded successfully",
    });
  } catch (error) {
    console.error("Error seeding kontakt content:", error);
    return NextResponse.json(
      { error: "Failed to seed kontakt content" },
      { status: 500 }
    );
  }
}
