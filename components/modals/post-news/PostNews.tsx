"use client";
import { useUrlModal } from "@/hooks/useUrlModal";
import { useCloseParam } from "@/hooks/useUrlFunctions";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { IconPhotoPlus, IconX } from "@tabler/icons-react";
import { motionTransition } from "@/constants/motionTransition";
import RichTextEditor from "@/components/editor/RichTextEditor";

function PostNews() {
  const { isOpen: open } = useUrlModal("post-news");
  return (
    <>
      {open && (
        <div
          onClick={() => useCloseParam("post-news")}
          className="flex fixed w-screen h-screen top-0 left-0 bg-black opacity-20"
        ></div>
      )}
      <MotionConfig transition={motionTransition()}>
        <AnimatePresence mode="popLayout">
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed grid grid-rows-[auto_auto_auto_1fr_auto] self-center w-[32rem] h-[41em] top-2 py-2 gap-4 bg-white border border-black/10 rounded-[0.5rem]"
            >
              <div className="flex items-center pb-2 border-b border-b-black/10 px-4">
                <span className="font-medium">Post news</span>
                <span
                  style={{ transition: "ease 0.5s" }}
                  className="p-1 bg-white cursor-pointer ml-auto rounded-[0.35rem] hover:brightness-95"
                >
                  <IconX className="h-4 w-4" />
                </span>
              </div>

              <div className="flex flex-col px-4 gap-2">
                <div className="flex flex-col items-center justify-center border border-dashed border-black/10 rounded-[0.5rem] w-full aspect-[4_/_2.5]">
                  <IconPhotoPlus className="h-5 w-5 opacity-55" />
                  <span
                    style={{
                      transition: "ease 0.5s",
                      fontSize: "calc(var(--p4) * 0.7)",
                    }}
                    className="font-medium opacity-50"
                  >
                    Cover image
                  </span>
                </div>

                <input
                  className="font-h3 font-bold placeholder:opacity-50 outline-0 border-0 bg-transparent"
                  placeholder="Title"
                />
              </div>

              <RichTextEditor />

              <div className="px-4 flex w-full items-center pt-2 border-t border-t-black/10 ">
                <span
                  style={{
                    transition: "ease 0.5s",
                    fontSize: "calc(var(--p4) * 0.9)",
                  }}
                  className="draft mr-auto"
                >
                  Save as draft
                </span>

                <button
                  type="button"
                  style={{
                    transition: "ease 0.5s",
                    fontSize: "calc(var(--p4) * 0.9)",
                  }}
                  className={`py-1 px-2 bg-white hover:brightness-95 font-medium border border-[var(--c-border)]  rounded-[0.35rem] cursor-pointer`}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  style={{
                    transition: "ease 0.5s",
                    fontSize: "calc(var(--p4) * 0.9)",
                  }}
                  className={`py-1 px-2 bg-[#F38D3B] hover:brightness-95 font-medium border border-[var(--c-border)]  rounded-[0.35rem] cursor-pointer text-white ml-3`}
                >
                  Post
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </MotionConfig>
    </>
  );
}

export default PostNews;
