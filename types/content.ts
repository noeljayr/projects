export interface ContentItem {
  _id?: string;
  key: string;
  value: string;
  category: string;
  page?: string;
  component?: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageContent {
  [key: string]: string;
}

export interface ContentCategory {
  navigation: string;
  hero: string;
  about: string;
  features: string;
  news: string;
  footer: string;
  buttons: string;
  forms: string;
  meta: string;
}

export type ContentKey = keyof ContentCategory;
