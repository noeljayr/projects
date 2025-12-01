"use client";

import { BannerContent } from "@/types/banner";
import Banner from "./Banner";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

type Props = {
  bannerContent: BannerContent;
  wurf: {
    id: string;
    name: string;
    category: string;
    image: string;
  };
  welpen: {
    information: any;
  } | null;
};
function WelpenWrapper({ bannerContent, welpen, wurf }: Props) {
  const searchParams = useSearchParams();

  const isEditMode = searchParams.get("mode") === "edit";

  useEffect(() => {
    const imageWrappers = document.querySelectorAll(".image-wrapper");

    if (!imageWrappers) return;

    imageWrappers.forEach((wrapper) => {
      const caption = wrapper.querySelector("input");
      if (!caption) return;
      const value = caption.value.trim();
      const span = document.createElement("span");
      span.textContent = value;
      wrapper.removeChild(caption);
      wrapper.appendChild(span);
    });
  }, []);

  return (
    <>
      <Banner
        name={bannerContent.title}
        description={bannerContent.description}
        isEditMode={isEditMode}
        page="wurf"
      />

      <div className="flex flex-col gap-8 section-container mx-auto">
        <div className="flex items-center">
          <h3>{wurf.name} - Welpen</h3>
        </div>
        {welpen && welpen.information ? (
          <div
            className="font-p2 wurf-content"
            dangerouslySetInnerHTML={{ __html: welpen.information }}
          />
        ) : (
          <div className="text-center py-16">
            <p className="text-lg opacity-75">
              Keine Welpen-Informationen verfügbar für diesen Wurf.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default WelpenWrapper;
