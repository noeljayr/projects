"use client";

import RichTextEditor from "@/components/editor/RichTextEditor";
import { IconArrowLeft, IconPhotoPlus, IconX } from "@tabler/icons-react";
import Link from "next/link";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "nextjs-toploader/app";
import { uploadImageToDatabase } from "@/lib/uploadImage";

function Page() {
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [name, setName] = useState("");
  const [information, setInformation] = useState("");
  const [category, setCategory] = useState("");
  const [documents, setDocuments] = useState({
    stammbaum: "",
    workingDog: "",
    arbeit: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageUpload = async (file: File) => {
    if (file && file.type.startsWith("image/")) {
      try {
        setIsUploadingImage(true);
        const imageUrl = await uploadImageToDatabase(file);
        setCoverImage(imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        alert(
          "Fehler beim Hochladen des Bildes. Bitte versuchen Sie es erneut."
        );
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validate = () => {
    if (!information.trim() || !name.trim()) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (status: "draft" | "published") => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/wurf/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          information,
          image: coverImage || "",
          category: category.trim(),
          documents,
          status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/vomsauterhof/content/wurf");
      } else {
        alert(data.message || "Failed to create wurf post");
      }
    } catch (error) {
      console.error("Error submitting wurf post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-[65ch] max-[720px]:w-full mx-auto">
      <div className=" flex flex-col self-center w-full gap-4">
        <div className="flex items-center pb-2 border-b border-b-black/10">
          <Link
            href={"/vomsauterhof/content/wurf"}
            type="button"
            style={{
              transition: "ease 0.5s",
              fontSize: "calc(var(--p4) * 0.9)",
            }}
            className={`py-2 flex items-center px-2 bg-[#FBF2EA] hover:brightness-95 font-medium border border-[var(--c-border)]  rounded-[0.35rem] cursor-pointer`}
          >
            <IconArrowLeft className="h-4 w-4" />
            Zurück
          </Link>

          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            disabled={isSubmitting || !validate() || !coverImage}
            style={{
              transition: "ease 0.5s",
              fontSize: "calc(var(--p4) * 0.9)",
            }}
            className="draft ml-auto py-1 px-2 hover:brightness-95 font-medium rounded-[0.35rem] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            Als Entwurf speichern
          </button>

          <button
            type="button"
            onClick={() => handleSubmit("published")}
            disabled={isSubmitting || !validate() || !coverImage}
            style={{
              transition: "ease 0.5s",
              fontSize: "calc(var(--p4) * 0.9)",
            }}
            className={`py-1 px-2 bg-[#F38D3B] hover:brightness-95 font-medium border border-[var(--c-border)]  rounded-[0.35rem] cursor-pointer text-white ml-3 disabled:opacity-50 disabled:pointer-events-none`}
          >
            Speichern
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div
            className={`relative flex flex-col items-center justify-center border ${
              isDragging ? "border-[#F38D3B] bg-[#F38D3B]/5" : "border-black/10"
            } border-dashed rounded-[0.5rem] w-full ${
              coverImage ? "h-fit border-0" : "h-[20rem]"
            } cursor-pointer transition-all hover:border-[#F38D3B]/50 overflow-hidden`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={!isUploadingImage ? handleClick : undefined}
          >
            {isUploadingImage ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F38D3B]"></div>
                <span
                  style={{
                    transition: "ease 0.5s",
                    fontSize: "calc(var(--p4) * 0.9)",
                  }}
                  className="font-medium opacity-50 mt-2"
                >
                  Hochladen...
                </span>
              </>
            ) : coverImage ? (
              <>
                <img src={coverImage} alt="Cover" className="h-fit" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-[#FBF2EA]/90 hover:bg-[#FBF2EA] rounded-full shadow-md transition-all z-10"
                >
                  <IconX className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <IconPhotoPlus className="h-5 w-5 opacity-55" />
                <span
                  style={{
                    transition: "ease 0.5s",
                    fontSize: "calc(var(--p4) * 0.9)",
                  }}
                  className="font-medium opacity-50"
                >
                  {isDragging ? "Coverbild:" : "Klicken/Ziehen zum Hochladen"}
                </span>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <input
            className="font-h3 font-bold placeholder:opacity-50 outline-0 border-0 bg-transparent"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <RichTextEditor
          value={information}
          placeholder="Information"
          onChange={setInformation}
          disableImageButton={true}
          style={{
            minHeight: "10rem",
          }}
        />

        <div className="flex flex-col gap-2 py-4 border-b border-b-black/10">
          <label className="font-medium text-sm opacity-75">Kategorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-[var(--c-border)] rounded-[0.35rem] outline-none bg-[#FBF2EA]"
          >
            <option value="">Kategorie auswählen</option>
            <option value="wurf a">Wurf A</option>
            <option value="wurf b">Wurf B</option>
            <option value="wurf c">Wurf C</option>
          </select>
        </div>

        <div className="flex flex-col gap-3 py-4 border-b border-b-black/10">
          <label className="font-medium text-sm opacity-75">
            Dokumente (Links)
          </label>

          <div className="flex flex-col gap-1">
            <label className="text-sm opacity-60">Stammbaum</label>
            <input
              type="url"
              placeholder="https://..."
              value={documents.stammbaum}
              onChange={(e) =>
                setDocuments({ ...documents, stammbaum: e.target.value })
              }
              className="px-3 py-2 border border-[var(--c-border)] rounded-[0.35rem] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm opacity-60">Working-Dog</label>
            <input
              type="url"
              placeholder="https://..."
              value={documents.workingDog}
              onChange={(e) =>
                setDocuments({ ...documents, workingDog: e.target.value })
              }
              className="px-3 py-2 border border-[var(--c-border)] rounded-[0.35rem] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm opacity-60">Arbeit</label>
            <input
              type="url"
              placeholder="https://..."
              value={documents.arbeit}
              onChange={(e) =>
                setDocuments({ ...documents, arbeit: e.target.value })
              }
              className="px-3 py-2 border border-[var(--c-border)] rounded-[0.35rem] outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
