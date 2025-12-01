export type TimelineDog = {
  name: string;
  image: string;
};

export type TimelineEntry = {
  id: string;
  wurfId: string;
  date: string;
  title: string;
  dogs: TimelineDog[];
  createdAt?: Date;
  updatedAt?: Date;
};
