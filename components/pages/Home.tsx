"use client";

import NewsCard from "@/components/news/NewsCard";
import { Button } from "@/components/ui/button";
import { News } from "@/types/News";
import { IconArrowUpRight } from "@tabler/icons-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import EditableText from "@/components/EditableText";
import EditableImage from "@/components/EditableImage";
import paw from "@/public/pawprint.png";
import paw2 from "@/public/paw-2.png";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type HomepageContent = {
  heroTitle?: string;
  heroDescription?: string;
  heroButtonText?: string;
  contentHeading?: string;
  contentSubheading?: string;
  whyBreedTitle?: string;
  whyBreedDescription?: string;
  feature1?: string;
  feature2?: string;
  feature3?: string;
  feature4?: string;
  feature5?: string;
  feature6?: string;
  darkSectionTitle?: string;
  darkSectionDescription?: string;
  newsHeading?: string;
  newsSeeAllText?: string;
  newsSeeAllSubtext?: string;
};

type SiteImages = {
  darkSection1?: string;
  darkSection2?: string;
  darkSection3?: string;
  darkSection4?: string;
  gallery1?: string;
  gallery2?: string;
  gallery3?: string;
  whyBreedDog?: string;
};

type Props = {
  content: HomepageContent;
  news: News[];
  images: SiteImages;
};

