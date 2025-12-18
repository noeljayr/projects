import { useState, useEffect } from "react";
import type { News, PaginatedNewsResponse } from "@/types/News";

interface UseNewsOptions {
  page?: number;
  limit?: number;
  status?: string;
  autoFetch?: boolean;
}

interface UseNewsReturn {
  news: News[];
  pagination: PaginatedNewsResponse["pagination"] | null;
  isLoading: boolean;
  error: string | null;
  fetchNews: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useNews(options: UseNewsOptions = {}): UseNewsReturn {
  const { page = 1, limit = 10, status, autoFetch = true } = options;

  const [news, setNews] = useState<News[]>([]);
  const [pagination, setPagination] = useState<
    PaginatedNewsResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) {
        params.append("status", status);
      }

      const response = await fetch(`/api/news/list?${params}`);
      const data: PaginatedNewsResponse = await response.json();

      if (data.success) {
        setNews(data.news);
        setPagination(data.pagination);
      } else {
        setError(data.message || "Failed to fetch news");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchNews();
    }
  }, [page, limit, status, autoFetch]);

  return {
    news,
    pagination,
    isLoading,
    error,
    fetchNews,
    refetch: fetchNews,
  };
}

export function usePublicNews(
  options: Omit<UseNewsOptions, "status"> = {}
): UseNewsReturn {
  const { page = 1, limit = 12, autoFetch = true } = options;

  const [news, setNews] = useState<News[]>([]);
  const [pagination, setPagination] = useState<
    PaginatedNewsResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/news/public?${params}`);
      const data: PaginatedNewsResponse = await response.json();

      if (data.success) {
        setNews(data.news);
        setPagination(data.pagination);
      } else {
        setError(data.message || "Failed to fetch news");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchNews();
    }
  }, [page, limit, autoFetch]);

  return {
    news,
    pagination,
    isLoading,
    error,
    fetchNews,
    refetch: fetchNews,
  };
}
