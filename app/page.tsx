"use client";

import { useRouter } from "next/navigation";

function page() {
  const router = useRouter();

  router.push("https://roxstein.ch/");
  return (
    <div className="w-screen h-screen bg-red-500 flex items-center justify-center font-semibold "></div>
  );
}

export default page;
