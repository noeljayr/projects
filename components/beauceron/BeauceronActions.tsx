"use client";

import { motionTransition } from "@/constants/motionTransition";
import {
  IconEdit,
  IconTrash,
  IconChecks,
  IconX,
  IconFile,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import type { Beauceron } from "@/types/Beauceron";
import Link from "next/link";
import { openModal } from "@/lib/modalFunctions";

type Props = {
  show: boolean;
  setShow: (show: boolean) => void;
  beauceron: Beauceron;
  onDelete: () => void;
  onRefresh: () => void;
};

function BeauceronActions({
  setShow,
  show,
  beauceron,
  onDelete,
  onRefresh,
}: Props) {
  const actionsRef = useRef<HTMLDivElement>(null);

  useClickOutside<HTMLDivElement>(actionsRef, () => {
    if (show) setShow(false);
  });

  const handlePublish = async () => {
    try {
      const response = await fetch("/api/beauceron/update-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: [beauceron.id],
          status: "published",
        }),
      });

      const data = await response.json();
      if (data.success) {
        onRefresh();
        setShow(false);
      } else {
        alert(data.message || "Failed to publish beauceron");
      }
    } catch (error) {
      console.error("Error publishing beauceron:", error);
    }
  };

  const handleUnpublish = async () => {
    try {
      const response = await fetch("/api/beauceron/update-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: [beauceron.id],
          status: "draft",
        }),
      });

      const data = await response.json();
      if (data.success) {
        onRefresh();
        setShow(false);
      } else {
        alert(data.message || "Failed to unpublish beauceron");
      }
    } catch (error) {
      console.error("Error unpublishing beauceron:", error);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={actionsRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={motionTransition()}
          className="p-1 flex absolute right-0 top-8 z-15 flex-col space-y-1 bg-[#FBF2EA] border border-black/10 rounded-[0.5rem] shadow-lg min-w-[150px]"
        >
          <button
            onClick={() => {
              openModal("beauceron-documents", "true");
              openModal("id", beauceron.id);
              openModal("tab", "stammbaum");
              setShow(false);
            }}
            style={{
              transition: "ease 0.5s",
              fontSize: "calc(var(--p4) * 0.9)",
            }}
            className="py-1 px-1.5 cursor-pointer rounded-[0.25rem] bg-[#FBF2EA] hover:brightness-95 flex items-center space-x-2 text-left"
          >
            <IconFile color="black" className="h-4 w-4" />
            <span>Unterlagen</span>
          </button>

          <Link
            href={`/vomsauterhof/content/beauceron/edit/${beauceron.id}`}
            style={{
              transition: "ease 0.5s",
              fontSize: "calc(var(--p4) * 0.9)",
            }}
            className="py-1 px-1.5 cursor-pointer rounded-[0.25rem] bg-[#FBF2EA] hover:brightness-95 flex items-center space-x-2 text-left"
          >
            <IconEdit color="#0C8CE9" className="h-4 w-4" />
            <span>Bearbeiten</span>
          </Link>

          {beauceron.status === "published" ? (
            <button
              onClick={handleUnpublish}
              style={{
                transition: "ease 0.5s",
                fontSize: "calc(var(--p4) * 0.9)",
              }}
              className="py-1 px-1.5 cursor-pointer rounded-[0.25rem] bg-[#FBF2EA] hover:brightness-95 flex items-center space-x-2 text-left"
            >
              <IconX color="#E6B100" className="h-4 w-4" />
              <span>Verstecken</span>
            </button>
          ) : (
            <button
              onClick={handlePublish}
              style={{
                transition: "ease 0.5s",
                fontSize: "calc(var(--p4) * 0.9)",
              }}
              className="py-1 px-1.5 cursor-pointer rounded-[0.25rem] bg-[#FBF2EA] hover:brightness-95 flex items-center space-x-2 text-left"
            >
              <IconChecks color="#00A651" className="h-4 w-4" />
              <span>Veröffentlichen</span>
            </button>
          )}

          <button
            onClick={onDelete}
            style={{
              transition: "ease 0.5s",
              fontSize: "calc(var(--p4) * 0.9)",
            }}
            className="py-1 px-1.5 cursor-pointer rounded-[0.25rem] bg-[#FBF2EA] hover:brightness-95 flex items-center space-x-2 text-left"
          >
            <IconTrash color="#E61300" className="h-4 w-4" />
            <span>Löschen</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BeauceronActions;
