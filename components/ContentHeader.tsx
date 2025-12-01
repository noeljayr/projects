import React from "react";
import logo from "@/public/logo.png";
import Image from "next/image";
import { IconChevronDown } from "@tabler/icons-react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

function ContentHeader() {
  return (
    <div className="flex items-center">
      <Link
        href={"/"}
         style={{
            transition: "ease 0.5s",
            fontSize: 'calc(var(--p3) * 0.9)'
        }}
        className="flex items-center gap-2  rounded-[0.35rem] h-[2rem] font-medium"
      >
        <ChevronLeft className="h-4 w-4 " />
        Start
      </Link>
      <Image
        src={logo}
        alt="logo"
        className="h-12 w-12 ml-auto object-contain"
      />
    </div>
  );
}

export default ContentHeader;
