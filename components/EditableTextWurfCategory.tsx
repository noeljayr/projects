"use client";

import { IconEdit, IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";

type Props = {
  initialValue: string;
  fieldName: "name" | "description";
  categorySlug: string;
  isEditMode: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  multiline?: boolean;
  placeholder?: string;
};

export default function EditableTextWurfCategory({
  initialValue,
  fieldName,
  categorySlug,
  isEditMode,
  className = "",
  as: Component = "p",
  multiline = false,
  placeholder,
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

        // If the slug changed (name update), redirect to new URL
        if (fieldName === "name" && result.category.slug !== categorySlug) {
          window.location.href = `/vomsauterhof/wurf/${result.category.slug}${window.location.search}`;
          return;
        }
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
    return <Component className={className}>{value || placeholder}</Component>;
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <div className="space-y-1">
          {multiline ? (
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className={`w-full ${className} border-2 border-[#58483B] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#58483B] bg-[#FBF2EA] text-black`}
              rows={3}
              autoFocus
              placeholder={placeholder}
            />
          ) : (
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className={`w-full ${className} border-2 border-[#58483B] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#58483B] bg-[#FBF2EA] text-black`}
              autoFocus
              placeholder={placeholder}
            />
          )}
          <div className="flex gap-2">
            <button
              style={{
                fontSize: "calc(var(--p4) * 0.9)",
              }}
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-[#58483B] text-white px-3 py-1.5 rounded-[0.35rem] cursor-pointer hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              <IconCheck className="h-4 w-4" />
              {isSaving ? "Sparen..." : "Speichern"}
            </button>
            <button
              style={{
                fontSize: "calc(var(--p4) * 0.9)",
              }}
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-2 bg-gray-300 text-black px-3 py-1.5 rounded-[0.35rem] cursor-pointer hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              <IconX className="h-4 w-4" />
              Stornieren
            </button>
          </div>
        </div>
      ) : (
        <>
          <Component className={className}>{value || placeholder}</Component>
          {isHovered && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute -top-2 -right-2 bg-[#58483B] text-white p-1.5 rounded-full hover:bg-[#6d5a4a] cursor-pointer transition-colors shadow-lg z-10"
              aria-label={`Edit ${fieldName}`}
            >
              <IconEdit size={16} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
