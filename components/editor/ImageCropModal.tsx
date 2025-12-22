"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop";

interface ImageCropModalProps {
  imageSrc: string;
  onCropComplete: (croppedImage: string, caption?: string) => Promise<void>;
  onCancel: () => void;
  initialCaption?: string;
}

export default function ImageCropModal({
  imageSrc,
  onCropComplete,
  onCancel,
  initialCaption = "",
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState(initialCaption);

  const onCropChange = (location: { x: number; y: number }) => {
    setCrop(location);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropAreaChange = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;

    try {
      setIsUploading(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      await onCropComplete(croppedImage, caption);
    } catch (e) {
      console.error("Error cropping image:", e);
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content"
        style={{ maxWidth: "600px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="font-semibold">Bild zuschneiden</span>
          <button className="modal-close" onClick={onCancel}>
            &times;
          </button>
        </div>
        <div className="modal-body" style={{ padding: 0 }}>
          <div
            className="cropper-container"
            style={{
              position: "relative",
              width: "100%",
              background: "#333",
            }}
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropAreaChange}
            />
          </div>
          <div style={{ padding: "16px" }}>
            <div className="form-group">
              <label htmlFor="imageCaption">Bildunterschrift (optional):</label>
              <input
                id="imageCaption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                type="text"
                placeholder="Bildunterschrift hinzufügen..."
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
            Abbrechen
          </button>
          <button
            onClick={createCroppedImage}
            type="button"
            disabled={isUploading}
            style={{
              transition: "ease 0.5s",
              fontSize: "calc(var(--p4) * 0.9)",
            }}
            className="py-1 px-2 bg-[#F38D3B] hover:brightness-95 font-medium border border-[var(--c-border)] rounded-[0.35rem] cursor-pointer text-white ml-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Hochladen..." : "Zuschneiden"}
          </button>
        </div>
      </div>
    </div>
  );
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
    }, "image/jpeg");
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
}
