"use client";

import Banner from "@/components/Banner";
import { BannerContent } from "@/types/banner";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import TimelineClient from "@/components/wurf/TimelineClient";
import { IconArrowUpRight } from "@tabler/icons-react";
import { useEffect } from "react";
import { categoryToSlug } from "@/lib/categorySlug";

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

type Props = {
  bannerContent: BannerContent;
  categories: string[];
  activeCategory: string;
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

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams();
    if (isEditMode) {
      params.set("mode", "edit");
    }
    const queryString = params.toString();
    router.push(
      `/vomsauterhof/wurf/${categoryToSlug(category)}${
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

  return (
    <div className="gap-12 flex flex-col w-full pb-16">
      <Banner
        name={bannerContent.title}
        description={bannerContent.description}
        isEditMode={isEditMode}
        page="wurf"
      />

      {categories.length > 0 && (
        <div className="flex w-full flex-wrap max-sm:flex-grow section-container mx-auto gap-4">
          {categories.map((c) => {
            return (
              <span
                key={c}
                style={{
                  transition: "ease 0.5s",
                }}
                onClick={() => handleCategoryChange(c)}
                className={`px-4 capitalize py-2 border cursor-pointer hover:brightness-95 rounded-[0.5rem] ${
                  activeCategory === c
                    ? "bg-[#58483B] border-[#58483B] text-white"
                    : "bg-[#FBF2EA] border border-black/10 "
                }`}
              >
                {c}
              </span>
            );
          })}
        </div>
      )}

      {wurf ? (
        <>
          {wurf.image && (
            <div className="flex w-full py-[4rem] px-[10%] max-sm:px-[5%] bg-[#58483B]">
              <img
                src={wurf.image}
                alt={wurf.name}
                className="w-[35%] mx-auto object-cover rounded-[0.65rem] max-sm:rounded-[0.75rem]"
              />
            </div>
          )}

          <div className="flex flex-col gap-8 section-container mx-auto">
            <div className="flex items-center max-[900px]:flex-col max-[900px]:items-start">
              <div className="flex items-center">
                <h3>{wurf.name}</h3>

                {wurf.category === "wurf a" && (
                  <Link
                    href={`/vomsauterhof/welpen/${wurf.id}`}
                    className="ml-6 flex items-center text-white bg-[#58483B] px-2 py-1 rounded-[0.5rem]"
                  >
                    Welpen
                    <IconArrowUpRight className="h-4 w-4 ml-2" color="white" />
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
                        className={`px-4 py-2 bg-white border border-black/10 text-sm font-medium rounded-[0.5rem] hover:bg-[#D3C1B3] ${
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
              className="font-p2 wurf-content"
              dangerouslySetInnerHTML={{ __html: wurf.information }}
            />
          </div>

          {wurf.category === "wurf a" ? (
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
