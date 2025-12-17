"use client";

import React, { useState } from "react";

interface VideoPreviewModalProps {
  videoSrc: string;
  onComplete: (caption?: string) => Promise<void>;
  onCancel: () => void;
  initialCaption?: string;
}

export default function VideoPreviewModal({
  videoSrc,
  onComplete,
  onCancel,
  initialCaption = "",
}: VideoPreviewModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState(initialCaption);

  const handleComplete = async () => {
    try {
      setIsUploading(true);
      await onComplete(caption);
    } catch (e) {
      console.error("Error completing video upload:", e);
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content"
        style={{ maxWidth: "600px", maxHeight: "94vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="font-semibold">Video Vorschau</span>
          <button className="modal-close" onClick={onCancel}>
            &times;
          </button>
        </div>
        <div className="modal-body" style={{ padding: 0 }}>
          <div
            className="video-preview-container"
            style={{
              position: "relative",
              width: "100%",
              background: "#000",
            }}
          >
            <video
              src={videoSrc}
              controls
              preload="metadata"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "350px",
                display: "block",
              }}
            />
          </div>
          <div style={{ padding: "16px" }}>
            <div className="form-group">
              <label htmlFor="videoCaption">
                Videounterschrift (optional):
              </label>
              <input
                id="videoCaption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                type="text"
                placeholder="Videounterschrift hinzufügen..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid var(--c-border)",
                  borderRadius: "0.35rem",
                  fontSize: "calc(var(--p4) * 0.9)",
                  marginTop: "4px",
                }}
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            onClick={onCancel}
            type="button"
            disabled={isUploading}
            style={{
              transition: "ease 0.5s",
              fontSize: "calc(var(--p4) * 0.9)",
            }}
            className="py-1 flex items-center px-2 bg-[#FBF2EA] hover:brightness-95 font-medium border border-[var(--c-border)] rounded-[0.35rem] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Stornieren
          </button>
          <button
            onClick={handleComplete}
            type="button"
            disabled={isUploading}
            style={{
              transition: "ease 0.5s",
              fontSize: "calc(var(--p4) * 0.9)",
            }}
            className="py-1 px-2 bg-[#F38D3B] hover:brightness-95 font-medium border border-[var(--c-border)] rounded-[0.35rem] cursor-pointer text-white ml-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Hochladen..." : "Hinzufügen"}
          </button>
        </div>
      </div>
    </div>
  );
}
