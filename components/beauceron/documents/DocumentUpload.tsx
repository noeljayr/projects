"use client";

import React, { useState, useRef, useEffect } from "react";
import pdf from "@/public/pdf.png";
import { IconFileUpload, IconTrash } from "@tabler/icons-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

type DeleteModalState = {
  isOpen: boolean;
  fileId: string;
  filename: string;
  onDeleteSuccess: () => void;
} | null;

type Props = {
  close: () => void;
  type: "stammbaum" | "arbeitsresultate" | "ausstellungsresultate" | "zucht";
  setDeleteModalState: (state: DeleteModalState) => void;
};

type FileData = {
  id: string;
  filename: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
};

function DocumentUpload({ close, type, setDeleteModalState }: Props) {
  const [loading, setLoading] = useState(false);
  const [fetchingFile, setFetchingFile] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [existingFile, setExistingFile] = useState<FileData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const beauceronId = searchParams.get("id");

  useEffect(() => {
    if (beauceronId) {
      fetchExistingFile();
    }
  }, [beauceronId, type]);

  const fetchExistingFile = async () => {
    setFetchingFile(true);
    try {
      const response = await fetch(
        `/api/beauceron/documents/get?beauceronId=${beauceronId}&type=${type}`
      );
      const data = await response.json();
      if (data.success && data.file) {
        setExistingFile(data.file);
      }
    } catch (error) {
      console.error("Error fetching file:", error);
    } finally {
      setFetchingFile(false);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Bitte wählen Sie eine PDF-Datei aus");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
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
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file || !beauceronId) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("beauceronId", beauceronId);
      formData.append("type", type);

      const response = await fetch("/api/beauceron/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setFile(null);
        await fetchExistingFile();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        alert(data.message || "Upload fehlgeschlagen");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Upload fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    if (!existingFile) return;
    setDeleteModalState({
      isOpen: true,
      fileId: existingFile.id,
      filename: existingFile.filename,
      onDeleteSuccess: () => {
        setExistingFile(null);
      },
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleViewPDF = () => {
    if (existingFile) {
      window.open(
        `/api/beauceron/documents/download?fileId=${existingFile.id}`,
        "_blank"
      );
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 px-4">
        {fetchingFile ? (
          <div className="h-[15rem] w-full rounded-[0.5rem] mb-4 border border-dashed border-[var(--c-border)] flex flex-col items-center justify-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-2"></div>
            <span
              style={{ fontSize: "calc(var(--p4) * 0.8)" }}
              className="opacity-75"
            >
              Dokument wird geladen...
            </span>
          </div>
        ) : existingFile ? (
          <div className="w-full p-2 rounded-[0.35rem] mb-4 border border-black/15">
            <div className="items-center grid grid-cols-[auto_1fr_auto] gap-1">
              <Image alt="pdf" src={pdf} className="h-6.5 w-6.5" />
              <div
                className="flex flex-col ml-2 cursor-pointer min-w-0"
                onClick={handleViewPDF}
              >
                <span className="font-p4 hover:underline truncate">
                  {existingFile.filename}
                </span>
                <span
                  style={{
                    fontSize: "calc(var(--p4) * 0.7)",
                  }}
                  className="opacity-75"
                >
                  {formatFileSize(existingFile.size)}
                </span>
              </div>
              <button
                className="cursor-pointer hover:text-red-600"
                onClick={handleDeleteClick}
                disabled={loading}
              >
                <IconTrash className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : file ? (
          <div className="w-full p-2 rounded-[0.35rem] mb-4 border border-black/15">
            <div className="items-center grid grid-cols-[auto_1fr_auto] gap-1">
              <Image alt="pdf" src={pdf} className="h-6.5 w-6.5" />
              <div className="flex flex-col ml-2 min-w-0">
                <span className="font-p3 truncate">{file.name}</span>
                <span
                  style={{
                    fontSize: "calc(var(--p4) * 0.7)",
                  }}
                  className="opacity-75"
                >
                  {formatFileSize(file.size)}
                </span>
              </div>
              <button
                className="cursor-pointer"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                <IconTrash className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`h-[15rem] w-full rounded-[0.5rem] mb-4   cursor-pointer border ${
              isDragging
                ? "border-[#F38D3B] bg-[#F38D3B]/5"
                : "border-dashed border-[var(--c-border)]"
            } flex flex-col items-center justify-center transition-all hover:border-[#F38D3B]/50`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <IconFileUpload className="h-8 w-8 opacity-85 mb-2" />
            <span
              style={{ fontSize: "calc(var(--p4) * 0.8)" }}
              className="opacity-75"
            >
              {isDragging ? "Datei hier ablegen" : "Upload document (pdf)"}
            </span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      <div className="px-4 flex w-full items-center pt-2 border-t border-t-black/10 ">
        <button
          onClick={close}
          type="button"
          style={{
            transition: "ease 0.5s",
            fontSize: "calc(var(--p4) * 0.9)",
          }}
          className={`py-1 px-2 bg-white hover:brightness-95 font-medium border border-[var(--c-border)]  rounded-[0.35rem] cursor-pointer ml-auto`}
        >
          Stornieren
        </button>

        {file && !existingFile && (
          <button
            disabled={loading}
            onClick={handleUpload}
            type="button"
            style={{
              transition: "ease 0.5s",
              fontSize: "calc(var(--p4) * 0.9)",
            }}
            className={`py-1 px-2 bg-[#F38D3B] hover:brightness-95 font-medium border border-[var(--c-border)]  rounded-[0.35rem] cursor-pointer text-white ml-3 disabled:opacity-50 disabled:pointer-events-none`}
          >
            Hochladen
          </button>
        )}
      </div>
    </>
  );
}

export default DocumentUpload;
