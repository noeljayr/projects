"use client";

import { IconEdit, IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";

type Props = {
  initialValue: string;
  fieldName: string;
  isEditMode: boolean;
  className?: string;
  placeholder?: string;
  onEditingChange?: (isEditing: boolean) => void;
};

export default function EditableTextNavbar({
  initialValue,
  fieldName,
  isEditMode,
  className = "",
  placeholder,
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
      const response = await fetch("/api/navbar", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [fieldName]: tempValue.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update navbar");
      }

      const result = await response.json();

      if (result.success) {
        setValue(tempValue);
        setIsEditing(false);
        setIsHovered(false);
        onEditingChange?.(false);
      } else {
        throw new Error(result.message || "Failed to update navbar");
      }
    } catch (error) {
      console.error("Error updating navbar:", error);
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
    return <span className={className}>{value || placeholder}</span>;
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => !isEditing && setIsHovered(true)}
      onMouseLeave={() => !isEditing && setIsHovered(false)}
      onClick={(e) => {
        // Prevent navigation when clicking on the editable component in edit mode
        if (isEditMode) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {isEditing ? (
        <div className="relative inline-block">
          <input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className={`${className} border-1 border-[#58483B] rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#58483B] bg-[#FBF2EA] text-black min-w-[80px]`}
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
          {/* Absolute positioned buttons */}
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
