"use client";

import RichTextEditor from "@/components/editor/RichTextEditor";
import { IconArrowLeft, IconPhotoPlus, IconX } from "@tabler/icons-react";
import Link from "next/link";
import React, { useRef, useState } from "react";

import { useRouter } from "nextjs-toploader/app";
import PublishDate from "@/components/news/PublishDate";

function Page() {
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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
    if (!content.trim() || !title.trim()) {
      return false;
    } else {
      return true;
    }
  };

  const handleSubmit = async (status: "draft" | "published") => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/news/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          coverImage: coverImage || "",
          publishDate: publishDate || undefined,
          status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // alert(data.message);
        router.push("/vomsauterhof/content/news");
      } else {
        alert(data.message || "Failed to create news");
      }
    } catch (error) {
      console.error("Error submitting news:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-[65ch] max-[720px]:w-full mx-auto">
      <div className=" flex flex-col self-center w-full gap-4">
        <div className="flex items-center pb-2 border-b border-b-black/10">
          <Link
            href={"/vomsauterhof/content/news"}
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
            onClick={handleClick}
          >
            {coverImage ? (
              <>
                <img
                  src={coverImage}
                  alt="Cover"
                  className="h-fit rounded-[0.8rem]"
                />
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
                    fontSize: "calc(var(--p4) * 0.7)",
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
            placeholder="Titel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex items-center py-4 border-b border-b-black/10 gap-2">
          <PublishDate
            publishDate={publishDate}
            setPublishDate={setPublishDate}
          />
        </div>

        <RichTextEditor value={content} onChange={setContent} />
      </div>
    </div>
  );
}

export default Page;
