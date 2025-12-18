"use client";

import { IconEdit, IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";

type Props = {
  initialValue: string;
  fieldName: "name" | "description";
  categorySlug: string;
  isEditMode: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "a";
  href?: string;
};

export default function EditableTextFooterWurfCategory({
  initialValue,
  fieldName,
  categorySlug,
  isEditMode,
  className = "",
  as: Component = "a",
  href,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [tempValue, setTempValue] = useState(initialValue);
  const [isHovered, setIsHovered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/wurf-categories/${categorySlug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [fieldName]: tempValue.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      const result = await response.json();

      if (result.success) {
        setValue(tempValue);
        setIsEditing(false);
        setIsHovered(false);
        // Note: No redirect needed since slug remains static when name changes
      } else {
        throw new Error(result.message || "Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Änderungen konnten nicht gespeichert werden");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
    setIsHovered(false);
  };

  if (!isEditMode) {
    if (Component === "a" && href) {
      return (
        <a href={href} className={className}>
          {value}
        </a>
      );
    }
    return <Component className={className}>{value}</Component>;
  }

  return (
    <div
      className="relative group inline-block w-fit"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <div className="space-y-2 min-w-[200px]">
          <input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="w-full border-2 border-[#58483B] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#58483B] bg-[#FBF2EA] text-black text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1 bg-[#58483B] text-white px-2 py-1 rounded text-xs cursor-pointer hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              <IconCheck className="h-3 w-3" />
              {isSaving ? "Sparen..." : "Speichern"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-1 bg-gray-300 text-black px-2 py-1 rounded text-xs cursor-pointer hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              <IconX className="h-3 w-3" />
              Stornieren
            </button>
          </div>
        </div>
      ) : (
        <>
          {Component === "a" && href ? (
            <a href={href} className={className}>
              {value}
            </a>
          ) : (
            <Component className={className}>{value}</Component>
          )}
          {isHovered && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute -top-2 -right-2 bg-[#58483B] text-white p-1 rounded-full hover:bg-[#6d5a4a] cursor-pointer transition-colors shadow-lg z-10"
              aria-label={`Edit ${fieldName}`}
            >
              <IconEdit size={12} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
