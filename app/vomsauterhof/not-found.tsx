import notFound from "@/public/404.png";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function Page() {
  return (
    <div className="flex flex-col pt-[35vh] pb-[25vh] w-full items-center justify-center">
      <Image
        src={notFound}
        alt="not found"
        className="h-[10rem]  w-[10rem] oject-contain mb-2"
      />

      <span
        style={{ fontSize: "calc(var(--p3) * 0.8)" }}
        className="font-p4 opacity-65 text-center"
      >
        Wir konnten diese Seite <br /> nicht finden.
      </span>

      <Link
        href="/"
        className="bg-[#58483B] text-white font-medium px-4 py-2 h-[35px] md:h-[41px] text-sm md:text-base rounded-md hover:opacity-95 transition-opacity duration-150 flex items-center gap-1 mt-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Start
      </Link>
    </div>
  );
}

export default Page;
