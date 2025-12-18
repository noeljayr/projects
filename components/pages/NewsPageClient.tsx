"use client";

import { IconSearch } from "@tabler/icons-react";
import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { News } from "@/types/News";
import NewsCard from "@/components/news/NewsCard";
import Pagination from "@/components/ui/Pagination";
import { updateSearchParams } from "@/lib/url-utils";

type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
};

type Props = {
  content: {
    searchPlaceholder?: string;
    sortNewest?: string;
    sortOldest?: string;
  };
  news: News[];
  paginationInfo: PaginationInfo;
  currentSearch: string;
  currentSort: string;
};

export default function NewsPageClient({
  content,
  news,
  paginationInfo,
  currentSearch,
  currentSort,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState(currentSearch);

  // Helper function to update URL with new parameters
  const updateURL = (updates: Record<string, string | number | null>) => {
    const newURL = updateSearchParams(searchParams, updates);
    startTransition(() => {
      router.push(`/vomsauterhof/news${newURL}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL({ search: searchQuery });
  };

  const handleSortChange = (newSort: "new" | "old") => {
    updateURL({ sort: newSort });
  };

  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  return (
    <div className="flex flex-col section-container mx-auto">
      <div className="flex items-center max-sm:w-full max-sm:flex-col max-sm:gap-4 justify-between mb-12">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-[1fr_auto] max-sm:w-full p-1 border border-[var(--c-border)] rounded-[0.5rem] w-[20rem] bg-[#EEE2D7]"
        >
          <input
            type="text"
            placeholder={content.searchPlaceholder || "Suchen..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="outline-0 border-0 bg-transparent h-full font-p3 pl-2 font-medium w-full"
          />
          <button
            type="submit"
            disabled={isPending}
            className="bg-[#58483B] h-[1.8rem] w-[1.8rem] cursor-pointer rounded-[0.35rem] flex items-center justify-center disabled:opacity-50"
          >
            <IconSearch className="h-4 w-4 opacity-75" color="white" />
          </button>
        </form>

        <div className="grid grid-cols-2 gap-1 items-center ml-auto bg-[#FBF1EA] border border-[var(--c-border)] rounded-[0.65rem] w-[18rem] max-sm:w-full p-1">
          <span
            style={{ transition: "ease 0.5s" }}
            onClick={() => handleSortChange("new")}
            className={`h-8 flex items-center justify-center cursor-pointer rounded-[0.45rem] font-medium ${
              currentSort === "new" ? "bg-[#58483B] text-white" : ""
            }`}
          >
            {content.sortNewest || "Neueste zuerst"}
          </span>
          <span
            style={{ transition: "ease 0.5s" }}
            onClick={() => handleSortChange("old")}
            className={`h-8 flex items-center justify-center cursor-pointer rounded-[0.45rem] font-medium ${
              currentSort === "old" ? "bg-[#58483B] text-white" : ""
            }`}
          >
            {content.sortOldest || "Älteste zuerst"}
          </span>
        </div>
      </div>

      {/* Results info */}

      <div className="news-grid grid grid-cols-1 relative gap-y-6 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {news.map((n) => (
          <NewsCard news={n} key={n.id} />
        ))}

        {news.length === 0 && (
          <div className="font-p3 w-full absolute h-[16rem] opacity-75 flex items-center justify-center">
            Wir konnten das nicht finden.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="w-full items-center flex mt-12">
        <Pagination
          currentPage={paginationInfo.currentPage}
          totalPages={paginationInfo.totalPages}
          onPageChange={handlePageChange}
          disabled={isPending}
        />

        <div className="text-sm  ml-auto">
          {paginationInfo.totalCount > 0 ? (
            <p>
              <span className="text-gray-600"> Anzeige von </span>
              <span className="font-bold">
                {(paginationInfo.currentPage - 1) * paginationInfo.limit + 1}{" "}
                bis{" "}
                {Math.min(
                  paginationInfo.currentPage * paginationInfo.limit,
                  paginationInfo.totalCount
                )}{" "}
                von {paginationInfo.totalCount}{" "}
              </span>
              <span className="text-gray-600">Nachrichten</span>
            </p>
          ) : (
            <>Na</>
          )}
        </div>
      </div>
    </div>
  );
}
