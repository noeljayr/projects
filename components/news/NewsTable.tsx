"use client";

import { IconCheck, IconDots, IconPhoto, IconPlus } from "@tabler/icons-react";
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { motionTransition } from "@/constants/motionTransition";
import Link from "next/link";
import type { News } from "@/types/News";
import DeleteModal from "./DeleteModal";
import NewsActions from "./NewsActions";
import { formatDate2 } from "@/lib/formatDate";

function NewsTable() {
  const [news, setNews] = useState<News[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [newsToDelete, setNewsToDelete] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch("/api/news/list");
      const data = await response.json();
      if (data.success) {
        setNews(data.news);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === news.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(news.map((n) => n.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleUnpublish = async () => {
    try {
      const idsArray = Array.from(selectedIds);
      const response = await fetch("/api/news/update-status", {
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
        fetchNews();
      } else {
        alert(data.message || "Failed to unpublish news");
      }
    } catch (error) {
      console.error("Error unpublishing news:", error);
      alert("An error occurred while unpublishing news");
    }
  };

  const handleDeleteSingle = (newsId: string) => {
    setNewsToDelete(new Set([newsId]));
    setShowDelete(true);
    setActiveActionId(null);
  };

  const isAllSelected = selectedIds.size === news.length && news.length > 0;
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
              key={"new-post"}
              layout="position"
              className="py-1 hover:brightness-95 flex items-center w-fit rounded-[0.35rem] px-2 font-medium border border-[var(--c-border)] bg-[#FDF9F6] cursor-pointer"
            >
              <Link
                href={"/vomsauterhof/content/news/post"}
                className="flex items-center"
              >
                <IconPlus className="h-3 w-3 mr-1" />
                Neuer Beitrag
              </Link>
            </motion.button>

            <motion.div
              key={"tabler-header"}
              layout="position"
              className="grid grid-cols-[2rem_4rem_1fr_15%_8rem_5rem] max-[1000px]:grid-cols-[2rem_4rem_1fr_8rem_2rem] max-sm:grid-cols-[1rem_4rem_1fr_5rem_2rem] font-p3 max-[500px]:gap-2 gap-4 w-full items-center"
            >
              <span className=" font-medium">
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
              <span className="font-medium opacity-50">Titel</span>
              <span className="max-[1000px]:hidden font-medium opacity-50">
                Datum
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
                {/* <span className="text-sm opacity-75 mr-2">
                  {selectedIds.size} 
                  selected
                </span> */}
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
                    setNewsToDelete(selectedIds);
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
              {news.map((n) => {
                const isSelected = selectedIds.has(n.id);
                const isActionActive = activeActionId === n.id;
                return (
                  <div
                    key={n.id}
                    style={{
                      transition: "ease 0.5s",
                    }}
                    className={`${
                      isSelected
                        ? "bg-[#F5DFCC]"
                        : isActionActive
                        ? "bg-[#F5DFCC] z-[5]"
                        : "bg-[#F9ECE1] hover:brightness-95 z-[0]"
                    }  grid font-p3 grid-cols-[2rem_4rem_1fr_15%_8rem_5rem] max-[1000px]:grid-cols-[2rem_4rem_1fr_8rem_2rem] max-sm:grid-cols-[1rem_4rem_1fr_5rem_2rem] pb-2 border-b border-b-black/5 gap-4 max-[500px]:gap-2 w-full items-center`}
                  >
                    <span
                      onClick={() => toggleSelectRow(n.id)}
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
                    <Link href={`/vomsauterhof/content/news/edit/${n.id}`}>
                      {n.coverImage ? (
                        <img
                          className="h-14 w-14 cursor-pointer rounded-[0.35rem] object-cover"
                          alt={n.title}
                          src={
                            n.coverImage.startsWith("data:")
                              ? n.coverImage
                              : `/news/${n.coverImage}`
                          }
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
                      href={`/vomsauterhof/content/news/edit/${n.id}`}
                      className="truncate font-medium cursor-pointer flex items-center h-14"
                    >
                      <span className="truncate"> {n.title}</span>
                    </Link>
                    <span className="truncate max-[1000px]:hidden cursor-pointer flex items-center h-14">
                      {formatDate2(n.date)}
                    </span>

                    <span className={`capitalize font-semibold ${n.status}`}>
                      {n.status.toLowerCase() === "published"
                        ? "Veröffentlicht"
                        : "Entwurf"}
                    </span>
                    <span className="w-full flex items-center justify-center relative">
                      <span
                        onClick={() =>
                          setActiveActionId(
                            activeActionId === n.id ? null : n.id
                          )
                        }
                        style={{ transition: "ease 0.5s" }}
                        className="p-1 bg-[#F9ECE1] cursor-pointer rounded-[0.35rem] hover:brightness-95 relative z-0"
                      >
                        <IconDots className="h-4 w-4 opacity-75" />
                      </span>
                      <NewsActions
                        show={activeActionId === n.id}
                        setShow={(show) =>
                          setActiveActionId(show ? n.id : null)
                        }
                        news={n}
                        onDelete={() => handleDeleteSingle(n.id)}
                        onRefresh={fetchNews}
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
              fetchNews={fetchNews}
              ids={newsToDelete}
              setSelectedId={setSelectedIds}
              setShowDelete={setShowDelete}
            />
          )}
        </AnimatePresence>
      </MotionConfig>
    </>
  );
}

export default NewsTable;
