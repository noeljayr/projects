"use client";

import Banner from "@/components/Banner";
import { AboutContent } from "@/types/about";
import { useSearchParams } from "next/navigation";
import EditableTextAbout from "@/components/EditableTextAbout";
import EditableImage from "@/components/EditableImage";

type AboutImages = {
  aboutFamily?: string;
  aboutFarm?: string;
  aboutPack?: string;
  aboutFinal?: string;
};

type Props = {
  content: AboutContent;
  images: AboutImages;
};

export default function AboutUsClient({ content, images }: Props) {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";

  return (
    <div className="flex flex-col gap-16">
      <Banner
        name={content.bannerTitle}
        description={content.bannerDescription}
        isEditMode={isEditMode}
      />

      <div className="w-[70%] flex flex-col gap-16 max-sm:w-full px-10 mx-auto">
        <div className="flex flex-col items-center gap-2">
          <EditableTextAbout
            initialValue={content.welcomeHeading || ""}
            fieldName="welcomeHeading"
            isEditMode={isEditMode}
            className=""
            as="h3"
          />
          <EditableTextAbout
            initialValue={content.welcomeText || ""}
            fieldName="welcomeText"
            isEditMode={isEditMode}
            className="w-full text-center max-sm:text-left font-p3 opacity-75"
            as="p"
            multiline
          />
        </div>

        <div className="grid grid-cols-[1fr_40%] max-sm:flex max-sm:flex-col items-center gap-10 w-full border border-[var(--c-border)] p-8 max-sm:p-4 max-sm:px-6 max-sm:pb-6 rounded-[1rem]">
          <div className="flex flex-col">
            <EditableTextAbout
              initialValue={content.homeHeading || ""}
              fieldName="homeHeading"
              isEditMode={isEditMode}
              className=""
              as="h4"
            />
            <EditableTextAbout
              initialValue={content.homeText || ""}
              fieldName="homeText"
              isEditMode={isEditMode}
              className="w-full font-p3 opacity-75"
              as="p"
              multiline
            />
          </div>

          <div className="relative h-[15rem] w-full">
            <EditableImage
              initialSrc={images.aboutFamily || "/family.png"}
              fieldName="aboutFamily"
              isEditMode={isEditMode}
              alt="family"
              fill
              className="object-cover rounded-[0.85rem]"
            />
          </div>
        </div>

        <div className="grid grid-cols-[50%_1fr] max-sm:flex max-sm:flex-col max-sm:mb-16 items-center gap-10 w-full ">
          <div className="relative h-[15rem] w-full">
            <EditableImage
              initialSrc={images.aboutFarm || "/farm.png"}
              fieldName="aboutFarm"
              isEditMode={isEditMode}
              alt="farm"
              fill
              className="object-cover rounded-[0.85rem]"
            />
          </div>

          <div className="flex flex-col">
            <EditableTextAbout
              initialValue={content.breedingHeading || ""}
              fieldName="breedingHeading"
              isEditMode={isEditMode}
              className=""
              as="h4"
            />
            <EditableTextAbout
              initialValue={content.breedingText || ""}
              fieldName="breedingText"
              isEditMode={isEditMode}
              className="w-full font-p3 opacity-75"
              as="p"
              multiline
            />
          </div>
        </div>

        <div className="grid grid-cols-[1fr_50%] max-sm:flex max-sm:flex-col max-sm:mb-16 items-center gap-10 w-full ">
          <div className="flex flex-col">
            <EditableTextAbout
              initialValue={content.packHeading || ""}
              fieldName="packHeading"
              isEditMode={isEditMode}
              className=""
              as="h4"
            />
            <EditableTextAbout
              initialValue={content.packText || ""}
              fieldName="packText"
              isEditMode={isEditMode}
              className="w-full font-p3 opacity-75"
              as="p"
              multiline
            />
          </div>

          <div className="relative h-[15rem] w-full">
            <EditableImage
              initialSrc={images.aboutPack || "/Hunderudel.png"}
              fieldName="aboutPack"
              isEditMode={isEditMode}
              alt="Hunderudel"
              fill
              className="object-cover rounded-[0.85rem]"
            />
          </div>
        </div>

        <div className="grid grid-cols-[50%_1fr] max-sm:flex max-sm:flex-col max-sm:mb-16 items-center gap-10 w-full ">
          <div className="relative h-[15rem] w-full">
            <EditableImage
              initialSrc={
                images.aboutFinal || "/IMG_7126_edited_edited_edited.png"
              }
              fieldName="aboutFinal"
              isEditMode={isEditMode}
              alt="IMG_7126"
              fill
              className="object-cover rounded-[0.85rem]"
            />
          </div>

          <div className="flex flex-col">
            <EditableTextAbout
              initialValue={content.finalText || ""}
              fieldName="finalText"
              isEditMode={isEditMode}
              className="w-full font-p3 opacity-75"
              as="p"
              multiline
            />
          </div>
        </div>
      </div>
    </div>
  );
}
