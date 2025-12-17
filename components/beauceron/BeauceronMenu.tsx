"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { categoryToSlug } from "@/lib/categorySlug";
import { usePathname, useSearchParams } from "next/navigation";
import { IconChevronDown } from "@tabler/icons-react";
import { NavbarContent } from "@/types/navbar";
import { Beauceron } from "@/types/Beauceron";

type Props = {
  content: NavbarContent;
};

function BeauceronMenu({ content }: Props) {
  const [beauceron, setBeauceron] = useState<Beauceron[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";

  const addEditModeParam = (href: string) => {
    return isEditMode ? `${href}?mode=edit` : href;
  };

  useEffect(() => {
    const fetchBeauceron = async () => {
      try {
        const response = await fetch("/api/beauceron/list");
        const data = await response.json();
        if (data.success) {
          setBeauceron(data.beauceron);
        }
      } catch (error) {
        console.error("Error fetching beauceron:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBeauceron();
  }, []);

  const activeLink = (href: string) => {
    if (href === "/vomsauterhof") {
      return pathname === "/vomsauterhof";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex group flex-col relative">
      <Link
        href={addEditModeParam("/vomsauterhof/unsere-beauceron")}
        className={`text-black font-medium  px-3 py-2 ${
          activeLink("/vomsauterhof/unsere-beauceron")
            ? "bg-[#EEE5DD] border border-[#D5BEAA]"
            : "bg-[#DBC6B3]"
        } hover:brightness-[0.97] rounded-full cursor-pointer flex justify-center items-center leading-[0] transition-[filter,background-color] h-[2rem] duration-150`}
      >
        {content.linkBreed || "Unsere Beauceron"}

        <IconChevronDown className="h-4 w-4 ml-2 opacity-75" />
      </Link>
      {!loading && (
        <div
          style={{
            transition: "ease 0.5s",
          }}
          className="absolute opacity-0 group-hover:opacity-100 invisible group-hover:visible top-[50%] group-hover:top-[104%] flex flex-col p-2 w-[16rem] right-0 rounded-[0.65rem] space-y-2 bg-[#FBF2EA] shadow-sm border"
        >
          {beauceron.map((b, index) => (
            <Link
              key={index}
              href={`/vomsauterhof/unsere-beauceron/${b.slug}`}
              className="hover:underline capitalize font-p4"
            >
              {b.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default BeauceronMenu;
