"use client";

import { useEffect } from "react";

function BeauceronWrapper({ content }: { content: string }) {
  useEffect(() => {
    const imageWrappers = document.querySelectorAll(".image-wrapper");

    if (!imageWrappers) return;

    imageWrappers.forEach((wrapper) => {
      const caption = wrapper.querySelector("input");
      if (!caption) return;
      const value = caption.value.trim();
      const span = document.createElement("span");
      span.textContent = value;
      wrapper.removeChild(caption);
      wrapper.appendChild(span);
    });
  }, []);

  useEffect(() => {
    const videoWrappers = document.querySelectorAll(".video-wrapper");

    if (!videoWrappers) return;

    videoWrappers.forEach((wrapper) => {
      const caption = wrapper.querySelector("input");
      if (!caption) return;
      const value = caption.value.trim();
      const span = document.createElement("span");
      span.textContent = value;
      wrapper.removeChild(caption);
      wrapper.appendChild(span);
    });
  }, []);

  return (
    <div className="font-p3" dangerouslySetInnerHTML={{ __html: content }} />
  );
}

export default BeauceronWrapper;
