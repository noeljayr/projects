"use client";

import RichTextEditor from "@/components/editor/RichTextEditor";
import {
  IconArrowLeft,
  IconPhotoPlus,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

type WelpenDog = {
  name: string;
  image: string;
};

function Page() {
  const [information, setInformation] = useState("");
  const [wurfName, setWurfName] = useState("");
  const [wurfCategory, setWurfCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dogs, setDogs] = useState<WelpenDog[]>([{ name: "", image: "" }]);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const params = useParams();
  const wurfId = params.id as string;

  useEffect(() => {
    if (wurfId) {
      fetchWurf();
    }
  }, [wurfId]);

  const fetchWurf = async () => {
    try {
      // Fetch wurf name and category
      const wurfResponse = await fetch(`/api/wurf/get?id=${wurfId}`);
      const wurfData = await wurfResponse.json();

      if (!wurfData.success) {
        alert(wurfData.message || "Failed to fetch wurf");
        router.push("/vomsauterhof/content/wurf");
        return;
      }

      setWurfName(wurfData.wurf.name);
      setWurfCategory(wurfData.wurf.category || "");

      // Fetch welpen data
      const welpenResponse = await fetch(`/api/welpen/get?wurfId=${wurfId}`);
      const welpenData = await welpenResponse.json();

      if (welpenData.success) {
        const welpenInfo = welpenData.welpen;
        if (
          wurfData.wurf.category === "wurf b" ||
          wurfData.wurf.category === "wurf c"
        ) {
          // Timeline-style data
          setDate(welpenInfo.date || "");
          setTitle(welpenInfo.title || "");
          setDescription(welpenInfo.description || "");
          setDogs(
            welpenInfo.dogs && welpenInfo.dogs.length > 0
              ? welpenInfo.dogs
              : [{ name: "", image: "" }]
          );
        } else {
          // Free-form data
          setInformation(welpenInfo.information || "");
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("An error occurred while fetching data");
      router.push("/vomsauterhof/content/wurf");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (file: File, dogIndex: number) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newDogs = [...dogs];
        newDogs[dogIndex].image = e.target?.result as string;
        setDogs(newDogs);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    dogIndex: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, dogIndex);
    }
  };

  const handleDragOver = (e: React.DragEvent, dogIndex: number) => {
    e.preventDefault();
    setIsDragging(dogIndex);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(null);
  };

  const handleDrop = (e: React.DragEvent, dogIndex: number) => {
    e.preventDefault();
    setIsDragging(null);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file, dogIndex);
    }
  };

  const addDog = () => {
    setDogs([...dogs, { name: "", image: "" }]);
  };

  const removeDog = (index: number) => {
    if (dogs.length > 1) {
      setDogs(dogs.filter((_, i) => i !== index));
    }
  };

  const updateDogName = (index: number, name: string) => {
    const newDogs = [...dogs];
    newDogs[index].name = name;
    setDogs(newDogs);
  };

  const isTimelineStyle =
    wurfCategory === "wurf b" || wurfCategory === "wurf c";

  const validate = () => {
    if (isTimelineStyle) {
      const validDogs = dogs.filter((dog) => dog.image.trim() !== "");
      return date.trim() !== "" && title.trim() !== "" && validDogs.length > 0;
    } else {
      return information.trim() !== "";
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const body = isTimelineStyle
        ? {
            wurfId,
            date,
            title,
            description,
            dogs: dogs.filter((dog) => dog.image.trim() !== ""),
          }
        : {
            wurfId,
            information,
          };

      const response = await fetch("/api/welpen/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/vomsauterhof/content/wurf");
      } else {
        alert(data.message || "Failed to update welpen");
      }
    } catch (error) {
      console.error("Error updating welpen:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-[65ch] max-[720px]:w-full mx-auto">
        <div className="text-center py-8"></div>
      </div>
    );
  }

  return (
    <div className="w-[65ch] max-[720px]:w-full mx-auto">
      <div className=" flex flex-col self-center w-full gap-4">
        <div className="flex items-center pb-2 border-b border-b-black/10">
          <Link
            href={"/vomsauterhof/content/wurf"}
            style={{
              transition: "ease 0.5s",
              fontSize: "calc(var(--p4) * 0.9)",
            }}
            className="py-1 flex items-center px-2 bg-white hover:brightness-95 font-medium border border-[var(--c-border)] rounded-[0.35rem] cursor-pointer"
          >
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Link>
          <h5 className="ml-4 font-semibold truncate">Welpen: {wurfName}</h5>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !validate()}
            style={{
              transition: "ease 0.5s",
              fontSize: "calc(var(--p4) * 0.9)",
            }}
            className={`py-1 px-2 bg-[#F38D3B] hover:brightness-95 font-medium border border-[var(--c-border)] rounded-[0.35rem] cursor-pointer text-white ml-auto disabled:opacity-50 disabled:pointer-events-none`}
          >
            Speichern
          </button>
        </div>

        {isTimelineStyle ? (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-[35%_1fr] gap-2">
              <div className="flex-1">
                <label className="text-sm opacity-75 mb-1 block">Datum</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border font-p3 border-[var(--c-border)] rounded-[0.35rem] outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm opacity-75 mb-1 block">Titel</label>
                <input
                  type="text"
                  placeholder="z.B. Welpen Update"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border font-p3 border-[var(--c-border)] rounded-[0.35rem] outline-none"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="text-sm opacity-75 mb-1 block">
                Beschreibung (optional)
              </label>
              <textarea
                placeholder="Zusätzliche Informationen..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border font-p3 border-[var(--c-border)] rounded-[0.35rem] outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm opacity-75 font-medium">Welpen</label>
              <button
                onClick={addDog}
                style={{
                  transition: "ease 0.5s",
                  fontSize: "calc(var(--p4) * 0.85)",
                }}
                className="py-1 px-2 bg-white hover:brightness-95 font-medium border border-[var(--c-border)] rounded-[0.35rem] cursor-pointer flex items-center gap-1"
              >
                <IconPlus className="h-3 w-3" />
                Welpe hinzufügen
              </button>
            </div>

            {dogs.map((dog, index) => (
              <div
                key={index}
                className="bg-white/45 border border-[var(--c-border)] rounded-[0.35rem] p-3 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-75">
                    Welpe {index + 1}
                  </span>
                  {dogs.length > 1 && (
                    <button
                      onClick={() => removeDog(index)}
                      className="p-1 hover:bg-red-50 rounded-[0.25rem] transition-colors"
                    >
                      <IconX className="h-4 w-4 text-red-600" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Welpenname (optional)"
                  value={dog.name}
                  onChange={(e) => updateDogName(index, e.target.value)}
                  className="w-full font-p3 px-3 py-2 border border-[var(--c-border)] rounded-[0.35rem] outline-none"
                />

                <div
                  className={`relative flex flex-col items-center justify-center border ${
                    isDragging === index
                      ? "border-[#F38D3B] bg-[#F38D3B]/5"
                      : "border-black/10"
                  } border-dashed rounded-[0.5rem] ${
                    dog.image ? "h-fit" : "h-32"
                  } cursor-pointer transition-all hover:border-[#F38D3B]/50 overflow-hidden`}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={() => fileInputRefs.current[index]?.click()}
                >
                  {dog.image ? (
                    <>
                      <img
                        src={dog.image}
                        alt="Preview"
                        className="max-h-48 object-contain"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newDogs = [...dogs];
                          newDogs[index].image = "";
                          setDogs(newDogs);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-md transition-all"
                      >
                        <IconX className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <IconPhotoPlus className="h-5 w-5 opacity-55" />
                      <span className="text-sm opacity-50 mt-1">
                        Klicken oder ziehen
                      </span>
                    </>
                  )}
                </div>
                <input
                  ref={(el) => {
                    fileInputRefs.current[index] = el;
                  }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileInputChange(e, index)}
                  className="hidden"
                />
              </div>
            ))}
          </div>
        ) : (
          <RichTextEditor
            value={information}
            placeholder="Information"
            onChange={setInformation}
            disableImageButton={false}
            style={{
              minHeight: "10rem",
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Page;
