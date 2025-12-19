"use client";

import Banner from "@/components/Banner";
import { BannerContent } from "@/types/banner";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import TimelineClient from "@/components/wurf/TimelineClient";
import { IconArrowUpRight } from "@tabler/icons-react";
import { useEffect } from "react";

import paw2 from "@/public/paw-2.png";
import Image from "next/image";

type WurfData = {
  id: string;
  name: string;
  information: string;
  image: string;
  category: string;
  documents: {
    stammbaum: string;
    workingDog: string;
    arbeit: string;
  };
} | null;

type TimelineDog = {
  name: string;
  image: string;
};

type TimelineEntry = {
  id: string;
  wurfId: string;
  date: string;
  title: string;
  dogs: TimelineDog[];
  category: string;
};

type WelpenData = {
  information: string;
  date: string;
  title: string;
  dogs: TimelineDog[];
} | null;

type WurfCategory = {
  _id: string;
  name: string;
  description: string;
  slug: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  bannerContent: BannerContent;
  categories: WurfCategory[];
  activeCategory: WurfCategory;
  wurf: WurfData;
  timeline: TimelineEntry[];
  welpen: WelpenData;
};

const WurfPageWrapper = ({
  bannerContent,
  categories,
  activeCategory,
  wurf,
  timeline,
  welpen,
}: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const isEditMode = searchParams.get("mode") === "edit";

  const handleCategoryChange = (categorySlug: string) => {
    const params = new URLSearchParams();
    if (isEditMode) {
      params.set("mode", "edit");
    }
    const queryString = params.toString();
    router.push(
      `/vomsauterhof/wurf/${categorySlug}${
        queryString ? `?${queryString}` : ""
      }`
    );
  };

  const docs = [
    {
      title: "Stammbaum",
      link: wurf?.documents.stammbaum || "#",
    },
    {
      title: "Working-Dog",
      link: wurf?.documents.workingDog || "#",
    },
    {
      title: "Arbeit",
      link: wurf?.documents.arbeit || "#",
    },
  ];

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
        categorySlug={activeCategory.slug}
        style={{
          marginBottom: 0,
        }}
      />

      {wurf ? (
        <>
          {wurf.image && (
            <div className="relative flex w-full py-[4rem] mb-16 px-[10%] max-sm:px-[5%] bg-[#58483B]">
              <div className="w-full h-full section-container flex absolute z-0">
                <Image
                  src={paw2}
                  alt=""
                  className="absolute w-20 top-[25%] left-0  z-0"
                />

                <Image
                  src={paw2}
                  alt=""
                  className="absolute w-20 top-[42%] left-0  z-0"
                />

                <Image
                  src={paw2}
                  alt=""
                  className="absolute w-20 top-[25%]  right-38 rotate-180   z-0"
                />

                <Image
                  src={paw2}
                  alt=""
                  className="absolute w-20 top-[42%] rotate-180 right-38  z-0"
                />
              </div>
              <img
                src={wurf.image}
                alt={wurf.name}
                className="w-[40%] max-sm:w-[90%] mx-auto relative z-1 object-cover rounded-[0.65rem] max-sm:rounded-[0.75rem]"
              />
            </div>
          )}

          <div className="flex flex-col gap-8 section-container mx-auto">
            <div className="flex items-center max-[900px]:flex-col max-[900px]:items-start">
              <div className="flex items-center w-full">
                <h3>{wurf.name}</h3>

                {wurf.category === "wurf-a" && (
                  <Link
                    href={`/vomsauterhof/welpen/${wurf.id}`}
                    className="px-4 py-2 flex ml-auto bg-[#58483B] text-white text-sm font-medium rounded-[0.5rem]"
                  >
                    Welpen
                  </Link>
                )}
              </div>

              <div className="flex ml-auto max-[900px]:ml-0 max-[900px]:mt-4 gap-4">
                {docs.map((doc) => {
                  if (doc.link.trim().length > 0)
                    return (
                      <Link
                        key={doc.title}
                        target="_blank"
                        style={{
                          transition: "ease 0.5s",
                        }}
                        href={doc.link}
                        className={`px-4 py-2 bg-[#FBF2EA] border border-black/10 text-sm font-medium rounded-[0.5rem] hover:bg-[#D3C1B3] ${
                          doc.link === "#" ? "hidden" : ""
                        }`}
                      >
                        {doc.title}
                      </Link>
                    );
                })}
              </div>
            </div>

            <div
              className="font-p2 wurf-content no-captions"
              dangerouslySetInnerHTML={{ __html: wurf.information }}
            />
          </div>

          {wurf.category === "wurf-a" ? (
            <>
              {welpen && welpen.information && <></>}
              <TimelineClient timeline={timeline} showFilters={false} />
            </>
          ) : (
            <TimelineClient
              timeline={timeline}
              welpen={welpen}
              showFilters={true}
            />
          )}
        </>
      ) : (
        <div className="section-container mx-auto text-center py-16">
          <p className="text-lg opacity-75">
            Keine Wurf-Daten verfügbar für diese Kategorie.
          </p>
        </div>
      )}
    </div>
  );
};

export default WurfPageWrapper;
