"use client";

import { IconCheck, IconDots, IconPhoto, IconPlus } from "@tabler/icons-react";
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { motionTransition } from "@/constants/motionTransition";
import Link from "next/link";
import type { Wurf } from "@/types/Wurf";
import DeleteModal from "./DeleteModal";
import WurfActions from "./WurfActions";

function WurfTable() {
  const [wurf, setWurf] = useState<Wurf[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [wToDelete, setWToDelete] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchWurf();
  }, []);

  const fetchWurf = async () => {
    try {
      const response = await fetch("/api/wurf/list");
      const data = await response.json();
      if (data.success) {
        setWurf(data.wurf);
      }
    } catch (error) {
      console.error("Error fetching wurf:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === wurf.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(wurf.map((w) => w.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const wurfSelected = new Set(selectedIds);
    if (wurfSelected.has(id)) {
      wurfSelected.delete(id);
    } else {
      wurfSelected.add(id);
    }
    setSelectedIds(wurfSelected);
  };

  const handleUnpublish = async () => {
    try {
      const idsArray = Array.from(selectedIds);
      const response = await fetch("/api/wurf/update-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: idsArray,
          status: "draft",
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setSelectedIds(new Set());
        fetchWurf();
      } else {
        alert(data.message || "Failed to unpublish wurf");
      }
    } catch (error) {
      console.error("Error unpublishing wurf:", error);
      alert("An error occurred while unpublishing wurf");
    }
  };

  const handleDeleteSingle = (wurf: string) => {
    setWToDelete(new Set([wurf]));
    setShowDelete(true);
    setActiveActionId(null);
  };

  const isAllSelected = selectedIds.size === wurf.length && wurf.length > 0;
  const hasSelection = selectedIds.size > 0;

  if (isLoading) {
    return <div className="text-center py-8"></div>;
  }

  return (
    <>
      <MotionConfig transition={motionTransition()}>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={"container"}
            layout="position"
            className="flex flex-col gap-4"
          >
            <motion.button
              style={{
                transition: "ease 0.5s",
                fontSize: "calc(var(--p4) * 0.9)",
              }}
              key={"new-wurf"}
              layout="position"
              className="py-1 hover:brightness-95 flex items-center w-fit rounded-[0.35rem] px-2 font-medium border border-[var(--c-border)] bg-[#FDF9F6] cursor-pointer"
            >
              <Link
                href={"/vomsauterhof/content/wurf/post"}
                className="flex items-center"
              >
                <IconPlus className="h-3 w-3 mr-1" />
                Neuer Beitrag
              </Link>
            </motion.button>

            <motion.div
              key={"tabler-header"}
              layout="position"
              className="font-p3 grid grid-cols-[2rem_4rem_1fr_20%_10%_2rem] max-[500px]:gap-2 max-[1000px]:grid-cols-[2rem_4rem_1fr_4.5rem_2rem] gap-4 w-full items-center"
            >
              <span className="font-medium">
                <span
                  onClick={toggleSelectAll}
                  style={{
                    transition: "ease 0.5s",
                  }}
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
              <span></span>
              <span className="font-medium opacity-50">Name</span>
              <span className="max-[1000px]:hidden font-medium opacity-50">
                Kategorie
              </span>
              <span className="font-medium opacity-50">Status</span>
              <span className="font-medium opacity-50"></span>
            </motion.div>

            {hasSelection && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                layout="position"
                key={"selected-actions"}
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
                  onClick={handleUnpublish}
                  style={{
                    transition: "ease 0.5s",
                    fontSize: "calc(var(--p4) * 0.9)",
                  }}
                  className="py-1 hover:brightness-95 flex items-center w-fit rounded-[0.35rem] px-2 font-medium cursor-pointer border border-[rgba(0,_0,_0,_0.15)] bg-[#E6B100] text-white"
                >
                  Verstecken
                </button>

                <button
                  onClick={() => {
                    setWToDelete(selectedIds);
                    setShowDelete(true);
                  }}
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
              {wurf.map((w) => {
                const isSelected = selectedIds.has(w.id);
                const isActionActive = activeActionId === w.id;
                return (
                  <div
                    key={w.id}
                    style={{
                      transition: "ease 0.5s",
                    }}
                    className={`${
                      isSelected
                        ? "bg-[#F5DFCC]"
                        : isActionActive
                        ? "bg-[#F5DFCC] z-[5]"
                        : "bg-[#F9ECE1] hover:brightness-95 z-[0]"
                    }  font-p3 grid grid-cols-[2rem_4rem_1fr_20%_10%_2rem] max-[1000px]:grid-cols-[2rem_4rem_1fr_4.5rem_2rem] pb-2 border-b border-b-black/5 gap-4 max-[500px]:gap-2 w-full items-center font-p3`}
                  >
                    <span
                      onClick={() => toggleSelectRow(w.id)}
                      style={{
                        transition: "ease 0.5s",
                      }}
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
                            <IconCheck className="w-3.5 h-3.5" color="white" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                    <Link href={`/vomsauterhof/content/wurf/edit/${w.id}`}>
                      {w.image ? (
                        <img
                          className="h-14 w-14 cursor-pointer rounded-[0.35rem] object-cover"
                          alt={w.name}
                          src={w.image}
                        />
                      ) : (
                        <div className="h-14 w-14 cursor-pointer rounded-[0.35rem] bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-400">
                            <IconPhoto className="h-6 w-6 opacity-50" />
                          </span>
                        </div>
                      )}
                    </Link>
                    <Link
                      href={`/vomsauterhof/content/wurf/edit/${w.id}`}
                      className="truncate font-medium cursor-pointer flex items-center h-14"
                    >
                      <span className="truncate"> {w.name}</span>
                    </Link>
                    <span className="truncate max-[1000px]:hidden cursor-pointer flex items-center h-14">
                      {w.category || "-"}
                    </span>
                    <span
                      className={`capitalize font-p4 font-semibold ${w.status}`}
                    >
                      {w.status.toLowerCase() === "published"
                        ? "Veröffentlicht"
                        : "Entwurf"}
                    </span>
                    <span className="w-full flex items-center justify-center relative">
                      <span
                        onClick={() =>
                          setActiveActionId(
                            activeActionId === w.id ? null : w.id
                          )
                        }
                        style={{ transition: "ease 0.5s" }}
                        className="p-1 bg-[#F9ECE1] cursor-pointer rounded-[0.35rem] hover:brightness-95 relative z-0"
                      >
                        <IconDots className="h-4 w-4 opacity-75" />
                      </span>
                      <WurfActions
                        show={activeActionId === w.id}
                        setShow={(show) =>
                          setActiveActionId(show ? w.id : null)
                        }
                        wurf={w}
                        onDelete={() => handleDeleteSingle(w.id)}
                        onRefresh={fetchWurf}
                      />
                    </span>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showDelete && (
            <DeleteModal
              fetchWurf={fetchWurf}
              ids={wToDelete}
              setSelectedId={setSelectedIds}
              setShowDelete={setShowDelete}
            />
          )}
        </AnimatePresence>
      </MotionConfig>
    </>
  );
}

export default WurfTable;
