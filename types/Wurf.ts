export interface WurfCategory {
  _id?: string;
  name: string;
  description: string;
  slug: string;
  status: "published" | "draft";
  createdAt: Date;
  updatedAt: Date;
}

export interface Wurf {
  id: string;
  name: string;
  information: string;
  image: string;
  category: string; // Legacy field - kept for backward compatibility
  categorySlug: string; // New field - references WurfCategory.slug
  documents: {
    stammbaum: string;
    workingDog: string;
    arbeit: string;
  };
  slug: string;
  status: "published" | "draft";
  createdAt: Date;
  updatedAt: Date;
}
