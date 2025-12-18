export type News = {
  id: string;
  title: string;
  author: string;
  content: string;
  date: string;
  hasVideo: boolean;
  coverImage: string;
  slug: string;
  status: string;
};

export type PaginationMeta = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedNewsResponse = {
  success: boolean;
  news: News[];
  pagination: PaginationMeta;
  message?: string;
};
