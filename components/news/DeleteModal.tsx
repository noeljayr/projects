"use client";

import { motionTransition } from "@/constants/motionTransition";
import { IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type SeletedIds = {
  ids: Set<string>;
  setSelectedId: (ids: Set<string>) => void;
  fetchNews: () => void;
  setShowDelete: (state: boolean) => void;
};
function DeleteModal({
  ids,
  setSelectedId,
  fetchNews,
  setShowDelete,
}: SeletedIds) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      const idsArray = Array.from(ids);
      const response = await fetch(
        `/api/news/delete?ids=${idsArray.join(",")}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (data.success) {
        setSelectedId(new Set());
        fetchNews();
        setShowDelete(false);
      } else {
        alert(data.message || "Failed to delete news");
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      alert("An error occurred while deleting news");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex fixed w-screen h-screen top-0 left-0 bg-black opacity-20"></div>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={motionTransition()}
          className="top-8 py-2 gap-4 bg-[#FBF2EA] w-[25rem] max-sm:w-[93%] self-center rounded-[0.5rem] border border-black/10 fixed"
        >
          <div className="flex items-center pb-2 border-b border-b-black/10 px-4">
            <span className="font-medium">Nachrichten löschen</span>
            <span
              onClick={() => setShowDelete(false)}
              style={{ transition: "ease 0.5s" }}
              className="p-1 bg-[#FBF2EA] cursor-pointer ml-auto rounded-[0.35rem] hover:brightness-95"
            >
              <IconX className="h-4 w-4" />
            </span>
          </div>
          <p
            className="px-4 py-4"
            style={{
              transition: "ease 0.5s",
              fontSize: "calc(var(--p4) * 0.9)",
            }}
          >
            {ids.size == 1
              ? "Möchten Sie den ausgewählten Beitrag wirklich löschen?"
              : " Sind Sie sicher, dass Sie die ausgewählten Beiträge löschen möchten?"}
          </p>

          <div className="px-4 flex w-full items-center pt-2 border-t border-t-black/10 ">
            <button
              onClick={() => setShowDelete(false)}
              type="button"
              style={{
                transition: "ease 0.5s",
                fontSize: "calc(var(--p4) * 0.9)",
              }}
              className={`py-1 px-2 bg-[#FBF2EA] hover:brightness-95 font-medium border border-[var(--c-border)]  rounded-[0.35rem] cursor-pointer ml-auto`}
            >
              Stornieren
            </button>

            <button
              onClick={handleDelete}
              disabled={loading}
              type="button"
              style={{
                transition: "ease 0.5s",
                fontSize: "calc(var(--p4) * 0.9)",
              }}
              className={`py-1 px-2 bg-[#E61300] hover:brightness-95 font-medium border border-[var(--c-border)]  rounded-[0.35rem] cursor-pointer text-white ml-3 disabled:opacity-50 disabled:pointer-events-none`}
            >
              Löschen
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default DeleteModal;
