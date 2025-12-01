"use client";

import { IconEdit, IconCheck, IconX, IconUpload } from "@tabler/icons-react";
import { useState, useRef } from "react";
import Image from "next/image";

type Props = {
  initialSrc: string;
  fieldName: string;
  isEditMode: boolean;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
};

export default function EditableImage({
  initialSrc,
  fieldName,
  isEditMode,
  alt,
  fill = false,
  width,
  height,
  className = "",
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [imageSrc, setImageSrc] = useState(initialSrc);
  const [tempImageSrc, setTempImageSrc] = useState(initialSrc);
  const [isHovered, setIsHovered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/images/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fieldName,
          imageData: tempImageSrc,
        }),
      });

      if (response.ok) {
        setImageSrc(tempImageSrc);
        setIsEditing(false);
      } else {
        alert("Failed to save image");
      }
    } catch (error) {
      console.error("Error saving image:", error);
      alert("Failed to save image");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTempImageSrc(imageSrc);
    setIsEditing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isEditMode) {
    return fill ? (
      <Image src={imageSrc} alt={alt} fill className={className} />
    ) : (
      <Image
        src={imageSrc}
        alt={alt}
        width={width || 500}
        height={height || 500}
        className={className}
      />
    );
  }

  return (
    <div
      className="relative group h-full w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <div className="h-full w-full flex flex-col">
          <div className="relative h-full w-full mb-2">
            {fill ? (
              <Image
                src={tempImageSrc}
                alt={alt}
                fill
                className={`${className} opacity-70`}
              />
            ) : (
              <Image
                src={tempImageSrc}
                alt={alt}
                width={width || 500}
                height={height || 500}
                className={`${className} opacity-70`}
              />
            )}
            <div className="absolute inset-0 z-[2] flex items-center justify-center bg-black/30 rounded-lg">
              <label
                htmlFor={`file-${fieldName}`}
                className="flex flex-col items-center gap-2 cursor-pointer bg-white/90 px-4 py-3 rounded-lg hover:bg-white transition-colors"
              >
                <IconUpload className="h-6 w-6 text-[#58483B]" />
                <span className="text-sm font-medium text-[#58483B]">
                  Wählen Sie Bild
                </span>
              </label>
              <input
                id={`file-${fieldName}`}
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
          <div className="flex gap-2 absolute bottom-2 left-2 z-20">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-[#58483B] text-white px-3 py-1.5 rounded-md cursor-pointer hover:opacity-95 transition-opacity disabled:opacity-50 text-sm"
            >
              <IconCheck className="h-4 w-4" />
              {isSaving ? "Sparen..." : "Speichern"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-2 bg-gray-300 text-black px-3 py-1.5 rounded-md cursor-pointer hover:bg-gray-400 transition-colors disabled:opacity-50 text-sm"
            >
              <IconX className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {fill ? (
            <Image src={imageSrc} alt={alt} fill className={className} />
          ) : (
            <Image
              src={imageSrc}
              alt={alt}
              width={width || 500}
              height={height || 500}
              className={className}
            />
          )}
          {isHovered && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute -top-2 -right-2 bg-[#58483B] text-white p-2 rounded-full hover:bg-[#6d5a4a] cursor-pointer transition-colors shadow-lg z-10"
              aria-label={`Edit ${alt}`}
            >
              <IconEdit size={18} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
