"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { categoryToSlug } from "@/lib/categorySlug";
import { usePathname, useSearchParams } from "next/navigation";
import { IconChevronDown } from "@tabler/icons-react";
import { NavbarContent } from "@/types/navbar";

type Props = {
  content: NavbarContent;
};

function WurfMenu({ content }: Props) {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";

  const addEditModeParam = (href: string) => {
    return isEditMode ? `/vomsauterhof${href}?mode=edit` : href;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/wurf/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
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
        href={addEditModeParam("/wurf")}
        className={`text-black font-medium  px-5 py-2 ${
          activeLink("/vomsauterhof/wurf")
            ? "bg-[#EEE5DD] border border-[#D5BEAA]"
            : "bg-[#DBC6B3]"
        } hover:brightness-[0.97] rounded-full cursor-pointer flex justify-center items-center leading-[0] transition-[filter,background-color] h-[2rem] duration-150`}
      >
        {content.linkWurf || "Wurf"}

        <IconChevronDown className="h-4 w-4 ml-2 opacity-75" />
      </Link>
      {!loading && (
        <div
          style={{
            transition: "ease 0.5s",
          }}
          className="absolute opacity-0 group-hover:opacity-100 invisible group-hover:visible top-[50%] group-hover:top-[104%] flex flex-col p-2 w-25 right-0 rounded-[0.65rem] space-y-2 bg-[#FBF2EA] shadow-sm border"
        >
          {categories.map((category, index) => (
            <Link
              key={index}
              href={`/vomsauterhof/wurf/${categoryToSlug(category)}`}
              className="hover:underline capitalize"
            >
              {category}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default WurfMenu;
