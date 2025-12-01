"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

function Parteners() {
  const partnersRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (partnersRef.current) {
        const firstChild = partnersRef.current.children[0] as HTMLElement;
        if (
          firstChild &&
          firstChild.children &&
          firstChild.children.length > 0
        ) {
          gsap.fromTo(
            Array.from(firstChild.children),
            { y: 50, opacity: 0, scale: 0.8 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 1.2,
              stagger: 0.15,
              ease: "back.out(1.7)",
              scrollTrigger: {
                trigger: partnersRef.current,
                start: "top 85%",
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
    });

    return () => ctx.revert();
  }, []);
  return (
    <section
      ref={partnersRef}
      className="px-4 pb-12 md:pb-16 pt-12 md:pt-[200px] bg-[#F9ECE1]"
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 lg:gap-12 opacity-60">
          <Image
            src={"/users/meiko.svg"}
            width={100}
            height={35}
            alt="Meiko"
            className="md:w-[130px] md:h-[44px] hover-scale cursor-pointer"
          />
          <Image
            src={"/users/the-good-stuff.svg"}
            width={80}
            height={25}
            alt="The Good Stuff"
            className="md:w-[100px] md:h-[30px] hover-scale cursor-pointer"
          />
          <Image
            src={"/users/flutterbox.svg"}
            width={100}
            height={35}
            alt="Flutterbox"
            className="md:w-[120px] md:h-[44px] hover-scale cursor-pointer"
          />
          <Image
            src={"/users/ipet.svg"}
            width={100}
            height={35}
            alt="iPet"
            className="md:w-[120px] md:h-[44px] hover-scale cursor-pointer"
          />
        </div>
      </div>
    </section>
  );
}

export default Parteners;
