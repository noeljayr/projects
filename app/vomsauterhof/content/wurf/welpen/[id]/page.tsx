"use client";

import RichTextEditor from "@/components/editor/RichTextEditor";
import {
  IconArrowLeft,
  IconCheck,
  IconDots,
  IconEdit,
  IconPhotoPlus,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { motionTransition } from "@/constants/motionTransition";
import { formatDate } from "@/lib/formatDate";

type WelpenDog = {
  name: string;
  image: string;
};

type WelpenEntry = {
  id: string;
  wurfId: string;
  date: string;
  title: string;
  description?: string;
  dogs: WelpenDog[];
};

function Page() {
  const [information, setInformation] = useState("");
  const [wurfName, setWurfName] = useState("");
  const [wurfCategory, setWurfCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [welpenEntries, setWelpenEntries] = useState<WelpenEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formDate, setFormDate] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDogs, setFormDogs] = useState<WelpenDog[]>([
    { name: "", image: "" },
  ]);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const params = useParams();
  const wurfId = params.id as string;

  useEffect(() => {
    if (wurfId) {
      fetchWurf();
      fetchWelpenEntries();
    }
  }, [wurfId]);

  const fetchWurf = async () => {
    try {
      const wurfResponse = await fetch(`/api/wurf/get?id=${wurfId}`);
      const wurfData = await wurfResponse.json();

      if (!wurfData.success) {
        alert(wurfData.message || "Failed to fetch wurf");
        router.push("/vomsauterhof/content/wurf");
        return;
      }

      setWurfName(wurfData.wurf.name);
      setWurfCategory(wurfData.wurf.category || "");

      // For non-timeline categories, fetch old single-entry welpen data
      if (
        wurfData.wurf.category !== "wurf b" &&
        wurfData.wurf.category !== "wurf c"
      ) {
        const welpenResponse = await fetch(`/api/welpen/get?wurfId=${wurfId}`);
        const welpenData = await welpenResponse.json();
        if (welpenData.success) {
          setInformation(welpenData.welpen.information || "");
        }
      }
    } catch (error) {
      console.error("Error fetching wurf:", error);
      alert("An error occurred while fetching data");
      router.push("/vomsauterhof/content/wurf");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWelpenEntries = async () => {
    try {
      const response = await fetch(`/api/welpen/list?wurfId=${wurfId}`);
      const data = await response.json();
      if (data.success) {
        setWelpenEntries(data.welpen);
      }
    } catch (error) {
      console.error("Error fetching welpen entries:", error);
    }
  };

  const handleImageUpload = (file: File, dogIndex: number) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newDogs = [...formDogs];
        newDogs[dogIndex].image = e.target?.result as string;
        setFormDogs(newDogs);
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
    setFormDogs([...formDogs, { name: "", image: "" }]);
  };

  const removeDog = (index: number) => {
    if (formDogs.length > 1) {
      setFormDogs(formDogs.filter((_, i) => i !== index));
    }
  };

  const updateDogName = (index: number, name: string) => {
    const newDogs = [...formDogs];
    newDogs[index].name = name;
    setFormDogs(newDogs);
  };

  const resetForm = () => {
    setFormDate("");
    setFormTitle("");
    setFormDescription("");
    setFormDogs([{ name: "", image: "" }]);
    setEditingId(null);
    setShowAddForm(false);
    fileInputRefs.current = [];
  };

  const isTimelineStyle =
    wurfCategory === "wurf b" || wurfCategory === "wurf c";

  const handleSubmit = async () => {
    if (!formDate || !formTitle) {
      alert("Bitte füllen Sie Datum und Titel aus");
      return;
    }

    const validDogs = formDogs.filter((dog) => dog.image.trim() !== "");
    if (validDogs.length === 0) {
      alert("Bitte fügen Sie mindestens ein Bild hinzu");
      return;
    }

    try {
      const url = editingId ? "/api/welpen/update" : "/api/welpen/create";
      const body = editingId
        ? {
            id: editingId,
            date: formDate,
            title: formTitle,
            description: formDescription,
            dogs: validDogs,
          }
        : {
            wurfId,
            date: formDate,
            title: formTitle,
            description: formDescription,
            dogs: validDogs,
          };

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        fetchWelpenEntries();
        resetForm();
      } else {
        alert(data.message || "Fehler beim Speichern");
      }
    } catch (error) {
      console.error("Error saving welpen entry:", error);
      alert("Ein Fehler ist aufgetreten");
    }
  };

  const handleSubmitInformation = async () => {
    try {
      const response = await fetch("/api/welpen/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wurfId,
          information,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/vomsauterhof/content/wurf");
      } else {
        alert(data.message || "Failed to update welpen");
      }
    } catch (error) {
      console.error("Error updating welpen:", error);
    }
  };

  const handleEdit = (entry: WelpenEntry) => {
    setEditingId(entry.id);
    setFormDate(entry.date);
    setFormTitle(entry.title);
    setFormDescription(entry.description || "");
    setFormDogs(entry.dogs.length > 0 ? entry.dogs : [{ name: "", image: "" }]);
    setShowAddForm(true);
    setActiveActionId(null);
  };

  const handleDelete = async (ids: string[]) => {
    if (
      !confirm(`Möchten Sie ${ids.length} Eintrag/Einträge wirklich löschen?`)
    ) {
      return;
    }

    try {
      const response = await fetch("/api/welpen/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      const data = await response.json();
      if (data.success) {
        fetchWelpenEntries();
        setSelectedIds(new Set());
        setActiveActionId(null);
      } else {
        alert(data.message || "Fehler beim Löschen");
      }
    } catch (error) {
      console.error("Error deleting welpen entries:", error);
      alert("Ein Fehler ist aufgetreten");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === welpenEntries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(welpenEntries.map((w) => w.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const selected = new Set(selectedIds);
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    setSelectedIds(selected);
  };

  const isAllSelected =
    selectedIds.size === welpenEntries.length && welpenEntries.length > 0;
  const hasSelection = selectedIds.size > 0;

  if (isLoading) {
    return (
      <div className="w-[65ch] max-[720px]:w-full mx-auto">
        <div className="text-center py-8"></div>
      </div>
    );
  }

  return (
    <div className="w-[65ch] max-[720px]:w-full mx-auto">
      <div className="flex flex-col self-center w-full gap-4">
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

          {!isTimelineStyle && (
            <button
              type="button"
              onClick={handleSubmitInformation}
              disabled={information.trim() === ""}
              style={{
                transition: "ease 0.5s",
                fontSize: "calc(var(--p4) * 0.9)",
              }}
              className={`py-1 px-2 bg-[#F38D3B] hover:brightness-95 font-medium border border-[var(--c-border)] rounded-[0.35rem] cursor-pointer text-white ml-auto disabled:opacity-50 disabled:pointer-events-none`}
            >
              Speichern
            </button>
          )}
        </div>

        {isTimelineStyle ? (
          <MotionConfig transition={motionTransition()}>
            <AnimatePresence mode="popLayout">
              <motion.div
                key="container"
                layout="position"
                className="flex flex-col gap-4"
              >
                <motion.button
                  style={{
                    transition: "ease 0.5s",
                    fontSize: "calc(var(--p4) * 0.9)",
                  }}
                  key="new-entry"
                  layout="position"
                  onClick={() => {
                    resetForm();
                    setShowAddForm(!showAddForm);
                  }}
                  className="py-1 hover:brightness-95 flex items-center w-fit rounded-[0.35rem] px-2 font-medium border border-[var(--c-border)] bg-[#FDF9F6] cursor-pointer"
                >
                  <IconPlus className="h-3 w-3 mr-1" />
                  Neuer Eintrag
                </motion.button>

                {showAddForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-[#F9ECE1] border border-[var(--c-border)] rounded-[0.5rem] p-4 flex flex-col gap-3"
                  >
                    <div className="grid grid-cols-[35%_1fr] gap-2">
                      <div className="flex-1">
                        <label className="text-sm opacity-75 mb-1 block">
                          Datum
                        </label>
                        <input
                          type="date"
                          value={formDate}
                          onChange={(e) => setFormDate(e.target.value)}
                          className="w-full px-3 py-2 border font-p3 border-[var(--c-border)] rounded-[0.35rem] outline-none"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm opacity-75 mb-1 block">
                          Titel
                        </label>
                        <input
                          type="text"
                          placeholder="z.B. Welpen Update"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          className="w-full px-3 py-2 border font-p3 border-[var(--c-border)] rounded-[0.35rem] outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                      <label className="text-sm opacity-75 mb-1 block">
                        Beschreibung (optional)
                      </label>
                      <RichTextEditor
                        value={formDescription}
                        onChange={setFormDescription}
                        placeholder="Zusätzliche Informationen..."
                        hideToolbar={false}
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm opacity-75">Welpen</label>
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

                      {formDogs.map((dog, index) => (
                        <div
                          key={index}
                          className="bg-white/45 border border-[var(--c-border)] rounded-[0.35rem] p-3 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium opacity-75">
                              Welpe {index + 1}
                            </span>
                            {formDogs.length > 1 && (
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
                            onChange={(e) =>
                              updateDogName(index, e.target.value)
                            }
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
                            onClick={() =>
                              fileInputRefs.current[index]?.click()
                            }
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
                                    const newDogs = [...formDogs];
                                    newDogs[index].image = "";
                                    setFormDogs(newDogs);
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

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={resetForm}
                        style={{
                          transition: "ease 0.5s",
                          fontSize: "calc(var(--p4) * 0.9)",
                        }}
                        className="py-1 px-2 bg-white hover:brightness-95 font-medium border border-[var(--c-border)] rounded-[0.35rem] cursor-pointer"
                      >
                        Abbrechen
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={!formDate || !formTitle}
                        style={{
                          transition: "ease 0.5s",
                          fontSize: "calc(var(--p4) * 0.9)",
                        }}
                        className="py-1 px-2 bg-[#F38D3B] hover:brightness-95 font-medium border border-[var(--c-border)] rounded-[0.35rem] cursor-pointer text-white disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {editingId ? "Aktualisieren" : "Hinzufügen"}
                      </button>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  key="table-header"
                  layout="position"
                  className="grid grid-cols-[2rem_1fr_1fr_4rem_2rem] font-p3 max-[500px]:gap-2 gap-4 w-full items-center"
                >
                  <span className="font-medium">
                    <span
                      onClick={toggleSelectAll}
                      style={{ transition: "ease 0.5s" }}
                      className={`w-4.5 h-4.5 cursor-pointer hover:brightness-95 flex ${
                        isAllSelected ? "bg-[#F38D3B]" : "bg-[#F9ECE1]"
                      } border border-[var(--c-border)] rounded-[0.35rem] items-center justify-center`}
                    >
                      <AnimatePresence>
                        {isAllSelected && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <IconCheck className="w-3.5 h-3.5" color="white" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </span>
                  <span className=" font-medium opacity-50">Datum</span>
                  <span className=" font-medium opacity-50">Titel</span>
                  <span className=" font-medium opacity-50">Welpen</span>
                  <span className=" font-medium opacity-50"></span>
                </motion.div>

                {hasSelection && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    layout="position"
                    key="selected-actions"
                    className="flex items-center space-x-2"
                  >
                    <button
                      style={{
                        transition: "ease 0.5s",
                        fontSize: "calc(var(--p4) * 0.9)",
                      }}
                      onClick={() => setSelectedIds(new Set())}
                      className="py-1 hover:brightness-95 flex items-center w-fit rounded-[0.35rem] px-2 font-medium cursor-pointer border border-[rgba(0,_0,_0,_0.15)] bg-[#FDF9F6]"
                    >
                      Stornieren
                    </button>

                    <button
                      onClick={() => handleDelete(Array.from(selectedIds))}
                      style={{
                        transition: "ease 0.5s",
                        fontSize: "calc(var(--p4) * 0.9)",
                      }}
                      className="py-1 hover:brightness-95 flex items-center w-fit rounded-[0.35rem] px-2 font-medium cursor-pointer border border-[rgba(0,_0,_0,_0.15)] bg-[#E61300] text-white"
                    >
                      Löschen
                    </button>
                  </motion.div>
                )}

                <motion.div
                  layout="position"
                  className="flex flex-col space-y-2 w-full"
                >
                  {welpenEntries.map((entry) => {
                    const isSelected = selectedIds.has(entry.id);
                    const isActionActive = activeActionId === entry.id;
                    return (
                      <div
                        key={entry.id}
                        style={{ transition: "ease 0.5s" }}
                        className={`${
                          isSelected
                            ? "bg-[#F5DFCC]"
                            : isActionActive
                            ? "bg-[#F5DFCC] z-[5]"
                            : "bg-[#F9ECE1] hover:brightness-95 z-[0]"
                        } grid grid-cols-[2rem_1fr_1fr_4rem_2rem] pb-2 border-b border-b-black/5 gap-4 max-[500px]:gap-2 w-full items-center font-p3`}
                      >
                        <span
                          onClick={() => toggleSelectRow(entry.id)}
                          style={{ transition: "ease 0.5s" }}
                          className={`w-4.5 h-4.5 cursor-pointer hover:brightness-95 flex ${
                            isSelected ? "bg-[#F38D3B]" : "bg-[#F9ECE1]"
                          } border border-[var(--c-border)] rounded-[0.35rem] items-center justify-center`}
                        >
                          <AnimatePresence>
                            {isSelected && (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <IconCheck
                                  className="w-3.5 h-3.5"
                                  color="white"
                                />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </span>
                        <span
                          onClick={() => handleEdit(entry)}
                          className="truncate font-medium cursor-pointer flex items-center h-14"
                        >
                          {formatDate(entry.date)}
                        </span>
                        <div
                          onClick={() => handleEdit(entry)}
                          className="flex flex-col gap-1 py-2 cursor-pointer"
                        >
                          <span className="truncate">{entry.title}</span>
                        </div>
                        <div
                          onClick={() => handleEdit(entry)}
                          className="font-medium cursor-pointer"
                        >
                          {entry.dogs.length}
                        </div>

                        <span className="w-full flex items-center justify-center relative">
                          <span
                            onClick={() =>
                              setActiveActionId(
                                activeActionId === entry.id ? null : entry.id
                              )
                            }
                            style={{ transition: "ease 0.5s" }}
                            className="p-1 bg-[#F9ECE1] cursor-pointer rounded-[0.35rem] hover:brightness-95 relative z-0"
                          >
                            <IconDots className="h-4 w-4 opacity-75" />
                          </span>
                          <AnimatePresence>
                            {activeActionId === entry.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={motionTransition()}
                                className="p-1 flex absolute right-0 top-8 z-15 flex-col space-y-1 bg-white border border-black/10 rounded-[0.5rem] shadow-lg min-w-[150px]"
                              >
                                <button
                                  onClick={() => handleEdit(entry)}
                                  style={{
                                    transition: "ease 0.5s",
                                    fontSize: "calc(var(--p4) * 0.9)",
                                  }}
                                  className="py-1 px-1.5 cursor-pointer rounded-[0.25rem] bg-white hover:brightness-95 flex items-center space-x-2 text-left"
                                >
                                  <IconEdit
                                    className="h-4 w-4"
                                    color="#0C8CE9"
                                  />
                                  <span>Bearbeiten</span>
                                </button>
                                <button
                                  onClick={() => handleDelete([entry.id])}
                                  style={{
                                    transition: "ease 0.5s",
                                    fontSize: "calc(var(--p4) * 0.9)",
                                  }}
                                  className="py-1 px-1.5 cursor-pointer rounded-[0.25rem] bg-white hover:brightness-95 flex items-center space-x-2 text-left"
                                >
                                  <IconTrash
                                    className="h-4 w-4"
                                    color="#E61300"
                                  />
                                  <span>Löschen</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </span>
                      </div>
                    );
                  })}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </MotionConfig>
        ) : (
          <RichTextEditor
            value={information}
            placeholder="Information"
            onChange={setInformation}
            disableImageButton={false}
            hideToolbar={true}
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
