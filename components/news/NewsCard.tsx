"use client";

import { IconCalendarWeek, IconVideo } from "@tabler/icons-react";

import Link from "next/link";

import { News } from "@/types/News";
import { ArrowRight } from "lucide-react";
import { formatDate2 } from "@/lib/formatDate";

type Props = {
  news: News;
  color?: string;
};

function NewsCard({ news, color }: Props) {
  // Strip HTML tags from content
  const stripHtml = (html: string) => {
    if (typeof window === "undefined") {
      // Server-side: use regex to strip HTML tags
      return html.replace(/<[^>]*>/g, "");
    }
    // Client-side: use DOM API
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const plainTextContent = stripHtml(news.content);

  return (
    <Link href={`/vomsauterhof/news/${news.slug}`}>
      <img
        src={`${news.coverImage}`}
        alt={news.title}
        className="w-full aspect-[4_/_3.7] object-cover rounded-[0.75rem] mb-2"
      />
      <div className="flex flex-col gap-2">
        <div className="flex  h-[1.9rem] w-full relative items-center justify-between">
          <div className="flex items-center opacity-50">
            <IconCalendarWeek color={color || "#000"} className="h-4 w-4" />
            <span
              style={{
                color: `${color ? color : "#000"}`,
              }}
              className={`ml-2 font-p4`}
            >
              {formatDate2(news.date)}
            </span>
          </div>

          {news.hasVideo && (
            <span
              className={`px-2 py-1 right-0 ${
                color ? "brightness-150" : ""
              } flex items-center text-white rounded-4xl font-p4 font-semibold bg-[#58483B]`}
            >
              <IconVideo className="h-4 w-4 mr-2 opacity-75" color="white" />
              <span className="opacity-75">Video</span>
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <span
            style={{
              color: `${color ? color : "#000"}`,
            }}
            className={`font-semibold truncate`}
          >
            {news.title}
          </span>
          <p
            style={{
              color: `${color ? color : "#000"}`,
            }}
            className={`font-p3 opacity-45 mt-2  w-full line-clamp-2`}
          >
            {plainTextContent}
          </p>
        </div>

        <span className="font-p4 flex items-center space-x-2">
          <span className="font-semibold text-[#CD6917]">Mehr lesen</span>
          <ArrowRight className="h-4 w-4" color="#CD6917" />
        </span>
      </div>
    </Link>
  );
}

export default NewsCard;
