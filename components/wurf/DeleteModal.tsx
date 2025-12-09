"use client";

import { motionTransition } from "@/constants/motionTransition";
import { IconX } from "@tabler/icons-react";
import { motion } from "motion/react";
import { useRef } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";

type Props = {
  ids: Set<string>;
  setShowDelete: (show: boolean) => void;
  setSelectedId: (ids: Set<string>) => void;
  fetchWurf: () => void;
};

function DeleteModal({ ids, setShowDelete, setSelectedId, fetchWurf }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside<HTMLDivElement>(modalRef, () => {
    setShowDelete(false);
  });

  const handleDelete = async () => {
    try {
      const idsArray = Array.from(ids);
      const response = await fetch("/api/wurf/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: idsArray }),
      });

      const data = await response.json();
      if (data.success) {
        // alert(data.message);
        setSelectedId(new Set());
        setShowDelete(false);
        fetchWurf();
      } else {
        alert(data.message || "Failed to delete wurf");
      }
    } catch (error) {
      console.error("Error deleting wurf:", error);
      alert("An error occurred while deleting wurf");
    }
  };

  return (
    <>
      <div className="flex fixed z-10 w-screen h-screen top-0 left-0 bg-black opacity-20"></div>

      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={motionTransition()}
        className="top-8 py-2 gap-4 bg-[#FBF2EA] w-[30rem] max-sm:w-[93%] self-center rounded-[0.5rem] border border-black/10 fixed z-10"
      >
        <div
          key={"title"}
          className="grid grid-cols-[1fr_auto] gap-4 items-center pb-2 border-b border-b-black/10 px-4"
        >
          <span className="font-medium">Wurf löschen</span>
          <span
            onClick={() => setShowDelete(false)}
            style={{ transition: "ease 0.5s" }}
            className="p-1 bg-[#FBF2EA] cursor-pointer ml-auto rounded-[0.35rem] hover:brightness-95"
          >
            <IconX className="h-4 w-4" />
          </span>
        </div>

        <div key={"content"} className="px-4 py-4">
          <p className="text-sm opacity-75">
            Sind Sie sicher, dass Sie {ids.size} Wurf-Beitrag
            {ids.size > 1 ? "e" : ""} löschen möchten? Diese Aktion kann nicht
            rückgängig gemacht werden.
          </p>
        </div>

        <div
          key={"actions"}
          className="flex justify-end gap-2 px-4 pt-2 border-t border-t-black/10"
        >
          <button
            onClick={() => setShowDelete(false)}
            style={{
              transition: "ease 0.5s",
              fontSize: "calc(var(--p4) * 0.9)",
            }}
            className="py-1 px-2 bg-[#FBF2EA] hover:brightness-95 font-medium border border-[var(--c-border)] rounded-[0.35rem] cursor-pointer"
          >
            Abbrechen
          </button>
          <button
            onClick={handleDelete}
            style={{
              transition: "ease 0.5s",
              fontSize: "calc(var(--p4) * 0.9)",
            }}
            className="py-1 px-2 bg-[#E61300] hover:brightness-95 font-medium border border-[var(--c-border)] rounded-[0.35rem] cursor-pointer text-white"
          >
            Löschen
          </button>
        </div>
      </motion.div>
    </>
  );
}

export default DeleteModal;
