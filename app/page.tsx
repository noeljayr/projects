"use client";

import { useRouter } from "nextjs-toploader/app";

function page() {
  const router = useRouter();

  router.push("https://roxstein.ch/");
  return (
    <div className="w-screen h-screen flex items-center justify-center font-semibold "></div>
  );
}

export default page;
