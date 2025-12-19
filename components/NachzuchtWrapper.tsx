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
  nachzucht: {
    information: any;
  } | null;
};

function NachzuchtWrapper({ bannerContent, nachzucht, wurf }: Props) {
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

  useEffect(() => {
    const videoWrappers = document.querySelectorAll(".video-wrapper");

    if (!videoWrappers) return;

    videoWrappers.forEach((wrapper) => {
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
    <div className="flex flex-col pb-16">
      <Banner
        name={bannerContent.title}
        description={bannerContent.description}
        isEditMode={isEditMode}
        page="wurf"
        style={{
          marginBottom: 0,
        }}
      />

      <div className="flex flex-col gap-8 pt-16 section-container mx-auto">
        <div className="flex items-center">
          <h3>{wurf.name} - Nachzucht</h3>
        </div>
        {nachzucht && nachzucht.information ? (
          <div
            className="font-p2 wurf-content no-captions"
            dangerouslySetInnerHTML={{ __html: nachzucht.information }}
          />
        ) : (
          <div className="text-center py-16">
            <p className="text-lg opacity-75">
              Keine Nachzucht-Informationen verfügbar für diesen Wurf.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NachzuchtWrapper;
