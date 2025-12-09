"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import "@/css/RichTextEditor.css";
import ImageCropModal from "./ImageCropModal";

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  style?: React.CSSProperties;
  disableImageButton?: boolean;
  disableVideoButton?: boolean;
  placeholder?: string;
}

export default function RichTextEditor({
  value = "",
  onChange,
  style,
  disableImageButton,
  disableVideoButton,
  placeholder,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const linkUrlInputRef = useRef<HTMLInputElement>(null);

  const [internalHtml, setInternalHtml] = useState(value);
  const [selectedImageWrapper, setSelectedImageWrapper] =
    useState<HTMLElement | null>(null);
  const [selectedVideoWrapper, setSelectedVideoWrapper] =
    useState<HTMLElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // History state
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoRef = useRef(false);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  // Resize state
  const resizingRef = useRef(false);
  const resizeDataRef = useRef<any>(null);

  // Drag state
  const draggedImageRef = useRef<HTMLElement | null>(null);
  const dropIndicatorRef = useRef<HTMLElement | null>(null);

  const maxHistorySize = 50;

  // Sync with external value
  useEffect(() => {
    const newVal = value || "";
    if (newVal !== internalHtml && editorRef.current) {
      setInternalHtml(newVal);
      editorRef.current.innerHTML = newVal;
      attachImageControlsToAll();
    }
  }, [value]);

  // Notify parent of changes
  useEffect(() => {
    onChange?.(internalHtml);
  }, [internalHtml, onChange]);

  // Auto-focus modal input
  useEffect(() => {
    if (showLinkModal && linkUrlInputRef.current) {
      linkUrlInputRef.current.focus();
    }
  }, [showLinkModal]);

  const charCount = internalHtml.replace(/<[^>]*>/g, "").length;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const saveToHistory = useCallback(
    (content: string) => {
      if (isUndoRedoRef.current) return;

      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }

      historyTimeoutRef.current = setTimeout(() => {
        const currentContent = content || editorRef.current?.innerHTML || "";

        setHistory((prev) => {
          if (prev.length > 0 && prev[historyIndex] === currentContent) {
            return prev;
          }

          let newHistory =
            historyIndex < prev.length - 1
              ? prev.slice(0, historyIndex + 1)
              : [...prev];

          newHistory.push(currentContent);

          if (newHistory.length > maxHistorySize) {
            newHistory.shift();
            setHistoryIndex((i) => i);
          } else {
            setHistoryIndex(newHistory.length - 1);
          }

          return newHistory;
        });
      }, 500);
    },
    [historyIndex]
  );

  const onInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setInternalHtml(html);
      saveToHistory(html);
    }
  };

  const onBlur = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setInternalHtml(html);
      saveToHistory(html);
    }
  };

  const format = (command: string, value: string | null = null) => {
    if (command === "insertUnorderedList" || command === "insertOrderedList") {
      document.execCommand(command, false);
    } else {
      document.execCommand(command, false, value || undefined);
    }
    if (editorRef.current) {
      setInternalHtml(editorRef.current.innerHTML);
      saveToHistory(editorRef.current.innerHTML);
    }
    restoreFocus();
  };

  const formatHeading = (tag: string) => {
    if (tag === "p") document.execCommand("formatBlock", false, "p");
    else if (tag === "h1") document.execCommand("formatBlock", false, "h1");
    else if (tag === "h2") document.execCommand("formatBlock", false, "h2");
    if (editorRef.current) {
      setInternalHtml(editorRef.current.innerHTML);
      saveToHistory(editorRef.current.innerHTML);
    }
    restoreFocus();
  };

  const queryState = (command: string) => {
    try {
      return document.queryCommandState(command);
    } catch (e) {
      return false;
    }
  };

  const getCurrentEditorRange = (): Range | null => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        return range.cloneRange();
      }
    }

    if (editorRef.current) {
      const range = document.createRange();
      if (editorRef.current.lastChild) {
        if (editorRef.current.lastChild.nodeType === Node.TEXT_NODE) {
          range.setStart(
            editorRef.current.lastChild,
            (editorRef.current.lastChild as Text).textContent?.length || 0
          );
        } else {
          range.setStartAfter(editorRef.current.lastChild);
        }
      } else {
        range.setStart(editorRef.current, 0);
      }
      range.collapse(true);
      return range;
    }

    return null;
  };

  const createLink = () => {
    editorRef.current?.focus();
    const selection = window.getSelection();
    savedSelectionRef.current = getCurrentEditorRange();

    if (savedSelectionRef.current && !savedSelectionRef.current.collapsed) {
      setLinkText(savedSelectionRef.current.toString());
    } else {
      setLinkText("");
    }

    setLinkUrl("");
    setShowLinkModal(true);
  };

  const insertLink = () => {
    if (!linkUrl.trim()) return;

    let url = linkUrl.trim();
    if (!url.match(/^https?:\/\//)) {
      url = "https://" + url;
    }

    editorRef.current?.focus();

    const linkElement = document.createElement("a");
    linkElement.href = url;
    linkElement.target = "_blank";
    linkElement.textContent = linkText.trim() || url;

    if (savedSelectionRef.current) {
      try {
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(savedSelectionRef.current);

        savedSelectionRef.current.deleteContents();
        savedSelectionRef.current.insertNode(linkElement);

        const newRange = document.createRange();
        newRange.setStartAfter(linkElement);
        newRange.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(newRange);
      } catch (error) {
        console.error("Error inserting link:", error);
        editorRef.current?.appendChild(linkElement);
      }
    } else {
      editorRef.current?.appendChild(linkElement);
    }

    if (editorRef.current) {
      setInternalHtml(editorRef.current.innerHTML);
      saveToHistory(editorRef.current.innerHTML);
    }
    closeLinkModal();
  };

  const closeLinkModal = () => {
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
    savedSelectionRef.current = null;
    setTimeout(() => editorRef.current?.focus(), 0);
  };

  const undo = () => {
    if (!canUndo || !editorRef.current) return;

    isUndoRedoRef.current = true;
    const newIndex = historyIndex - 1;
    const content = history[newIndex];
    editorRef.current.innerHTML = content;
    setInternalHtml(content);
    setHistoryIndex(newIndex);

    setTimeout(() => {
      attachImageControlsToAll();
      isUndoRedoRef.current = false;
    }, 0);
  };

  const redo = () => {
    if (!canRedo || !editorRef.current) return;

    isUndoRedoRef.current = true;
    const newIndex = historyIndex + 1;
    const content = history[newIndex];
    editorRef.current.innerHTML = content;
    setInternalHtml(content);
    setHistoryIndex(newIndex);

    setTimeout(() => {
      attachImageControlsToAll();
      isUndoRedoRef.current = false;
    }, 0);
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerVideoUpload = () => {
    videoInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please pick an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImageToCrop(dataUrl);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropComplete = async (croppedImage: string) => {
    // Upload the cropped image
    try {
      const blob = await fetch(croppedImage).then((r) => r.blob());
      const formData = new FormData();
      formData.append("file", blob, "cropped-image.jpg");

      const response = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { url } = await response.json();
      insertImageAtCursor(url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    }

    if (editorRef.current) {
      setInternalHtml(editorRef.current.innerHTML);
    }
    setShowCropModal(false);
    setImageToCrop("");
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setImageToCrop("");
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      alert("Please pick a video file");
      return;
    }

    // Check file size (e.g., max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      alert("Video file is too large. Maximum size is 100MB.");
      return;
    }

    try {
      setUploadProgress(0);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { url } = await response.json();
      insertVideoAtCursor(url);
      setUploadProgress(null);
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Failed to upload video. Please try again.");
      setUploadProgress(null);
    }

    if (editorRef.current) {
      setInternalHtml(editorRef.current.innerHTML);
    }
    e.target.value = "";
  };

  const insertVideoAtCursor = (videoUrl: string) => {
    const sel = window.getSelection();
    const wrapper = createVideoWrapper(videoUrl);

    if (!sel || sel.rangeCount === 0) {
      editorRef.current?.focus();
      editorRef.current?.appendChild(wrapper);
      if (editorRef.current) {
        setInternalHtml(editorRef.current.innerHTML);
        saveToHistory(editorRef.current.innerHTML);
      }
      return;
    }

    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(wrapper);

    range.setStartAfter(wrapper);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    editorRef.current?.focus();

    if (editorRef.current) {
      setInternalHtml(editorRef.current.innerHTML);
      saveToHistory(editorRef.current.innerHTML);
    }
  };

  const createVideoWrapper = (videoUrl: string): HTMLElement => {
    const wrapper = document.createElement("div");
    wrapper.className = "video-wrapper";
    wrapper.contentEditable = "false";

    const video = document.createElement("video");
    video.src = videoUrl;
    video.controls = true;
    video.preload = "metadata";
    video.style.width = "100%";
    video.style.height = "auto";
    video.style.display = "block";

    const captionInput = document.createElement("input");
    captionInput.type = "text";
    captionInput.className = "video-caption";
    captionInput.placeholder = "Videounterschrift hinzufügen (optional)";

    captionInput.addEventListener("input", (e) => {
      e.stopPropagation();
      const target = e.target as HTMLInputElement;
      target.setAttribute("value", target.value);
      if (editorRef.current) {
        setInternalHtml(editorRef.current.innerHTML);
      }
    });

    captionInput.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    captionInput.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });

    const syncWrapperHeight = () => {
      wrapper.style.height =
        video.offsetHeight + captionInput.offsetHeight + "px";
    };

    video.addEventListener("loadedmetadata", syncWrapperHeight);
    setTimeout(syncWrapperHeight, 100);

    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(syncWrapperHeight);
      resizeObserver.observe(video);
      resizeObserver.observe(captionInput);
      (wrapper as any)._resizeObserver = resizeObserver;
    }

    const handles = [
      { class: "nw", cursor: "nw-resize" },
      { class: "n", cursor: "n-resize" },
      { class: "ne", cursor: "ne-resize" },
      { class: "e", cursor: "e-resize" },
      { class: "se", cursor: "se-resize" },
      { class: "s", cursor: "s-resize" },
      { class: "sw", cursor: "sw-resize" },
      { class: "w", cursor: "w-resize" },
    ];

    handles.forEach(({ class: className, cursor }) => {
      const handle = document.createElement("div");
      handle.className = `resize-handle resize-${className}`;
      handle.style.cursor = cursor;
      handle.dataset.direction = className;
      wrapper.appendChild(handle);

      handle.addEventListener("mousedown", (e) =>
        startVideoResize(e, wrapper, className)
      );
    });

    const removeBtn = document.createElement("button");
    removeBtn.className = "video-remove-btn";
    removeBtn.innerHTML = "×";
    removeBtn.title = "Remove video";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      wrapper.remove();
      if (editorRef.current) {
        setInternalHtml(editorRef.current.innerHTML);
      }
    });

    wrapper.appendChild(video);
    wrapper.appendChild(captionInput);
    wrapper.appendChild(removeBtn);

    wrapper.addEventListener("click", (e) => {
      e.stopPropagation();
      selectVideoWrapper(wrapper);
    });

    wrapper.draggable = true;
    wrapper.addEventListener("dragstart", (e) => startVideoDrag(e, wrapper));
    wrapper.addEventListener("dragend", (e) => endVideoDrag(e, wrapper));

    return wrapper;
  };

  const selectVideoWrapper = (wrapper: HTMLElement) => {
    deselectVideoWrapper();
    deselectImageWrapper();
    setSelectedVideoWrapper(wrapper);
    wrapper.classList.add("selected");
  };

  const deselectVideoWrapper = () => {
    if (selectedVideoWrapper) {
      selectedVideoWrapper.classList.remove("selected");
    }
    setSelectedVideoWrapper(null);
  };

  const startVideoDrag = (e: DragEvent, wrapper: HTMLElement) => {
    if ((e.target as HTMLElement).classList.contains("video-caption")) {
      e.preventDefault();
      return;
    }

    draggedImageRef.current = wrapper;
    e.dataTransfer!.effectAllowed = "move";
    e.dataTransfer!.setData("text/html", wrapper.outerHTML);
    wrapper.classList.add("dragging");
    createDropIndicator();
  };

  const endVideoDrag = (e: DragEvent, wrapper: HTMLElement) => {
    wrapper.classList.remove("dragging");
    removeDropIndicator();
    draggedImageRef.current = null;
  };

  const startVideoResize = (
    e: MouseEvent,
    wrapper: HTMLElement,
    direction: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    resizingRef.current = true;
    const rect = wrapper.getBoundingClientRect();

    resizeDataRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      wrapper,
      direction,
      aspect: rect.width / rect.height,
      maintainAspect: e.shiftKey,
    };

    document.addEventListener("mousemove", onVideoResize);
    document.addEventListener("mouseup", stopVideoResize);
    document.addEventListener("keydown", onResizeKeyDown);
    document.addEventListener("keyup", onResizeKeyUp);

    document.body.style.cursor = (e.target as HTMLElement).style.cursor;
    document.body.style.userSelect = "none";
  };

  const onVideoResize = (e: MouseEvent) => {
    if (!resizingRef.current || !resizeDataRef.current || !editorRef.current)
      return;
    e.preventDefault();

    const {
      startX,
      startY,
      startWidth,
      startHeight,
      wrapper,
      direction,
      aspect,
    } = resizeDataRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newWidth = startWidth;

    switch (direction) {
      case "nw":
      case "w":
      case "sw":
        newWidth = Math.max(50, startWidth - dx);
        break;
      case "ne":
      case "e":
      case "se":
        newWidth = Math.max(50, startWidth + dx);
        break;
      case "n":
      case "s":
        const heightChange = direction === "n" ? -dy : dy;
        const newHeight = Math.max(50, startHeight + heightChange);
        newWidth = newHeight * aspect;
        break;
    }

    const editorRect = editorRef.current.getBoundingClientRect();
    const maxWidth = editorRect.width - 32;
    if (newWidth > maxWidth) {
      newWidth = maxWidth;
    }

    wrapper.style.width = Math.round(newWidth) + "px";
  };

  const stopVideoResize = () => {
    if (!resizingRef.current) return;
    resizingRef.current = false;

    document.removeEventListener("mousemove", onVideoResize);
    document.removeEventListener("mouseup", stopVideoResize);
    document.removeEventListener("keydown", onResizeKeyDown);
    document.removeEventListener("keyup", onResizeKeyUp);

    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    resizeDataRef.current = null;
    if (editorRef.current) {
      setInternalHtml(editorRef.current.innerHTML);
    }
  };

  const insertImageAtCursor = (dataUrl: string) => {
    const sel = window.getSelection();
    const wrapper = createImageWrapper(dataUrl);

    if (!sel || sel.rangeCount === 0) {
      editorRef.current?.focus();
      editorRef.current?.appendChild(wrapper);
      if (editorRef.current) {
        setInternalHtml(editorRef.current.innerHTML);
        saveToHistory(editorRef.current.innerHTML);
      }
      return;
    }

    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(wrapper);

    range.setStartAfter(wrapper);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    editorRef.current?.focus();

    if (editorRef.current) {
      setInternalHtml(editorRef.current.innerHTML);
      saveToHistory(editorRef.current.innerHTML);
    }
  };

  const createImageWrapper = (dataUrl: string): HTMLElement => {
    const wrapper = document.createElement("div");
    wrapper.className = "image-wrapper";
    wrapper.contentEditable = "false";

    const img = document.createElement("img");
    img.src = dataUrl;
    img.alt = "inserted image";
    img.draggable = false;
    img.style.width = "100%";
    img.style.height = "auto";
    img.style.display = "block";

    const captionInput = document.createElement("input");
    captionInput.type = "text";
    captionInput.className = "image-caption";
    captionInput.placeholder = "Bildunterschrift hinzufügen (optional)";

    captionInput.addEventListener("input", (e) => {
      e.stopPropagation();
      const target = e.target as HTMLInputElement;
      target.setAttribute("value", target.value);
      if (editorRef.current) {
        setInternalHtml(editorRef.current.innerHTML);
      }
    });

    captionInput.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    captionInput.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });

    const syncWrapperHeight = () => {
      if (img.complete && img.naturalHeight > 0) {
        wrapper.style.height =
          img.offsetHeight + captionInput.offsetHeight + "px";
      }
    };

    img.addEventListener("load", syncWrapperHeight);
    if (img.complete) {
      setTimeout(syncWrapperHeight, 0);
    }

    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(syncWrapperHeight);
      resizeObserver.observe(img);
      resizeObserver.observe(captionInput);
      (wrapper as any)._resizeObserver = resizeObserver;
    }

    const handles = [
      { class: "nw", cursor: "nw-resize" },
      { class: "n", cursor: "n-resize" },
      { class: "ne", cursor: "ne-resize" },
      { class: "e", cursor: "e-resize" },
      { class: "se", cursor: "se-resize" },
      { class: "s", cursor: "s-resize" },
      { class: "sw", cursor: "sw-resize" },
      { class: "w", cursor: "w-resize" },
    ];

    handles.forEach(({ class: className, cursor }) => {
      const handle = document.createElement("div");
      handle.className = `resize-handle resize-${className}`;
      handle.style.cursor = cursor;
      handle.dataset.direction = className;
      wrapper.appendChild(handle);

      handle.addEventListener("mousedown", (e) =>
        startImageResize(e, wrapper, className)
      );
    });

    const removeBtn = document.createElement("button");
    removeBtn.className = "image-remove-btn";
    removeBtn.innerHTML = "×";
    removeBtn.title = "Remove image";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      wrapper.remove();
      if (editorRef.current) {
        setInternalHtml(editorRef.current.innerHTML);
      }
    });

    wrapper.appendChild(img);
    wrapper.appendChild(captionInput);
    wrapper.appendChild(removeBtn);

    wrapper.addEventListener("click", (e) => {
      e.stopPropagation();
      selectImageWrapper(wrapper);
    });

    wrapper.draggable = true;
    wrapper.addEventListener("dragstart", (e) => startImageDrag(e, wrapper));
    wrapper.addEventListener("dragend", (e) => endImageDrag(e, wrapper));

    return wrapper;
  };

  const attachImageControlsToAll = () => {
    if (!editorRef.current) return;
    const imgs = editorRef.current.querySelectorAll("img.rte-image");
    imgs.forEach((img) => {
      if (!img.parentElement?.classList.contains("image-wrapper")) {
        const wrapper = createImageWrapper((img as HTMLImageElement).src);
        img.parentNode?.replaceChild(wrapper, img);
      }
    });

    // Ensure existing image wrappers have captions and event listeners
    const wrappers = editorRef.current.querySelectorAll(".image-wrapper");
    wrappers.forEach((wrapper) => {
      const htmlWrapper = wrapper as HTMLElement;

      // Re-attach click listener for selection
      const existingClickListener = (htmlWrapper as any)._clickListener;
      if (!existingClickListener) {
        const clickHandler = (e: Event) => {
          e.stopPropagation();
          selectImageWrapper(htmlWrapper);
        };
        htmlWrapper.addEventListener("click", clickHandler);
        (htmlWrapper as any)._clickListener = clickHandler;
      }

      // Re-attach drag listeners
      const existingDragStartListener = (htmlWrapper as any)._dragStartListener;
      if (!existingDragStartListener) {
        htmlWrapper.draggable = true;
        const dragStartHandler = (e: DragEvent) =>
          startImageDrag(e, htmlWrapper);
        const dragEndHandler = (e: DragEvent) => endImageDrag(e, htmlWrapper);
        htmlWrapper.addEventListener("dragstart", dragStartHandler);
        htmlWrapper.addEventListener("dragend", dragEndHandler);
        (htmlWrapper as any)._dragStartListener = dragStartHandler;
        (htmlWrapper as any)._dragEndListener = dragEndHandler;
      }

      // Re-attach resize handle listeners
      const handles = htmlWrapper.querySelectorAll(".resize-handle");
      handles.forEach((handle) => {
        const htmlHandle = handle as HTMLElement;
        const existingMouseDownListener = (htmlHandle as any)
          ._mouseDownListener;
        if (!existingMouseDownListener) {
          const direction = htmlHandle.dataset.direction || "";
          const mouseDownHandler = (e: MouseEvent) =>
            startImageResize(e, htmlWrapper, direction);
          htmlHandle.addEventListener("mousedown", mouseDownHandler);
          (htmlHandle as any)._mouseDownListener = mouseDownHandler;
        }
      });

      // Re-attach remove button listener
      const removeBtn = htmlWrapper.querySelector(
        ".image-remove-btn"
      ) as HTMLElement;
      if (removeBtn) {
        const existingRemoveListener = (removeBtn as any)._clickListener;
        if (!existingRemoveListener) {
          const removeHandler = (e: Event) => {
            e.stopPropagation();
            htmlWrapper.remove();
            if (editorRef.current) {
              setInternalHtml(editorRef.current.innerHTML);
            }
          };
          removeBtn.addEventListener("click", removeHandler);
          (removeBtn as any)._clickListener = removeHandler;
        }
      }

      const existingCaption = wrapper.querySelector(
        ".image-caption"
      ) as HTMLInputElement;
      if (!existingCaption) {
        const captionInput = document.createElement("input");
        captionInput.type = "text";
        captionInput.className = "image-caption";
        captionInput.placeholder = "Bildunterschrift hinzufügen (optional)";

        captionInput.addEventListener("input", (e) => {
          e.stopPropagation();
          const target = e.target as HTMLInputElement;
          target.setAttribute("value", target.value);
          if (editorRef.current) {
            setInternalHtml(editorRef.current.innerHTML);
          }
        });

        captionInput.addEventListener("click", (e) => {
          e.stopPropagation();
        });

        captionInput.addEventListener("mousedown", (e) => {
          e.stopPropagation();
        });

        const removeBtn = wrapper.querySelector(".image-remove-btn");
        if (removeBtn) {
          wrapper.insertBefore(captionInput, removeBtn);
        } else {
          wrapper.appendChild(captionInput);
        }
      } else {
        // Restore the value from the HTML attribute to the input's value property
        const savedValue = existingCaption.getAttribute("value");
        if (savedValue) {
          existingCaption.value = savedValue;
        }

        // Re-attach caption event listeners
        const existingInputListener = (existingCaption as any)._inputListener;
        if (!existingInputListener) {
          const inputHandler = (e: Event) => {
            e.stopPropagation();
            const target = e.target as HTMLInputElement;
            target.setAttribute("value", target.value);
            if (editorRef.current) {
              setInternalHtml(editorRef.current.innerHTML);
            }
          };
          const clickHandler = (e: Event) => {
            e.stopPropagation();
          };
          const mouseDownHandler = (e: Event) => {
            e.stopPropagation();
          };
          existingCaption.addEventListener("input", inputHandler);
          existingCaption.addEventListener("click", clickHandler);
          existingCaption.addEventListener("mousedown", mouseDownHandler);
          (existingCaption as any)._inputListener = inputHandler;
        }
      }
    });

    // Ensure existing video wrappers have captions and event listeners
    const videoWrappers = editorRef.current.querySelectorAll(".video-wrapper");
    videoWrappers.forEach((wrapper) => {
      const htmlWrapper = wrapper as HTMLElement;

      // Re-attach click listener for selection
      const existingClickListener = (htmlWrapper as any)._clickListener;
      if (!existingClickListener) {
        const clickHandler = (e: Event) => {
          e.stopPropagation();
          selectVideoWrapper(htmlWrapper);
        };
        htmlWrapper.addEventListener("click", clickHandler);
        (htmlWrapper as any)._clickListener = clickHandler;
      }

      // Re-attach drag listeners
      const existingDragStartListener = (htmlWrapper as any)._dragStartListener;
      if (!existingDragStartListener) {
        htmlWrapper.draggable = true;
        const dragStartHandler = (e: DragEvent) =>
          startVideoDrag(e, htmlWrapper);
        const dragEndHandler = (e: DragEvent) => endVideoDrag(e, htmlWrapper);
        htmlWrapper.addEventListener("dragstart", dragStartHandler);
        htmlWrapper.addEventListener("dragend", dragEndHandler);
        (htmlWrapper as any)._dragStartListener = dragStartHandler;
        (htmlWrapper as any)._dragEndListener = dragEndHandler;
      }

      // Re-attach resize handle listeners
      const handles = htmlWrapper.querySelectorAll(".resize-handle");
      handles.forEach((handle) => {
        const htmlHandle = handle as HTMLElement;
        const existingMouseDownListener = (htmlHandle as any)
          ._mouseDownListener;
        if (!existingMouseDownListener) {
          const direction = htmlHandle.dataset.direction || "";
          const mouseDownHandler = (e: MouseEvent) =>
            startVideoResize(e, htmlWrapper, direction);
          htmlHandle.addEventListener("mousedown", mouseDownHandler);
          (htmlHandle as any)._mouseDownListener = mouseDownHandler;
        }
      });

      // Re-attach remove button listener
      const removeBtn = htmlWrapper.querySelector(
        ".video-remove-btn"
      ) as HTMLElement;
      if (removeBtn) {
        const existingRemoveListener = (removeBtn as any)._clickListener;
        if (!existingRemoveListener) {
          const removeHandler = (e: Event) => {
            e.stopPropagation();
            htmlWrapper.remove();
            if (editorRef.current) {
              setInternalHtml(editorRef.current.innerHTML);
            }
          };
          removeBtn.addEventListener("click", removeHandler);
          (removeBtn as any)._clickListener = removeHandler;
        }
      }

      const existingCaption = wrapper.querySelector(
        ".video-caption"
      ) as HTMLInputElement;
      if (!existingCaption) {
        const captionInput = document.createElement("input");
        captionInput.type = "text";
        captionInput.className = "video-caption";
        captionInput.placeholder = "Videounterschrift hinzufügen (optional)";

        captionInput.addEventListener("input", (e) => {
          e.stopPropagation();
          const target = e.target as HTMLInputElement;
          target.setAttribute("value", target.value);
          if (editorRef.current) {
            setInternalHtml(editorRef.current.innerHTML);
          }
        });

        captionInput.addEventListener("click", (e) => {
          e.stopPropagation();
        });

        captionInput.addEventListener("mousedown", (e) => {
          e.stopPropagation();
        });

        const removeBtn = wrapper.querySelector(".video-remove-btn");
        if (removeBtn) {
          wrapper.insertBefore(captionInput, removeBtn);
        } else {
          wrapper.appendChild(captionInput);
        }
      } else {
        // Restore the value from the HTML attribute to the input's value property
        const savedValue = existingCaption.getAttribute("value");
        if (savedValue) {
          existingCaption.value = savedValue;
        }

        // Re-attach caption event listeners
        const existingInputListener = (existingCaption as any)._inputListener;
        if (!existingInputListener) {
          const inputHandler = (e: Event) => {
            e.stopPropagation();
            const target = e.target as HTMLInputElement;
            target.setAttribute("value", target.value);
            if (editorRef.current) {
              setInternalHtml(editorRef.current.innerHTML);
            }
          };
          const clickHandler = (e: Event) => {
            e.stopPropagation();
          };
          const mouseDownHandler = (e: Event) => {
            e.stopPropagation();
          };
          existingCaption.addEventListener("input", inputHandler);
          existingCaption.addEventListener("click", clickHandler);
          existingCaption.addEventListener("mousedown", mouseDownHandler);
          (existingCaption as any)._inputListener = inputHandler;
        }
      }
    });
  };

  const onEditorClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".image-wrapper")) return;
    if ((e.target as HTMLElement).closest(".video-wrapper")) return;
    deselectImageWrapper();
    deselectVideoWrapper();
  };

  const selectImageWrapper = (wrapper: HTMLElement) => {
    deselectImageWrapper();
    setSelectedImageWrapper(wrapper);
    wrapper.classList.add("selected");
  };

  const deselectImageWrapper = () => {
    if (selectedImageWrapper) {
      selectedImageWrapper.classList.remove("selected");
    }
    setSelectedImageWrapper(null);
  };

  const startImageDrag = (e: DragEvent, wrapper: HTMLElement) => {
    // Don't start drag if clicking on caption input
    if ((e.target as HTMLElement).classList.contains("image-caption")) {
      e.preventDefault();
      return;
    }

    draggedImageRef.current = wrapper;
    e.dataTransfer!.effectAllowed = "move";
    e.dataTransfer!.setData("text/html", wrapper.outerHTML);
    wrapper.classList.add("dragging");
    createDropIndicator();
  };

  const endImageDrag = (e: DragEvent, wrapper: HTMLElement) => {
    wrapper.classList.remove("dragging");
    removeDropIndicator();
    draggedImageRef.current = null;
  };

  const createDropIndicator = () => {
    const indicator = document.createElement("div");
    indicator.className = "drop-indicator";
    indicator.style.height = "3px";
    indicator.style.backgroundColor = "#4a90e2";
    indicator.style.margin = "5px 0";
    indicator.style.borderRadius = "2px";
    indicator.style.opacity = "0";
    indicator.style.transition = "opacity 0.2s ease";
    dropIndicatorRef.current = indicator;
  };

  const removeDropIndicator = () => {
    if (dropIndicatorRef.current?.parentNode) {
      dropIndicatorRef.current.parentNode.removeChild(dropIndicatorRef.current);
    }
    dropIndicatorRef.current = null;
  };

  const showDropIndicator = (
    element: HTMLElement,
    position: "before" | "after"
  ) => {
    if (!dropIndicatorRef.current) return;
    removeDropIndicator();

    if (position === "before") {
      element.parentNode?.insertBefore(dropIndicatorRef.current, element);
    } else {
      element.parentNode?.insertBefore(
        dropIndicatorRef.current,
        element.nextSibling
      );
    }

    dropIndicatorRef.current.style.opacity = "1";
  };

  const handleImageDragOver = (e: DragEvent) => {
    if (
      !draggedImageRef.current ||
      !dropIndicatorRef.current ||
      !editorRef.current
    )
      return;

    const y = e.clientY;
    const editorRect = editorRef.current.getBoundingClientRect();
    const relativeY = y - editorRect.top + editorRef.current.scrollTop;

    const children = Array.from(editorRef.current.children);
    let insertBefore: HTMLElement | null = null;
    let insertAfter: HTMLElement | null = null;

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      if (
        child === draggedImageRef.current ||
        child === dropIndicatorRef.current
      )
        continue;

      const childRect = child.getBoundingClientRect();
      const childY =
        childRect.top - editorRect.top + editorRef.current.scrollTop;
      const childMidY = childY + childRect.height / 2;

      if (relativeY < childMidY) {
        insertBefore = child;
        break;
      } else {
        insertAfter = child;
      }
    }

    if (insertBefore) {
      showDropIndicator(insertBefore, "before");
    } else if (insertAfter) {
      showDropIndicator(insertAfter, "after");
    } else {
      if (
        editorRef.current.lastElementChild &&
        editorRef.current.lastElementChild !== draggedImageRef.current
      ) {
        showDropIndicator(
          editorRef.current.lastElementChild as HTMLElement,
          "after"
        );
      }
    }
  };

  const handleImageDrop = (e: DragEvent) => {
    if (!draggedImageRef.current || !dropIndicatorRef.current) return;

    const indicatorParent = dropIndicatorRef.current.parentNode;
    const indicatorNextSibling = dropIndicatorRef.current.nextSibling;

    removeDropIndicator();

    if (indicatorNextSibling) {
      indicatorParent?.insertBefore(
        draggedImageRef.current,
        indicatorNextSibling
      );
    } else {
      indicatorParent?.appendChild(draggedImageRef.current);
    }

    if (editorRef.current) {
      setInternalHtml(editorRef.current.innerHTML);
      saveToHistory(editorRef.current.innerHTML);
    }

    draggedImageRef.current.classList.remove("dragging");
    draggedImageRef.current = null;
  };

  const startImageResize = (
    e: MouseEvent,
    wrapper: HTMLElement,
    direction: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    resizingRef.current = true;
    const rect = wrapper.getBoundingClientRect();

    resizeDataRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      wrapper,
      direction,
      aspect: rect.width / rect.height,
      maintainAspect: e.shiftKey,
    };

    document.addEventListener("mousemove", onImageResize);
    document.addEventListener("mouseup", stopImageResize);
    document.addEventListener("keydown", onResizeKeyDown);
    document.addEventListener("keyup", onResizeKeyUp);

    document.body.style.cursor = (e.target as HTMLElement).style.cursor;
    document.body.style.userSelect = "none";
  };

  const onImageResize = (e: MouseEvent) => {
    if (!resizingRef.current || !resizeDataRef.current || !editorRef.current)
      return;
    e.preventDefault();

    const {
      startX,
      startY,
      startWidth,
      startHeight,
      wrapper,
      direction,
      aspect,
    } = resizeDataRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newWidth = startWidth;

    switch (direction) {
      case "nw":
      case "w":
      case "sw":
        newWidth = Math.max(50, startWidth - dx);
        break;
      case "ne":
      case "e":
      case "se":
        newWidth = Math.max(50, startWidth + dx);
        break;
      case "n":
      case "s":
        const heightChange = direction === "n" ? -dy : dy;
        const newHeight = Math.max(50, startHeight + heightChange);
        newWidth = newHeight * aspect;
        break;
    }

    const editorRect = editorRef.current.getBoundingClientRect();
    const maxWidth = editorRect.width - 32;
    if (newWidth > maxWidth) {
      newWidth = maxWidth;
    }

    wrapper.style.width = Math.round(newWidth) + "px";
  };

  const stopImageResize = () => {
    if (!resizingRef.current) return;
    resizingRef.current = false;

    document.removeEventListener("mousemove", onImageResize);
    document.removeEventListener("mouseup", stopImageResize);
    document.removeEventListener("keydown", onResizeKeyDown);
    document.removeEventListener("keyup", onResizeKeyUp);

    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    resizeDataRef.current = null;
    if (editorRef.current) {
      setInternalHtml(editorRef.current.innerHTML);
    }
  };

  const onResizeKeyDown = (ev: KeyboardEvent) => {
    if (ev.key === "Shift" && resizeDataRef.current) {
      resizeDataRef.current.maintainAspect = true;
    }
  };

  const onResizeKeyUp = (ev: KeyboardEvent) => {
    if (ev.key === "Shift" && resizeDataRef.current) {
      resizeDataRef.current.maintainAspect = false;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Control" || e.key === "Meta") {
      setIsCtrlPressed(true);
    }

    if (
      (e.ctrlKey || e.metaKey) &&
      e.key.toLowerCase() === "z" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      undo();
      return;
    }
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key.toLowerCase() === "y" ||
        (e.key.toLowerCase() === "z" && e.shiftKey))
    ) {
      e.preventDefault();
      redo();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      format("bold");
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
      e.preventDefault();
      format("italic");
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") {
      e.preventDefault();
      format("underline");
    }

    if ((e.key === "Delete" || e.key === "Backspace") && selectedImageWrapper) {
      e.preventDefault();
      selectedImageWrapper.remove();
      if (editorRef.current) {
        setInternalHtml(editorRef.current.innerHTML);
        saveToHistory(editorRef.current.innerHTML);
      }
      deselectImageWrapper();
    }

    if ((e.key === "Delete" || e.key === "Backspace") && selectedVideoWrapper) {
      e.preventDefault();
      selectedVideoWrapper.remove();
      if (editorRef.current) {
        setInternalHtml(editorRef.current.innerHTML);
        saveToHistory(editorRef.current.innerHTML);
      }
      deselectVideoWrapper();
    }
  };

  const onKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Control" || e.key === "Meta") {
      setIsCtrlPressed(false);
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const html = text
      .split("\n")
      .map((line) => (line ? escapeHtml(line) : "<br>"))
      .join("<br>");
    insertHtmlAtCursor(html);
    if (editorRef.current) {
      setInternalHtml(editorRef.current.innerHTML);
    }
  };

  const escapeHtml = (s: string) => {
    return s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  };

  const insertHtmlAtCursor = (html: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      editorRef.current?.insertAdjacentHTML("beforeend", html);
      if (editorRef.current) {
        setInternalHtml(editorRef.current.innerHTML);
      }
      return;
    }
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const frag = document.createRange().createContextualFragment(html);
    range.insertNode(frag);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    if (editorRef.current) {
      setInternalHtml(editorRef.current.innerHTML);
    }
  };

  const restoreFocus = () => {
    setTimeout(() => editorRef.current?.focus(), 0);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === "A" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      window.open((e.target as HTMLAnchorElement).href, "_blank");
    }
  };

  const handleLinkHover = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "A" && isCtrlPressed) {
      target.title = "Click to visit link";
      target.style.cursor = "pointer";
    } else if (target.tagName === "A") {
      target.title = "Ctrl+Click to visit link";
      target.style.cursor = "text";
    }
  };

  const handleLinkLeave = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "A") {
      target.title = "";
      target.style.cursor = "";
    }
  };

  const placeCaretAtEnd = (el: HTMLElement) => {
    el.focus();
    if (
      typeof window.getSelection !== "undefined" &&
      typeof document.createRange !== "undefined"
    ) {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();

    if (draggedImageRef.current) {
      e.dataTransfer.dropEffect = "move";
      handleImageDragOver(e.nativeEvent);
    } else {
      e.dataTransfer.dropEffect = "copy";
    }

    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!editorRef.current) return;

    const rect = editorRef.current.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      setIsDragging(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    removeDropIndicator();

    const dt = e.dataTransfer;
    const files = dt?.files;
    const x = e.clientX;
    const y = e.clientY;

    if (draggedImageRef.current) {
      handleImageDrop(e.nativeEvent);
      return;
    }

    if (files && files.length) {
      handleDroppedFiles(files, x, y);
    } else {
      const uri = dt.getData("text/uri-list") || dt.getData("text/plain");
      if (uri && isImageUrl(uri)) {
        insertImageAtPoint(uri, x, y);
        if (editorRef.current) {
          setInternalHtml(editorRef.current.innerHTML);
        }
      } else {
        const html = dt.getData("text/html");
        if (html) insertHtmlAtPoint(html, x, y);
      }
    }
  };

  const isImageUrl = (url: string) => {
    return /\.(jpeg|jpg|gif|png|webp|svg|bmp)(\?|$)/i.test(url);
  };

  const handleDroppedFiles = async (
    fileList: FileList,
    x: number,
    y: number
  ) => {
    const files = Array.from(fileList);
    const imageFiles = files.filter(
      (f) => f.type && f.type.startsWith("image/")
    );
    const videoFiles = files.filter(
      (f) => f.type && f.type.startsWith("video/")
    );

    // Handle video files
    if (videoFiles.length > 0) {
      const videoFile = videoFiles[0];

      // Check file size
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (videoFile.size > maxSize) {
        alert("Video file is too large. Maximum size is 100MB.");
        return;
      }

      try {
        setUploadProgress(0);
        const formData = new FormData();
        formData.append("file", videoFile);

        const response = await fetch("/api/images/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const { url } = await response.json();
        insertVideoAtPoint(url, x, y);
        setUploadProgress(null);
      } catch (error) {
        console.error("Error uploading video:", error);
        alert("Failed to upload video. Please try again.");
        setUploadProgress(null);
      }

      if (editorRef.current) {
        setInternalHtml(editorRef.current.innerHTML);
      }
      return;
    }

    // Handle image files
    if (!imageFiles.length) return;

    // For drag and drop, we'll crop the first image only
    const file = imageFiles[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImageToCrop(dataUrl);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const insertImageAtPoint = (dataUrlOrUrl: string, x: number, y: number) => {
    const range = getRangeFromPoint(x, y);
    const wrapper = createImageWrapper(dataUrlOrUrl);

    if (!range) {
      editorRef.current?.appendChild(wrapper);
      if (editorRef.current) {
        setInternalHtml(editorRef.current.innerHTML);
      }
      return;
    }

    range.deleteContents();
    range.insertNode(wrapper);

    range.setStartAfter(wrapper);
    range.collapse(true);

    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    editorRef.current?.focus();
    if (editorRef.current) {
      setInternalHtml(editorRef.current.innerHTML);
    }
  };

  const insertVideoAtPoint = (videoUrl: string, x: number, y: number) => {
    const range = getRangeFromPoint(x, y);
    const wrapper = createVideoWrapper(videoUrl);

    if (!range) {
      editorRef.current?.appendChild(wrapper);
      if (editorRef.current) {
        setInternalHtml(editorRef.current.innerHTML);
      }
      return;
    }

    range.deleteContents();
    range.insertNode(wrapper);

    range.setStartAfter(wrapper);
    range.collapse(true);

    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    editorRef.current?.focus();
    if (editorRef.current) {
      setInternalHtml(editorRef.current.innerHTML);
    }
  };

  const insertHtmlAtPoint = (html: string, x: number, y: number) => {
    const range = getRangeFromPoint(x, y);
    if (!range) {
      editorRef.current?.insertAdjacentHTML("beforeend", html);
      if (editorRef.current) {
        setInternalHtml(editorRef.current.innerHTML);
      }
      return;
    }
    range.deleteContents();
    const frag = document.createRange().createContextualFragment(html);
    range.insertNode(frag);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    editorRef.current?.focus();
    if (editorRef.current) {
      setInternalHtml(editorRef.current.innerHTML);
    }
  };

  const getRangeFromPoint = (x: number, y: number): Range | null => {
    let range: Range | null = null;
    if (document.caretRangeFromPoint) {
      try {
        range = document.caretRangeFromPoint(x, y);
      } catch (e) {
        range = null;
      }
    } else if ((document as any).caretPositionFromPoint) {
      try {
        const pos = (document as any).caretPositionFromPoint(x, y);
        range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.collapse(true);
      } catch (e) {
        range = null;
      }
    }

    if (!range && editorRef.current) {
      const el = document.elementFromPoint(x, y);
      try {
        range = document.createRange();
        if (el && el.nodeType === 3) {
          range.setStart(el, 0);
        } else if (el) {
          range.selectNodeContents(el);
          range.collapse(false);
        } else {
          range.selectNodeContents(editorRef.current);
          range.collapse(false);
        }
      } catch (e) {
        range = null;
      }
    }
    return range;
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = internalHtml || "";
      attachImageControlsToAll();
      editorRef.current.setAttribute("tabindex", "0");
      setHistory([internalHtml || ""]);
      setHistoryIndex(0);
    }

    return () => {
      if (editorRef.current) {
        const wrappers = editorRef.current.querySelectorAll(
          ".image-wrapper, .video-wrapper"
        );
        wrappers.forEach((wrapper) => {
          if ((wrapper as any)._resizeObserver) {
            (wrapper as any)._resizeObserver.disconnect();
          }
        });
      }
    };
  }, []);

  return (
    <div className="rte">
      <div className="toolbar flex max-[500px]:grid max-[500px]:grid-flow-col max-[500px]:overflow-x-auto">
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="undo-btn"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ height: "1.35rem", width: "1.35rem" }}
          >
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="redo-btn"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ height: "1.35rem", width: "1.35rem" }}
          >
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
          </svg>
        </button>

        <div className="divider"></div>

        <button
          onClick={() => format("bold")}
          className={queryState("bold") ? "active" : ""}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => format("italic")}
          className={queryState("italic") ? "active" : ""}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => format("underline")}
          className={queryState("underline") ? "active" : ""}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>

        <div className="divider"></div>

        <button onClick={() => formatHeading("p")} title="Paragraph">
          P
        </button>
        <button onClick={() => formatHeading("h1")} title="Heading 1">
          H1
        </button>
        <button onClick={() => formatHeading("h2")} title="Heading 2">
          H2
        </button>

        <div className="divider"></div>

        <button
          onClick={() => format("insertUnorderedList")}
          title="Bullet list"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ height: "1.35rem", width: "1.35rem" }}
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M9 6l11 0" />
            <path d="M9 12l11 0" />
            <path d="M9 18l11 0" />
            <path d="M5 6l0 .01" />
            <path d="M5 12l0 .01" />
            <path d="M5 18l0 .01" />
          </svg>
        </button>
        <button
          onClick={() => format("insertOrderedList")}
          title="Numbered list"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ height: "1.35rem", width: "1.35rem" }}
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M11 6h9" />
            <path d="M11 12h9" />
            <path d="M12 18h8" />
            <path d="M4 16a2 2 0 1 1 4 0c0 .591 -.5 1 -1 1.5l-3 2.5h4" />
            <path d="M6 10v-6l-2 2" />
          </svg>
        </button>

        <div className="divider"></div>

        <button onClick={createLink} title="Insert link">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ height: "1.35rem", width: "1.35rem" }}
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M9 15l6 -6" />
            <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" />
            <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" />
          </svg>
        </button>

        {!disableImageButton && (
          <>
            <div className="divider"></div>

            <button onClick={triggerImageUpload} title="Insert image">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ height: "1.35rem", width: "1.35rem" }}
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M15 8h.01" />
                <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z" />
                <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" />
                <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3" />
              </svg>
            </button>
          </>
        )}

        {!disableVideoButton && (
          <>
            <button onClick={triggerVideoUpload} title="Insert video">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ height: "1.35rem", width: "1.35rem" }}
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z" />
                <path d="M3 6m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" />
              </svg>
            </button>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          style={{ display: "none" }}
        />
      </div>

      <div style={style} className="relative">
        <div
          ref={editorRef}
          className={`editor relative z-[1] ${isDragging ? "drag-over" : ""} ${
            isCtrlPressed ? "ctrl-pressed" : ""
          }`}
          contentEditable="true"
          spellCheck="true"
          onInput={onInput}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onPaste={onPaste}
          onClick={handleLinkClick}
          onClickCapture={onEditorClick}
          onMouseOver={handleLinkHover}
          onMouseLeave={handleLinkLeave}
          onBlur={onBlur}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        ></div>
        {internalHtml.replace(/<[^>]*>/g, "").trim().length < 1 && (
          <span className="opacity-50 pointer-events-none absolute top-0 left-0">
            {placeholder ? placeholder : "Inhalt"}
          </span>
        )}
        {uploadProgress !== null && (
          <div className="upload-progress">
            <span>Uploading video...</span>
            <div className="upload-progress-bar">
              <div
                className="upload-progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {showLinkModal && (
        <div className="modal-overlay" onClick={closeLinkModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="font-semibold">Link einfügen</span>
              <button className="modal-close" onClick={closeLinkModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="linkUrl">URL:</label>
                <input
                  id="linkUrl"
                  ref={linkUrlInputRef}
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  type="url"
                  placeholder="https://beispiel.ch"
                  onKeyUp={(e) => e.key === "Enter" && insertLink()}
                />
              </div>
              <div className="form-group">
                <label htmlFor="linkText">Anzeigetext (optional):</label>
                <input
                  id="linkText"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  type="text"
                  placeholder="Linktext"
                  onKeyUp={(e) => e.key === "Enter" && insertLink()}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={closeLinkModal}
                type="button"
                style={{
                  transition: "ease 0.5s",
                  fontSize: "calc(var(--p4) * 0.9)",
                }}
                className={`py-2 flex items-center px-2 bg-white hover:brightness-95 font-medium border border-[var(--c-border)]  rounded-[0.35rem] cursor-pointer`}
              >
                Stornieren
              </button>

              <button
                onClick={insertLink}
                disabled={!linkUrl.trim()}
                type="button"
                style={{
                  transition: "ease 0.5s",
                  fontSize: "calc(var(--p4) * 0.9)",
                }}
                className={`py-1 px-2 bg-[#F38D3B] hover:brightness-95 font-medium border border-[var(--c-border)]  rounded-[0.35rem] cursor-pointer text-white ml-3`}
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {showCropModal && imageToCrop && (
        <ImageCropModal
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
