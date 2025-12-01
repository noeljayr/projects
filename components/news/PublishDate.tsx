"use client";

import { IconCalendarDue } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useRef, useState } from "react";
import { motionTransition } from "@/constants/motionTransition";
import { formatDate, toInputDate } from "@/lib/formatDate";

type Props = {
  publishDate: string;
  setPublishDate: (date: string) => void;
};

function PublishDate({ publishDate, setPublishDate }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [show, setShow] = useState(false);

  useClickOutside<HTMLDivElement>(containerRef, () => {
    if (show) setShow(false);
  });

  return (
    <div ref={containerRef} className="flex relative">
      <button
        onClick={() => setShow(!show)}
        style={{ fontSize: "calc(var(--p3) * 0.9)" }}
        className="flex items-center justify-center rounded-[0.35rem] gap-2 py-1 px-4 font-medium border border-[var(--c-border)] cursor-pointer"
      >
        <IconCalendarDue strokeWidth={1} className="h-4.5 w-4.5 opacity-75" />
        <span
          style={{ fontSize: "calc(var(--p3) * 0.9)" }}
          className="opacity-85"
        >
          {publishDate ? formatDate(publishDate) : "Veröffentlichungsdatum"}
        </span>
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={motionTransition()}
            className="absolute w-[13rem] flex flex-col bg-white rounded-[0.5rem] border border-[var(--c-border)] bottom-[110%]"
          >
            <span
              style={{ fontSize: "calc(var(--p3) * 0.9)" }}
              className="p-2 border-b border-b-black/5 font-medium "
            >
              Veröffentlichungsdatum
            </span>
            <div className="w-full flex p-2">
              <input
                value={toInputDate(publishDate)}
                onChange={(e) => setPublishDate(e.currentTarget.value)}
                style={{ fontSize: "calc(var(--p3) * 0.9)" }}
                type="date"
                max={new Date().toISOString().split("T")[0]}
                className="p-1 bg-black/2 rounded-[0.35rem] border border-[var(--c-border)] w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PublishDate;
