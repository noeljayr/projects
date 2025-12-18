"use client";

import React from "react";
import EditableTextAbout from "./EditableTextAbout";
import EditableTextBanner from "./EditableTextBanner";
import EditableTextKontakt from "./EditableTextKontakt";
import EditableTextWurfCategory from "./EditableTextWurfCategory";

type Props = {
  name?: string;
  description?: string;
  isEditMode?: boolean;
  page?: string; // "about", "news", "kontakt", or "wurf"
  categorySlug?: string; // Required when page is "wurf"
  style?: React.CSSProperties
};

function Banner({
  name,
  description,
  isEditMode = false,
  page = "about",
  categorySlug,
  style
}: Props) {
  const EditableComponent =
    page === "about"
      ? EditableTextAbout
      : page === "kontakt"
      ? EditableTextKontakt
      : page === "wurf"
      ? EditableTextWurfCategory
      : EditableTextBanner;

  return (
    <div style={style} className="w-screen flex items-center justify-center flex-col pb-32 mb-12 pt-40 bg-[#BFA999] border-b-[15px] border-b-[#58483B]">
      {name &&
        (page === "about" ? (
          <EditableTextAbout
            initialValue={name}
            fieldName="bannerTitle"
            isEditMode={isEditMode}
            className="text-center w-fit"
            as="h1"
          />
        ) : page === "kontakt" ? (
          <EditableTextKontakt
            initialValue={name}
            fieldName="bannerTitle"
            isEditMode={isEditMode}
            className="text-center w-fit"
            as="h1"
          />
        ) : page === "wurf" && categorySlug ? (
          <EditableTextWurfCategory
            initialValue={name}
            fieldName="name"
            categorySlug={categorySlug}
            isEditMode={isEditMode}
            className="text-center w-fit"
            as="h1"
          />
        ) : (
          <EditableTextBanner
            initialValue={name}
            fieldName="title"
            isEditMode={isEditMode}
            page={page}
            className="text-center w-fit"
            as="h1"
          />
        ))}
      {description &&
        (page === "about" ? (
          <EditableTextAbout
            initialValue={description}
            fieldName="bannerDescription"
            isEditMode={isEditMode}
            className="opacity-75 font-p3 w-[65ch] max-sm:w-full max-sm:px-10 mx-auto text-center mt-2"
            as="p"
            multiline
          />
        ) : page === "kontakt" ? (
          <EditableTextKontakt
            initialValue={description}
            fieldName="bannerDescription"
            isEditMode={isEditMode}
            className="opacity-75 font-p3 w-[65ch] max-sm:w-full max-sm:px-10 mx-auto text-center mt-2"
            as="p"
            multiline
          />
        ) : page === "wurf" && categorySlug ? (
          <EditableTextWurfCategory
            initialValue={description}
            fieldName="description"
            categorySlug={categorySlug}
            isEditMode={isEditMode}
            className="opacity-75 font-p3 w-[65ch] max-sm:w-full max-sm:px-10 mx-auto text-center mt-2"
            as="p"
            multiline
            placeholder="Beschreibung der Wurf-Kategorie..."
          />
        ) : (
          <EditableTextBanner
            initialValue={description}
            fieldName="description"
            isEditMode={isEditMode}
            page={page}
            className="opacity-75 font-p3 w-[65ch] max-sm:w-full max-sm:px-10 mx-auto text-center mt-2"
            as="p"
            multiline
          />
        ))}
    </div>
  );
}

export default Banner;
