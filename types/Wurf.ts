export type Wurf = {
  id: string;
  slug: string;
  name: string;
  information: string;
  image: string;
  category: string;
  documents: {
    stammbaum?: string;
    workingDog?: string;
    arbeit?: string;
  };
  status: string;
};
