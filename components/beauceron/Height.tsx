"use client";

import { IconRulerMeasure2 } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useRef, useState } from "react";
import { motionTransition } from "@/constants/motionTransition";

type Props = {
  height: number | undefined;
  setHeight: (height: number) => void;
};

function Height({ height, setHeight }: Props) {
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
        className="flex items-center justify-center rounded-[0.35rem] gap-2 py-1 px-4 font-medium border border-[var(--c-border)] cursor-pointer  "
      >
        <IconRulerMeasure2 strokeWidth={1} className="h-4.5 w-4.5 opacity-75" />
        <span
          style={{ fontSize: "calc(var(--p3) * 0.9)" }}
          className="opacity-85"
        >
          {height ? height : "Höhe"}
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
              Höhe in cm
            </span>
            <div className="w-full flex p-2">
              <input
                value={height}
                onChange={(e) => setHeight(parseFloat(e.currentTarget.value))}
                style={{ fontSize: "calc(var(--p3) * 0.9)" }}
                type="number"
                placeholder="Zum Beispiel: 32"
                className="p-1 w-full bg-black/2 rounded-[0.35rem] border border-[var(--c-border)] w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Height;
