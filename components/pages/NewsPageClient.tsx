"use client";

import { IconSearch } from "@tabler/icons-react";
import React, { useState, useMemo } from "react";
import { News } from "@/types/News";
import NewsCard from "@/components/news/NewsCard";

type Props = {
  content: {
    searchPlaceholder?: string;
    sortNewest?: string;
    sortOldest?: string;
  };
  news: News[];
};

export default function NewsPageClient({ content, news }: Props) {
  const [sort, setSort] = useState<"new" | "old">("new");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAndSortedNews = useMemo(() => {
    let filtered = news;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sort === "new" ? dateB - dateA : dateA - dateB;
    });

    return sorted;
  }, [news, searchQuery, sort]);

  return (
    <div className="flex flex-col section-container mx-auto">
      <div className="flex items-center max-sm:w-full max-sm:flex-col max-sm:gap-4 justify-between mb-12">
        <div className="grid grid-cols-[1fr_auto] max-sm:w-full p-1 border border-[var(--c-border)] rounded-[0.5rem] w-[20rem] bg-[#EEE2D7]">
          <input
            type="text"
            placeholder={content.searchPlaceholder || "Search"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="outline-0 border-0 bg-transparent h-full font-p3 pl-2 font-medium w-full"
          />
          <button className="bg-[#58483B] h-[1.8rem] w-[1.8rem] cursor-pointer rounded-[0.35rem] flex items-center justify-center">
            <IconSearch className="h-4 w-4 opacity-75 " color="white" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1 items-center ml-auto bg-[#FBF1EA] border border-[var(--c-border)] rounded-[0.65rem] w-[18rem] max-sm:w-full p-1">
          <span
            style={{ transition: "ease 0.5s" }}
            onClick={() => setSort("new")}
            className={`h-8 flex items-center justify-center cursor-pointer rounded-[0.45rem] font-medium ${
              sort == "new" ? "bg-[#58483B] text-white" : ""
            }`}
          >
            {content.sortNewest || "Neueste zuerst"}
          </span>
          <span
            style={{ transition: "ease 0.5s" }}
            onClick={() => setSort("old")}
            className={`h-8 flex items-center justify-center cursor-pointer rounded-[0.45rem] font-medium ${
              sort == "old" ? "bg-[#58483B] text-white" : ""
            }`}
          >
            {content.sortOldest || "Älteste zuerst"}
          </span>
        </div>
      </div>

      <div className="news-grid grid grid-cols-1 relative gap-y-6 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredAndSortedNews.map((n) => (
          <NewsCard news={n} key={n.id} />
        ))}

        {filteredAndSortedNews.length == 0 && (
          <div
            className="font-p3 w-full absolute
          h-[16rem] opacity-75 flex items-center justify-center"
          >
            Wir konnten das nicht finden.
          </div>
        )}
      </div>
    </div>
  );
}