export default function Home({ content, news, images }: Props) {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const darkSectionRef = useRef<HTMLElement>(null);
  const newsRef = useRef<HTMLElement>(null);

  function useWindowWidth(debounceTime = 200) {
    const [width, setWidth] = useState(
      typeof window !== "undefined" ? window.innerWidth : 0
    );

    useEffect(() => {
      let timeoutId: NodeJS.Timeout;
      const handleResize = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => setWidth(window.innerWidth), debounceTime);
      };
      window.addEventListener("resize", handleResize);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("resize", handleResize);
      };
    }, [debounceTime]);

    return width;
  }

  const width = useWindowWidth();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroTextRef.current) {
        const children = heroTextRef.current.children;
        if (children && children.length > 0) {
          gsap.fromTo(
            Array.from(children),
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.2,
              ease: "power3.out",
              delay: 0.3,
            }
          );
        }
      }

      if (heroImageRef.current) {
        gsap.fromTo(
          heroImageRef.current,
          { x: 100, opacity: 0, scale: 0.8 },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "power3.out",
            delay: 0.5,
          }
        );

        gsap.to(heroImageRef.current, {
          y: -10,
          duration: 2,
          ease: "power2.inOut",
          yoyo: true,
          repeat: -1,
          scrollTrigger: {
            trigger: heroImageRef.current,
            start: "top bottom",
            toggleActions: "play pause resume reset",
          },
        });
      }

      if (galleryRef.current) {
        const children = galleryRef.current.children;
        if (children && children.length > 0) {
          gsap.fromTo(
            Array.from(children),
            { y: 80, opacity: 0, scale: 0.9 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.8,
              stagger: 0.15,
              ease: "power3.out",
              scrollTrigger: {
                trigger: galleryRef.current,
                start: "top 80%",
                end: "bottom 20%",
              },
            }
          );
        }
      }

      if (contentRef.current) {
        const contentH2 = contentRef.current.querySelector("h2");
        const contentP = contentRef.current.querySelector("p");
        const contentCard = contentRef.current.querySelector(".content-card");
        const featureItems =
          contentRef.current.querySelectorAll(".feature-item");

        if (contentH2) {
          gsap.fromTo(
            contentH2,
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: contentRef.current,
                start: "top 80%",
              },
            }
          );
        }

        if (contentP) {
          gsap.fromTo(
            contentP,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              delay: 0.2,
              ease: "power3.out",
              scrollTrigger: {
                trigger: contentRef.current,
                start: "top 80%",
              },
            }
          );
        }

        if (contentCard) {
          gsap.fromTo(
            contentCard,
            { y: 60, opacity: 0, scale: 0.95 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 1,
              delay: 0.4,
              ease: "power3.out",
              scrollTrigger: {
                trigger: contentRef.current,
                start: "top 70%",
              },
            }
          );
        }

        if (featureItems.length > 0) {
          gsap.fromTo(
            featureItems,
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: contentCard,
                start: "top 60%",
              },
            }
          );
        }
      }

      if (darkSectionRef.current && width > 720) {
        const darkText = darkSectionRef.current.querySelector(".dark-text");
        const darkImages =
          darkSectionRef.current.querySelectorAll(".dark-image");

        if (darkText) {
          gsap.fromTo(
            darkText,
            { x: -50, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: darkSectionRef.current,
                start: "top 70%",
              },
            }
          );
        }

        if (darkImages.length > 0) {
          gsap.fromTo(
            darkImages,
            { y: 40, opacity: 0, scale: 0.9 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.7,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: darkSectionRef.current,
                start: "top 60%",
              },
            }
          );
        }
      }

      if (newsRef.current) {
        const newsH2 = newsRef.current.querySelector("h2");
        const newsGrid = newsRef.current.querySelector(".news-grid");
        const newsCards = newsRef.current.querySelectorAll(".news-card");

        if (newsH2) {
          gsap.fromTo(
            newsH2,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: newsRef.current,
                start: "top 80%",
              },
            }
          );
        }

        if (newsCards.length > 0) {
          gsap.fromTo(
            newsCards,
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
              stagger: 0.15,
              ease: "power3.out",
              scrollTrigger: {
                trigger: newsGrid,
                start: "top 70%",
              },
            }
          );
        }
      }

      const buttons = document.querySelectorAll("button, .hover-scale");
      buttons.forEach((button) => {
        button.addEventListener("mouseenter", () => {
          gsap.to(button, {
            scale: 1.05,
            duration: 0.3,
            ease: "power2.out",
          });
        });
        button.addEventListener("mouseleave", () => {
          gsap.to(button, { scale: 1, duration: 0.3, ease: "power2.out" });
        });
      });

      // Only apply parallax on desktop (width > 768px)
      if (width > 768) {
        gsap.utils.toArray(".parallax-section").forEach((section: any) => {
          gsap.to(section, {
            yPercent: -20,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        });
      }
    });

    return () => ctx.revert();
  }, [width]);

  useEffect(() => {
    // Set initial state
    document.body.setAttribute("data-content-loaded", "false");

    ScrollTrigger.refresh();
    // Mark content as loaded after a short delay to ensure everything is rendered
    const timer = setTimeout(() => {
      setIsContentLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Add a data attribute to indicate when content is loaded
  useEffect(() => {
    if (isContentLoaded) {
      document.body.setAttribute("data-content-loaded", "true");
    }
  }, [isContentLoaded]);

  return (
    <main className="flex flex-col overflow-x-hidden min-h-screen">
      {/* Hero Section */}
      <div className="bg-[#BEA99A] border-b-[#BEA99A40] overflow-hidden relative pt-[10rem]">
        <Image
          src={paw}
          style={{
            rotate: "194deg",
          }}
          alt=""
          className="absolute w-40 opacity-5 -top-8 -left-6 hidden md:block"
        />
        <section ref={heroRef} className="px-4 pt-6 md:pt-16 pb-32">
          <div className="section-container mx-auto grid md:flex gap-8 lg:gap-12 items-start w-full">
            <div ref={heroTextRef} className="z-10  flex flex-col relative">
              <EditableText
                initialValue={content.heroTitle || ""}
                fieldName="heroTitle"
                isEditMode={isEditMode}
                className="w-[17ch] text-4xl md:text-4xl hero-heading lg:text-5xl xl:text-6xl font-bold text-black mb-2 md:mb-2 leading-tight max-sm:w-[85vw]"
                as="h1"
                multiline
              />
              <EditableText
                initialValue={content.heroDescription || ""}
                fieldName="heroDescription"
                isEditMode={isEditMode}
                className="text-black text-base md:text-lg mb-6 w-[40ch] md:mb-8 leading-relaxed max-sm:w-[85vw]"
                as="p"
                multiline
              />
              <a
                target="_blank"
                href={"mailto:ti.genoveva@bluewin.ch"}
                className="text-white relative z-1 w-fit font-bold px-6 md:px-8 py-3 h-[2.85rem] text-sm md:text-base rounded-[0.65rem] hover:opacity-90 bg-[#58483B] transition-all duration-300"
              >
                <EditableText
                  initialValue={content.heroButtonText || ""}
                  fieldName="heroButtonText"
                  isEditMode={isEditMode}
                  className="text-white font-bold"
                  as="span"
                />
              </a>
            </div>
            <div
              ref={heroImageRef}
              className="h-full md:absolute md:top-0 lg:-top-7 md:right-0 md:h-[400px] lg:h-[500px] xl:h-[620px]"
            >
              <Image
                src="/hero.png"
                alt="Rottweiler puppies"
                width={500}
                height={500}
                className="object-cover h-full w-full md:-top-10 mx-auto lg:w-[550px]"
              />
            </div>
            <Image
              src={paw}
              alt=""
              className="absolute w-20 bottom-10 opacity-10 z-0"
            />

            <Image
              src={paw}
              alt=""
              className="absolute w-20 bottom-0 left-70 opacity-10 z-0"
            />
          </div>
        </section>
      </div>

      <section className="section-container relative py-12 pb-0 md:py-20 mx-auto mt-15">
        <Image
          src={paw}
          alt=""
          className="absolute w-25 -top-2 right-0 opacity-10 z-0"
        />
        <Image
          src={paw}
          alt=""
          className="absolute w-25 top-25 -right-40 opacity-10 z-0"
        />
        <Image
          src={paw}
          alt=""
          className="absolute w-25 top-25 rotate-[90deg] -left-40 opacity-10 z-0"
        />
        <div
          ref={galleryRef}
          className="grid grid-cols-1 relative z-1 md:grid-cols-7 gap-4 md:gap-6 mb-8"
        >
          <div className="relative h-[250px] md:h-[374px] md:col-span-2 hover-scale cursor-pointer">
            <EditableImage
              initialSrc={images.gallery1 || "/section-2.1-img.png"}
              fieldName="gallery1"
              isEditMode={isEditMode}
              alt="Rottweiler puppies in field"
              fill
              className="object-cover rounded-lg transition-all duration-500"
            />
          </div>
          <div className="relative h-[250px] md:h-[374px] md:col-span-3 hover-scale cursor-pointer">
            <EditableImage
              initialSrc={images.gallery2 || "/section-2.2-img.png"}
              fieldName="gallery2"
              isEditMode={isEditMode}
              alt="Person with dogs in mountains"
              fill
              className="object-cover rounded-lg transition-all duration-500"
            />
          </div>
          <div className="relative h-[250px] md:h-[374px] md:col-span-2 hover-scale cursor-pointer">
            <EditableImage
              initialSrc={images.gallery3 || "/section-2.3-img.png"}
              fieldName="gallery3"
              isEditMode={isEditMode}
              alt="Dogs on mountain rocks"
              fill
              className="object-cover rounded-lg transition-all duration-500"
            />
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section ref={contentRef} className="md:pt-12 pb-20 md:pb-28">
        <div className="section-container mx-auto text-center">
          <div className="flex flex-col items-center">
            <EditableText
              initialValue={content.contentHeading || ""}
              fieldName="contentHeading"
              isEditMode={isEditMode}
              className="text-2xl md:text-3xl font-bold text-black"
              as="h3"
            />
            <EditableText
              initialValue={content.contentSubheading || ""}
              fieldName="contentSubheading"
              isEditMode={isEditMode}
              className="text-black opacity-75 text-base md:text-lg mb-8 md:mb-12 max-w-3xl mx-auto px-4"
              as="p"
              multiline
            />
          </div>

          <div className="content-card grid lg:grid-flow-col gap-8 lg:gap-[100px] justify-center items-center bg-[#fff]/25 rounded-[20px] md:rounded-[30px] py-8 md:py-16 w-full mx-auto max-w-6xl border border-[#BEA99A4D] md:px-16">
            <div className="relative w-40 h-40 md:w-60 md:h-60 after:w-40 after:h-40 md:after:w-60 md:after:h-60 after:rounded-full after:border-[#C09877] after:border-2 md:after:border-3 after:absolute after:top-2 after:-left-2 after:z-[0] mx-auto">
              <EditableImage
                initialSrc={images.whyBreedDog || "/why-breed-dogs.png"}
                fieldName="whyBreedDog"
                isEditMode={isEditMode}
                alt="Dog portrait"
                fill
                className="object-cover rounded-full z-[2] shrink-0"
              />
            </div>

            <div className="text-center lg:text-left px-4 lg:px-0">
              <div className="flex flex-col mb-6">
                <EditableText
                  initialValue={content.whyBreedTitle || ""}
                  fieldName="whyBreedTitle"
                  isEditMode={isEditMode}
                  className="text-xl md:text-2xl max-sm:w-full max-sm:text-left font-bold text-black"
                  as="h4"
                />
                <EditableText
                  initialValue={content.whyBreedDescription || ""}
                  fieldName="whyBreedDescription"
                  isEditMode={isEditMode}
                  className="text-black w-[50ch] max-sm:w-full max-sm:text-left text-sm font-p3 opacity-75"
                  as="p"
                  multiline
                />
              </div>

              <div className="grid  max-sm:grid-cols-2 max-[350px]:flex max-[350px]:flex-col mx-auto sm:grid-cols-3 gap-3 md:gap-4 max-w-md max-sm:w-full lg:max-w-none mx-auto">
                <div className="feature-item flex items-center space-x-2">
                  <div className="size-8 md:size-10 flex justify-center items-center bg-[#F1D4BB]/25 rounded-full">
                    <Image
                      src={"/why/gesund.svg"}
                      width={18}
                      height={18}
                      alt=""
                      className="md:w-6 md:h-6"
                    />
                  </div>
                  <EditableText
                    initialValue={content.feature1 || ""}
                    fieldName="feature1"
                    isEditMode={isEditMode}
                    className="text-black text-sm md:text-base"
                    as="span"
                  />
                </div>
                <div className="feature-item flex items-center space-x-2">
                  <div className="size-8 md:size-10 flex justify-center items-center bg-[#F1D4BB]/25 rounded-full">
                    <Image
                      src={"/why/freundliche.svg"}
                      width={18}
                      height={18}
                      alt=""
                      className="md:w-6 md:h-6"
                    />
                  </div>
                  <EditableText
                    initialValue={content.feature2 || ""}
                    fieldName="feature2"
                    isEditMode={isEditMode}
                    className="text-black text-sm md:text-base"
                    as="span"
                  />
                </div>
                <div className="feature-item flex items-center space-x-2">
                  <div className="size-8 md:size-10 flex justify-center items-center bg-[#F1D4BB]/25 rounded-full">
                    <Image
                      src={"/why/sportlich.svg"}
                      width={18}
                      height={18}
                      alt=""
                      className="md:w-6 md:h-6"
                    />
                  </div>
                  <EditableText
                    initialValue={content.feature3 || ""}
                    fieldName="feature3"
                    isEditMode={isEditMode}
                    className="text-black text-sm md:text-base"
                    as="span"
                  />
                </div>
                <div className="feature-item flex items-center space-x-2">
                  <div className="size-8 md:size-10 flex justify-center items-center bg-[#F1D4BB]/25 rounded-full">
                    <Image
                      src={"/why/aktiv.svg"}
                      width={18}
                      height={18}
                      alt=""
                      className="md:w-6 md:h-6"
                    />
                  </div>
                  <EditableText
                    initialValue={content.feature4 || ""}
                    fieldName="feature4"
                    isEditMode={isEditMode}
                    className="text-black text-sm md:text-base"
                    as="span"
                  />
                </div>
                <div className="feature-item flex items-center space-x-2">
                  <div className="size-8 md:size-10 flex justify-center items-center bg-[#F1D4BB]/25 rounded-full">
                    <Image
                      src={"/why/will-to-please.svg"}
                      width={18}
                      height={18}
                      alt=""
                      className="md:w-6 md:h-6"
                    />
                  </div>
                  <EditableText
                    initialValue={content.feature5 || ""}
                    fieldName="feature5"
                    isEditMode={isEditMode}
                    className="text-black text-sm md:text-base"
                    as="span"
                  />
                </div>
                <div className="feature-item flex items-center space-x-2">
                  <div className="size-8 md:size-10 flex justify-center items-center bg-[#F1D4BB]/25 rounded-full">
                    <Image
                      src={"/why/power.svg"}
                      width={18}
                      height={18}
                      alt=""
                      className="md:w-6 md:h-6"
                    />
                  </div>
                  <EditableText
                    initialValue={content.feature6 || ""}
                    fieldName="feature6"
                    isEditMode={isEditMode}
                    className="text-black text-sm md:text-base"
                    as="span"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Section */}
      <section
        ref={darkSectionRef}
        className=" py-12 md:py-16 bg-[#58483B] relative min-h-[400px] md:min-h-screen flex items-center parallax-section"
      >
        <div className=" section-container  relative mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <Image
            src={paw2}
            alt=""
            className="absolute w-20 -top-35 left-0  z-0"
          />

          <Image
            src={paw2}
            alt=""
            className="absolute w-20 -top-45 -left-38  z-0"
          />

          <div className="dark-text text-center w-[43ch] max-[720px]:w-full lg:text-left">
            <EditableText
              initialValue={content.darkSectionTitle || ""}
              fieldName="darkSectionTitle"
              isEditMode={isEditMode}
              className="text-lg max-[720px]:text-center   md:text-xl font-bold text-white mb-4"
              as="h3"
              multiline
            />
            <EditableText
              initialValue={content.darkSectionDescription || ""}
              fieldName="darkSectionDescription"
              isEditMode={isEditMode}
              className="text-white mb-6 font-p3 w-[40ch] max-[720px]:w-full opacity-75 text-sm md:text-base"
              as="p"
              multiline
            />
          </div>
          <div className="grid grid-cols-2 right-0 max-lg:static lg:absolute grid-rows-5 gap-3 md:gap-4 h-[350px] md:h-[475px] max-w-[561px] w-full ml-auto lg:mx-0">
            <div className="dark-image relative h-full row-span-2">
              <EditableImage
                initialSrc={images.darkSection1 || "/section-3.1.png"}
                fieldName="darkSection1"
                isEditMode={isEditMode}
                alt="Person with dog"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="dark-image relative h-full row-span-3">
              <EditableImage
                initialSrc={images.darkSection3 || "/section-3.3.png"}
                fieldName="darkSection3"
                isEditMode={isEditMode}
                alt="Child with puppy"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="dark-image relative h-full row-span-3">
              <EditableImage
                initialSrc={images.darkSection2 || "/section-3.2.png"}
                fieldName="darkSection2"
                isEditMode={isEditMode}
                alt="Woman with puppy"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="dark-image relative h-full row-span-2">
              <EditableImage
                initialSrc={images.darkSection4 || "/section-3.4.png"}
                fieldName="darkSection4"
                isEditMode={isEditMode}
                alt="Dogs running"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section ref={newsRef} className=" py-12 md:py-20 ">
        <div className="mx-auto flex flex-col items-center">
          <EditableText
            initialValue={content.newsHeading || ""}
            fieldName="newsHeading"
            isEditMode={isEditMode}
            className="text-2xl md:text-3xl font-bold mx-auto text-black text-center mb-8 md:mb-12"
            as="h2"
          />

          <div className="news-grid grid grid-cols-1  section-container mx-auto md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {news.slice(0, 3).map((n) => (
              <NewsCard color={undefined} news={n} key={n.id} />
            ))}
          </div>

          {news.length > 3 && (
            <div className="mt-8 md:mt-5">
              <div className="border border-[#1A1A1A1A] rounded-full flex p-1 pr-2 items-center justify-center w-fit mx-auto hover-scale cursor-pointer">
                <div className="flex items-center relative w-[7rem]">
                  {news.slice(3, 6).map((n, index) => (
                    <span
                      key={n.id || index}
                      className={`h-10 w-10 rounded-full overflow-hidden border-[3px] border-[#F9ECE1] absolute`}
                      style={{
                        left: `${index * 1.75}rem`, // controls overlap amount
                        zIndex: news.length - index, // ensures proper stacking order
                      }}
                    >
                      <img
                        src={`${n.coverImage}`}
                        alt={n.title}
                        className="h-full w-full object-cover"
                      />
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-1 text-xs mr-4">
                  <b>
                    <EditableText
                      initialValue={content.newsSeeAllText || ""}
                      fieldName="newsSeeAllText"
                      isEditMode={isEditMode}
                      className="inline"
                      as="span"
                    />{" "}
                    <span className="text-[#D87B2C]">{news.length}+</span>
                  </b>
                  <b className="flex items-center opacity-35">
                    <EditableText
                      initialValue={content.newsSeeAllSubtext || ""}
                      fieldName="newsSeeAllSubtext"
                      isEditMode={isEditMode}
                      className="inline"
                      as="span"
                    />{" "}
                    <IconArrowUpRight className="ml-1 h-4 w-4" />
                  </b>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
