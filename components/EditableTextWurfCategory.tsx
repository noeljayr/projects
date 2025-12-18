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
  variant?: "navbar" | "banner";
  onEditingChange?: (isEditing: boolean) => void;
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
  variant = "banner",
  onEditingChange,
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
    onEditingChange?.(false);
  };

  if (!isEditMode) {
    return <Component className={className}>{value || placeholder}</Component>;
  }

  // Navbar variant - inline compact style
  if (variant === "navbar") {
    return (
      <div
        className="relative inline-block"
        onMouseEnter={() => !isEditing && setIsHovered(true)}
        onMouseLeave={() => !isEditing && setIsHovered(false)}
        onClick={(e) => {
          if (isEditMode) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {isEditing ? (
          <div className="relative w-[9rem] inline-block">
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className={`${className} border-1 border-[#58483B] rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#58483B] bg-[#FBF2EA] text-black w-full`}
              autoFocus
              placeholder={placeholder}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />
            <div className="absolute -bottom-10 left-0 flex gap-1.5 z-50">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSave();
                }}
                disabled={isSaving}
                className="flex items-center justify-center bg-[#58483B] text-white p-1.5 rounded-md cursor-pointer hover:opacity-95 transition-opacity disabled:opacity-50 shadow-lg"
                title="Speichern"
              >
                <IconCheck className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCancel();
                }}
                disabled={isSaving}
                className="flex items-center justify-center bg-gray-300 text-black p-1.5 rounded-md cursor-pointer hover:bg-gray-400 transition-colors disabled:opacity-50 shadow-lg"
                title="Stornieren"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <span className={className}>{value || placeholder}</span>
            {isHovered && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsEditing(true);
                  onEditingChange?.(true);
                }}
                className="absolute -top-1.5 -right-1.5 bg-[#58483B] text-white p-1 rounded-full hover:bg-[#6d5a4a] cursor-pointer transition-colors shadow-lg z-10"
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

  // Banner variant - block style with larger inputs
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
