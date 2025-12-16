"use client";

import RichTextEditor from "@/components/editor/RichTextEditor";
import { IconArrowLeft, IconPhotoPlus, IconX } from "@tabler/icons-react";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import DoB from "@/components/beauceron/DoB";
import Height from "@/components/beauceron/Height";
import Weight from "@/components/beauceron/Weight";
import { uploadImageToDatabase } from "@/lib/uploadImage";

function Page() {
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingCoverImage, setIsUploadingCoverImage] = useState(false);
  const [isUploadingAdditionalImages, setIsUploadingAdditionalImages] =
    useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dob, setDob] = useState("");
  const [weight, setWeight] = useState<number | undefined>();
  const [height, setHeight] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageUpload = async (file: File) => {
    if (file && file.type.startsWith("image/")) {
      try {
        setIsUploadingCoverImage(true);
        const imageUrl = await uploadImageToDatabase(file);
        setCoverImage(imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        alert(
          "Fehler beim Hochladen des Bildes. Bitte versuchen Sie es erneut."
        );
      } finally {
        setIsUploadingCoverImage(false);
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
    if (!isUploadingCoverImage) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAdditionalImagesUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    setIsUploadingAdditionalImages(true);

    try {
      const uploadPromises = fileArray.map(async (file) => {
        if (file && file.type.startsWith("image/")) {
          return await uploadImageToDatabase(file);
        }
        return null;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(
        (url): url is string => url !== null
      );

      setAdditionalImages((prev) => [...prev, ...validUrls]);
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Fehler beim Hochladen der Bilder. Bitte versuchen Sie es erneut.");
    } finally {
      setIsUploadingAdditionalImages(false);
    }
  };

  const handleAdditionalImagesInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files) {
      handleAdditionalImagesUpload(files);
    }
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!description.trim() || !name.trim()) {
      return false;
    } else {
      return true;
    }
  };

  const handleSubmit = async (status: "draft" | "published") => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/beauceron/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          image: coverImage || "",
          images: additionalImages,
          dob,
          weight,
          height,
          status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/vomsauterhof/content/beauceron");
      } else {
        alert(data.message || "Failed to create beauceron post");
      }
    } catch (error) {
      console.error("Error submitting beauceron post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-[65ch] max-[720px]:w-full mx-auto">
      <div className=" flex flex-col self-center w-full gap-4">
        <div className="flex items-center pb-2 border-b border-b-black/10">
          <Link
            href={"/vomsauterhof/content/beauceron"}
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
            onClick={!isUploadingCoverImage ? handleClick : undefined}
          >
            {isUploadingCoverImage ? (
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
          value={description}
          placeholder="Information"
          onChange={setDescription}
          disableImageButton={true}
          style={{
            minHeight: "10rem",
          }}
        />

        <div className="flex items-center py-4 border-b border-b-black/10 gap-2">
          <DoB dob={dob} setDob={setDob} />
          <Weight setWeight={setWeight} weight={weight} />
          <Height height={height} setHeight={setHeight} />
        </div>

        <div className="grid grid-cols-5 gap-2">
          {additionalImages.map((img, index) => (
            <div key={index} className="relative w-full aspect-square">
              <img
                src={img}
                alt={`Additional ${index + 1}`}
                className="w-full h-full object-cover rounded-[0.5rem] border border-[var(--c-border)]"
              />
              <button
                type="button"
                onClick={() => handleRemoveAdditionalImage(index)}
                className="absolute top-1 right-1 p-1 bg-[#FBF2EA]/90 hover:bg-[#FBF2EA] rounded-full shadow-md transition-all"
              >
                <IconX className="h-3 w-3" />
              </button>
            </div>
          ))}
          <div
            onClick={() =>
              !isUploadingAdditionalImages &&
              additionalImagesInputRef.current?.click()
            }
            className={`w-full aspect-square border border-dashed border-[var(--c-border)] rounded-[0.5rem] flex items-center justify-center flex-col gap-1 ${
              isUploadingAdditionalImages
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:border-[#F38D3B]/50"
            } transition-all`}
          >
            {isUploadingAdditionalImages ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F38D3B]"></div>
                <span
                  style={{
                    fontSize: "calc(var(--p4) * 0.7)",
                  }}
                  className="text-center opacity-75 mt-1"
                >
                  Hochladen...
                </span>
              </>
            ) : (
              <>
                <IconPhotoPlus className="h-6 w-6" />
                <span
                  style={{
                    fontSize: "calc(var(--p4) * 0.7)",
                  }}
                  className="text-center opacity-75"
                >
                  Bild <br /> hinzufügen
                </span>
              </>
            )}
          </div>
          <input
            ref={additionalImagesInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleAdditionalImagesInputChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}

export default Page;
