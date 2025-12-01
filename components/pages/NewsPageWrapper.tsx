"use client";

import Banner from "@/components/Banner";
import NewsPageClient from "@/components/pages/NewsPageClient";
import { BannerContent } from "@/types/banner";
import { News } from "@/types/News";
import { useSearchParams } from "next/navigation";

type NewsPageContent = {
  searchPlaceholder?: string;
  sortNewest?: string;
  sortOldest?: string;
};

type Props = {
  bannerContent: BannerContent;
  newsPageContent: NewsPageContent;
  news: News[];
};

export default function NewsPageWrapper({
  bannerContent,
  newsPageContent,
  news,
}: Props) {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";

  return (
    <div className="w-full flex flex-col">
      <Banner
        name={bannerContent.title}
        description={bannerContent.description}
        isEditMode={isEditMode}
        page="news"
      />
      <NewsPageClient content={newsPageContent} news={news} />
    </div>
  );
}
