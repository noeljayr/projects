"use client";

import { motionTransition } from "@/constants/motionTransition";
import { IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type DeleteDocumentModalProps = {
  fileId: string;
  filename: string;
  onDeleteSuccess: () => void;
  setShowDelete: (state: boolean) => void;
};

function DeleteDocumentModal({
  fileId,
  filename,
  onDeleteSuccess,
  setShowDelete,
}: DeleteDocumentModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/beauceron/documents/delete?fileId=${fileId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        onDeleteSuccess();
        setShowDelete(false);
      } else {
        alert(data.message || "Löschen fehlgeschlagen");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Löschen fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex fixed w-screen h-screen top-0 left-0 bg-black opacity-20 z-20"></div>
      <div className="fixed flex flex-col left-0 top-0 w-screen h-screen z-[25]">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={motionTransition()}
            className="top-8 py-2 gap-4 bg-white w-[40rem] max-sm:w-[93%] self-center rounded-[0.5rem] border border-black/10 fixed z-20"
          >
            <div className="flex items-center pb-2 border-b border-b-black/10 px-4">
              <span className="font-medium">Dokument löschen</span>
              <span
                onClick={() => setShowDelete(false)}
                style={{ transition: "ease 0.5s" }}
                className="p-1 bg-white cursor-pointer ml-auto rounded-[0.35rem] hover:brightness-95"
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
              Möchten Sie das Dokument "{filename}" wirklich löschen?
            </p>

            <div className="px-4 flex w-full items-center pt-2 border-t border-t-black/10 ">
              <button
                onClick={() => setShowDelete(false)}
                type="button"
                style={{
                  transition: "ease 0.5s",
                  fontSize: "calc(var(--p4) * 0.9)",
                }}
                className={`py-1 px-2 bg-white hover:brightness-95 font-medium border border-[var(--c-border)]  rounded-[0.35rem] cursor-pointer ml-auto`}
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
      </div>
    </>
  );
}

export default DeleteDocumentModal;
