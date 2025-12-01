"use client";

import Banner from "@/components/Banner";
import BeauceronCard from "@/components/beauceron/BeauceronCard";
import { BannerContent } from "@/types/banner";
import { Beauceron } from "@/types/Beauceron";
import { useSearchParams } from "next/navigation";

type Props = {
  bannerContent: BannerContent;
  beauceron: Beauceron[];
};

export default function BeauceronPageWrapper({
  bannerContent,
  beauceron,
}: Props) {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";

  return (
    <div className="gap-16 flex flex-col">
      <Banner
        name={bannerContent.title}
        description={bannerContent.description}
        isEditMode={isEditMode}
        page="beauceron"
      />

      <div className="grid gap-8 grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 max-sm:mb-16 section-container mx-auto">
        {beauceron.map((dog) => (
          <BeauceronCard key={dog.id} beauceron={dog} />
        ))}
      </div>
    </div>
  );
}
