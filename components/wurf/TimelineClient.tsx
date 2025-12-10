"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { formatDate } from "@/lib/formatDate";

type TimelineDog = {
  name: string;
  image: string;
};

type TimelineEntry = {
  id: string;
  wurfId: string;
  date: string;
  title: string;
  description?: string;
  dogs: TimelineDog[];
  category: string;
};

type WelpenData = {
  information: string;
  date: string;
  title: string;
  dogs: TimelineDog[];
} | null;

type Props = {
  timeline: TimelineEntry[];
  welpen?: WelpenData;
  showFilters?: boolean;
};

function TimelineClient({ timeline, welpen, showFilters = false }: Props) {
  const [activeFilter, setActiveFilter] = useState("Alle");
  const [activeIndex, setActiveIndex] = useState(0);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dateRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dateContainerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (timeline.length === 0) return;

    // Create intersection observer to track which section is in view
    // Create intersection observer to track which section is in view
    const ratios = new Map<number, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = contentRefs.current.findIndex(
            (ref) => ref === entry.target
          );
          if (index !== -1) {
            ratios.set(index, entry.intersectionRatio);
          }
        });

        // Find the entry with highest intersection ratio among ALL tracked entries
        let maxRatio = 0;
        let maxIndex = -1;

        for (const [index, ratio] of ratios.entries()) {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            maxIndex = index;
          }
        }

        if (maxIndex !== -1) {
          setActiveIndex(maxIndex);
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: "-100px 0px -60% 0px",
      }
    );

    observerRef.current = observer;

    // Observe all content sections
    const currentRefs = contentRefs.current;
    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, [timeline]);

  // Auto-scroll active date into view on mobile
  useEffect(() => {
    const dateElement = dateRefs.current[activeIndex];
    const container = dateContainerRef.current;

    if (dateElement && container && window.innerWidth <= 900) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = dateElement.getBoundingClientRect();

      const scrollLeft =
        elementRect.left -
        containerRect.left +
        container.scrollLeft -
        containerRect.width / 2 +
        elementRect.width / 2;

      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  const scrollToSection = (index: number) => {
    contentRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  // Combine timeline and welpen data
  const allEntries: TimelineEntry[] = [...timeline];

  // Add welpen as a timeline entry if it exists and has data
  if (welpen && welpen.date && welpen.title && welpen.dogs.length > 0) {
    allEntries.push({
      id: "welpen",
      wurfId: "",
      date: welpen.date,
      title: welpen.title,
      dogs: welpen.dogs,
      category: "welpen",
    });
  }

  // Sort by date
  allEntries.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Filter based on active filter
  const filteredEntries = allEntries.filter((entry) => {
    if (activeFilter === "Alle") return true;
    if (activeFilter === "Welpen") return entry.category === "welpen";
    if (activeFilter === "Nachzucht") return entry.category === "nachzucht";
    return true;
  });

  if (filteredEntries.length === 0 && !showFilters) {
    return null;
  }

  // Transform timeline entries for display
  const timelineGroups = filteredEntries.map((entry) => ({
    date: entry.date,
    title: entry.title,
    description: entry.description,
    category: entry.category,
    dogs: entry.dogs.map((dog) => ({
      name: dog.name,
      image: dog.image || "/wurf/placeholder.jpg",
    })),
  }));

  return (
    <div className="section-container mx-auto">
      <div className="flex items-center mb-8 max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-4">
        <h3 className="font-bold">Zeitleiste</h3>
        {showFilters && (
          <div className="flex ml-auto max-[900px]:ml-0 p-1 bg-[#FBF2EA]/10 items-center cursor-pointer border border-black/10 rounded-full">
            {["Alle", "Welpen", "Nachzucht"].map((filter) => (
              <span
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  setActiveIndex(0);
                }}
                className={`px-6 py-1.5 cursor-pointer capitalize rounded-full text-sm font-medium transition-colors ${
                  filter === activeFilter ? "bg-[#58483B] text-white" : ""
                }`}
              >
                {filter}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Timeline Content */}
      <div className="flex gap-8 relative max-[900px]:flex-col">
        {/* Left Sidebar - Dates (Sticky) */}
        <div
          ref={dateContainerRef}
          className="sticky top-32 max-[900px]:top-27 z-[2] max-[900px]:bg-[#F9ECE1] max-[900px]:w-full self-start flex max-[900px]:gap-0  flex-col max-[900px]:py-2  max-[900px]:flex-row h-fit max-[900px]:overflow-x-auto max-[900px]:whitespace-nowrap"
        >
          {timelineGroups.map((entry, index) => (
            <div
              key={index}
              ref={(el) => {
                dateRefs.current[index] = el;
              }}
              className="flex flex-col max-[900px]:flex-row max-[900px]:gap-0"
            >
              <motion.div
                className="flex items-center gap-4 max-[900px]:gap-0 cursor-pointer"
                onClick={() => scrollToSection(index)}
                transition={{ duration: 0.3 }}
                style={{
                  transition: "ease 0.5s",
                }}
              >
                <motion.span
                  className="h-5 w-5  max-[900px]:h-4  max-[900px]:w-4 rounded-full border-[3px]  max-[900px]:border-[2px] flex-shrink-0"
                  animate={{
                    backgroundColor:
                      activeIndex === index ? "#58483B" : "#F9ECE1",
                    borderColor: activeIndex === index ? "#D6CBC2" : "#D6CBC2",
                  }}
                  style={{
                    transition: "ease 0.5s",
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="w-[8rem] font-medium border py-2 rounded-[2rem] text-center"
                  style={{
                    fontSize: "calc(var(--p4) * 0.9)",
                    transition: "ease 0.5s",
                  }}
                  animate={{
                    backgroundColor:
                      activeIndex === index ? "#58483B" : "white",
                    color: activeIndex === index ? "white" : "black",
                    borderColor:
                      activeIndex === index ? "#58483B" : "var(--c-border)",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {formatDate(entry.date)}
                </motion.span>
              </motion.div>

              {index !== timelineGroups.length - 1 && (
                <div className="flex flex-col  w-5 relative max-[900px]:w-8 items-center max-[900px]:justify-center">
                  <div className="w-[2px] h-8 max-[900px]:h-[2px] max-[900px]:w-8 bg-[#D4C9BF]"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Content - Timeline Entries */}
        <div className="flex-1 flex flex-col gap-8">
          {timelineGroups.map((entry, index) => (
            <motion.div
              key={index}
              ref={(el) => {
                contentRefs.current[index] = el;
              }}
              className="bg-[#F7E4D4] border border-[#F1D1B6] rounded-2xl p-6 pt-4 relative max-[900px]:p-3"
            >
              <div className="flex items-center mb-4">
                <h3 className="text-xl font-semibold mr-auto">{entry.title}</h3>
                {showFilters && (
                  <span
                    className={`right-4 h-[1.8rem] flex items-center text-white text-xs px-3 py-1 rounded-full ${
                      entry.category === "welpen"
                        ? "bg-[#58483B]"
                        : "bg-[#58483B]"
                    }`}
                  >
                    {entry.category === "welpen" ? "Welpen" : "Nachzucht"}
                  </span>
                )}
              </div>

              {entry.description && (
                <p className="text-sm text-gray-700 mb-6 whitespace-pre-wrap">
                  {entry.description}
                </p>
              )}

              {/* Dog Images Grid */}
              <div className="grid grid-cols-3 max-[900px]:grid-cols-2 max-sm:grid-cols-1 gap-y-8 gap-4">
                {entry.dogs.map((dog, dogIndex) => (
                  <div key={dogIndex} className="flex flex-col gap-2">
                    <div className="aspect-[3/4] bg-black/5 rounded-xl overflow-hidden">
                      <img
                        src={dog.image}
                        alt={dog.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {dog.name}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TimelineClient;
