"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import Parteners from "./Parteners";
import { FooterContent } from "@/types/footer";
import { usePathname } from "next/navigation";

type Props = {
  content: FooterContent;
};

export function Footer({ content }: Props) {
  const footerRef = useRef<HTMLElement>(null);
  const pathname = usePathname()

  

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (footerRef.current) {
        const firstChild = footerRef.current.children[0] as HTMLElement;
        if (
          firstChild &&
          firstChild.children &&
          firstChild.children.length > 0
        ) {
          gsap.fromTo(
            Array.from(firstChild.children),
            { y: 60, opacity: 0, scale: 0.9 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 1.4,
              stagger: 0.25,
              ease: "power2.out",
              scrollTrigger: {
                trigger: footerRef.current,
                start: "top 90%",
              },
            }
          );
        }
      }
    });

    return () => ctx.revert();
  }, []);


  if(pathname.startsWith('/content') || pathname.startsWith('/auth')){
    return <></>
  }

  return (
    <div className="flex flex-col mt-auto">
      <Parteners />
      <footer
        ref={footerRef}
        className="px-4 py-10 mt-12 md:py-12 bg-[#BFA999D9]"
      >
        <div className="section-container mx-auto flex flex-col md:flex-row justify-between gap-10 md:gap-8 min-h-[200px]">
          <div className="space-y-6 md:space-y-5 text-[#141414]">
            <div>
              <h3 className="font-bold mb-5 text-xl md:text-base">
                {content.companyName}
              </h3>
              <p className="mb-3 text-base md:text-base leading-relaxed">
                {content.address1 || "Mühlerain 873"}
              </p>
              <p className="mb-3 text-base md:text-base leading-relaxed">
                {content.address2 || "CH-9116 Wolfertswil SG"}
              </p>
            </div>

            <div className="pt-3">
              <p className="mb-3 text-base md:text-base font-medium">
                {content.phone || "079 770 49 24"}
              </p>
              <a
                href={`mailto:${content.email || "ti.genoveva@bluewin.ch"}`}
                className="text-base md:text-base font-medium underline"
              >
                {content.email || "ti.genoveva@bluewin.ch"}
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-[#141414] mb-5 text-sm">
              {content.linksHeading || "Links"}
            </h3>
            <ul className="space-y-4 md:space-y-3 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:underline transition-all duration-300 block"
                >
                  {content.linkStart || "Start"}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:underline transition-all duration-300 block"
                >
                  {content.linkAbout || "Über uns"}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:underline transition-all duration-300 block"
                >
                  {content.linkNews || "News"}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:underline transition-all duration-300 block"
                >
                  {content.linkBeauceron || "unsere Beauceron"}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:underline transition-all duration-300 block"
                >
                  {content.linkWurf || "Wuif"}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
