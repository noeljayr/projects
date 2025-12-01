import Banner from "@/components/Banner";
import { IconArrowLeft, IconFileTypePdf } from "@tabler/icons-react";
import Link from "next/link";
import { Beauceron } from "@/types/Beauceron";
import clientPromise from "@/lib/mongodb";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/formatDate";

type DocumentType =
  | "stammbaum"
  | "arbeitsresultate"
  | "ausstellungsresultate"
  | "zucht";

async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const client = await clientPromise;
  const db = client.db("vom_sauterhof");

  // Fetch Beauceron data from database
  const beauceronCollection = db.collection("beauceron");
  const beauceronData = await beauceronCollection.findOne({ slug });

  if (!beauceronData) {
    notFound();
  }

  // Transform MongoDB document to Beauceron type
  const beauceron: Beauceron = {
    id: beauceronData.id || beauceronData._id.toString(),
    slug: beauceronData.slug,
    name: beauceronData.name,
    image: beauceronData.image,
    images: beauceronData.images || [],
    dob: beauceronData.dob,
    weight: beauceronData.weight,
    height: beauceronData.height,
    description: beauceronData.description,
    status: beauceronData.status || "active",
  };

  // Fetch documents for this beauceron
  const documentsCollection = db.collection("beauceron_documents.files");
  const beauceronId = beauceron.id;

  const documents = await documentsCollection
    .find({ "metadata.beauceronId": beauceronId })
    .toArray();

  // Create a map of document types to file IDs
  const documentMap: Record<DocumentType, string | null> = {
    stammbaum: null,
    arbeitsresultate: null,
    ausstellungsresultate: null,
    zucht: null,
  };

  documents.forEach((doc) => {
    const type = doc.metadata.type as DocumentType;
    if (type && documentMap.hasOwnProperty(type)) {
      documentMap[type] = doc._id.toString();
    }
  });

  return (
    <div className="flex flex-col gap-16">
      <Banner
        name="Beauceron"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      />

      <div className="flex flex-col gap-12 section-container mx-auto">
        <Link
          href="/vomsauterhof/unsere-beauceron"
          className="bg-[#58483B] text-white w-fit font-medium flex font-p4 items-center border border-[var(--c-border)] px-3 py-2 rounded-3xl"
        >
          <IconArrowLeft className="h-4 w-4 mr-2" color="white" />
          Zurück zur Übersicht
        </Link>

        <div className="flex items-center w-full max-[900px]:flex-col max-[900px]:items-start max-[900px]:space-y-4 max-sm:space-y-8">
          <div className="flex items-center space-x-4  max-[900px]:flex-col max-[900px]:space-x-0 max-[900px]:space-y-4 max-[900px]:items-start">
            <img
              src={`${beauceron.image}`}
              className="h-16 w-16 rounded-full object-cover"
            />
            <div className="flex flex-col space-y-2">
              <span className="font-bold">{beauceron.name}</span>

              <div className="flex space-x-8 max-sm:space-x-16 font-p4 items-center">
                <span className="flex items-center max-sm:flex-col max-sm:items-start gap-1">
                  <span className="opacity-50 mr-2 max-sm:mr-0">
                    Geburtsdatum
                  </span>
                  <span>{formatDate(beauceron.dob)}</span>
                </span>

                <span className="font-bold opacity-25 max-sm:hidden">•</span>

                <span className="flex items-center max-sm:flex-col max-sm:items-start gap-1">
                  <span className="opacity-50 mr-2 max-sm:mr-0">Höhe</span>
                  <span>{beauceron.height ? beauceron.height : "-"}</span>
                </span>

                <span className="font-bold opacity-25 max-sm:hidden">•</span>

                <span className="flex items-center max-sm:flex-col max-sm:items-start gap-1">
                  <span className="opacity-50 mr-2 max-sm:mr-0">Gewicht</span>
                  <span>{beauceron.weight ? beauceron.weight : "-"}</span>
                </span>
              </div>
            </div>
          </div>

          {documentMap.stammbaum && (
            <Link
              href={`/api/beauceron/documents/download?fileId=${documentMap.stammbaum}`}
              target="_blank"
              className="font-medium flex items-center ml-auto border border-[rgba(26,_26,_26,_0.05)] bg-[#EEE5DD] px-4 py-2 rounded-[0.5rem] font-p4 max-[900px]:ml-0"
            >
              <IconFileTypePdf className="h-4 w-4 mr-2" />
              Stammbaum
            </Link>
          )}
        </div>

        <div className="w-full grid grid-cols-[1fr_auto_13.5rem] gap-16 max-[900px]:flex max-[900px]:flex-col max-[900px]:gap-6 items-center border border-[rgba(0,_0,_0,_0.15)] p-4 rounded-[1rem]">
          <div className="flex">
            <p
              className="opacity-75 font-p3"
              dangerouslySetInnerHTML={{ __html: beauceron.description }}
            />
          </div>

          <span className="w-[1px] h-[75%] bg-[#EDE0D6] max-[900px]:hidden"></span>

          <div className="flex flex-col max-[900px]:grid max-[900px]:grid-cols-3 max-[900px]:w-full gap-4 max-[900px]:pt-6 max-[900px]:border-t max-[900px]:border-black/5 max-sm:grid-cols-2 max-[370px]:grid-cols-1">
            {documentMap.stammbaum && (
              <Link
                href={`/api/beauceron/documents/download?fileId=${documentMap.ausstellungsresultate}`}
                target="_blank"
                className="w-full font-medium flex items-center ml-auto border border-[rgba(26,_26,_26,_0.05)] bg-[#EEE5DD] px-4 py-2 rounded-[0.5rem] font-p4"
              >
                <IconFileTypePdf className="h-4 w-4 mr-2" />
                Ausstellungsresultate
              </Link>
            )}
            {documentMap.arbeitsresultate && (
              <Link
                href={`/api/beauceron/documents/download?fileId=${documentMap.arbeitsresultate}`}
                target="_blank"
                className="w-full font-medium flex items-center ml-auto border border-[rgba(26,_26,_26,_0.05)] bg-[#EEE5DD] px-4 py-2 rounded-[0.5rem] font-p4"
              >
                <IconFileTypePdf className="h-4 w-4 mr-2" />
                Arbeitsresultate
              </Link>
            )}
            {documentMap.zucht && (
              <Link
                href={`/api/beauceron/documents/download?fileId=${documentMap.zucht}`}
                target="_blank"
                className="w-full font-medium flex items-center ml-auto border border-[rgba(26,_26,_26,_0.05)] bg-[#EEE5DD] px-4 py-2 rounded-[0.5rem] font-p4"
              >
                <IconFileTypePdf className="h-4 w-4 mr-2" />
                Zucht
              </Link>
            )}
          </div>
        </div>

        {beauceron.images && beauceron.images.length > 0 && (
          <div className="grid grid-cols-3 max-[720px]:grid-cols-2 max-sm:grid-cols-1 gap-4">
            {beauceron.images.map((image, index) => (
              <img
                key={index}
                className="w-full aspect-square object-cover rounded-[1rem]"
                src={`${image}`}
                alt={`${beauceron.name} ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
