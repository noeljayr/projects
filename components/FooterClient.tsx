"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import Parteners from "./Parteners";
import { FooterContent } from "@/types/footer";
import { usePathname, useSearchParams } from "next/navigation";
import EditableTextFooter from "./EditableTextFooter";
import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";

type Props = {
  content: FooterContent;
};

export function FooterClient({ content }: Props) {
  const footerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";
  const { userName, enabled, logout } = useAuthStore();
  const isLoggedIn = enabled && userName;
  const [shouldShow, setShouldShow] = useState(false);

  const addEditModeParam = (href: string) => {
    return isEditMode ? `${href}?mode=edit` : href;
  };

  useEffect(() => {
    // Check if content is loaded, if not wait for it
    const checkContentLoaded = () => {
      const isContentLoaded =
        document.body.getAttribute("data-content-loaded") === "true";
      if (
        isContentLoaded ||
        pathname.startsWith("/vomsauterhof/content") ||
        pathname.startsWith("/vomsauterhof/auth")
      ) {
        setShouldShow(true);
      } else {
        // Check again after a short delay
        setTimeout(checkContentLoaded, 100);
      }
    };

    // Initial check
    checkContentLoaded();

    const ctx = gsap.context(() => {
      if (footerRef.current && shouldShow) {
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
  }, [shouldShow, pathname]);

  if (
    pathname.startsWith("/vomsauterhof/content") ||
    pathname.startsWith("/vomsauterhof/auth") ||
    !shouldShow
  ) {
    return <></>;
  }

  return (
    <div className="flex flex-col mt-auto">
      <Parteners />
      <footer
        ref={footerRef}
        className="px-4 py-10 flex flex-col mt-12 md:py-12 bg-[#BEA99A] relative z-10"
        style={{ marginTop: "auto" }}
      >
        <div className="section-container pb-10 border-b border-b-[var(--c-border)] mx-auto flex flex-col md:flex-row justify-between gap-10 md:gap-8 min-h-[200px]">
          <div className="space-y-6 md:space-y-5 text-[#141414]">
            <div className="flex flex-col">
              <EditableTextFooter
                initialValue={content.companyName || "Familie Sauter"}
                fieldName="companyName"
                isEditMode={isEditMode}
                className="font-bold mb-5 text-xl w-fit md:text-base"
                as="h3"
              />
              <EditableTextFooter
                initialValue={content.address1 || "Mühlerain 873"}
                fieldName="address1"
                isEditMode={isEditMode}
                className="mb-3 text-base md:text-base leading-relaxed"
                as="p"
              />
              <EditableTextFooter
                initialValue={content.address2 || "CH-9116 Wolfertswil SG"}
                fieldName="address2"
                isEditMode={isEditMode}
                className="mb-3 text-base md:text-base leading-relaxed"
                as="p"
              />
            </div>

            <div className="pt-3 flex flex-col">
              <EditableTextFooter
                initialValue={content.phone || "079 770 49 24"}
                fieldName="phone"
                isEditMode={isEditMode}
                className="mb-3 text-base md:text-base font-medium"
                as="p"
              />
              <EditableTextFooter
                initialValue={content.email || "ti.genoveva@bluewin.ch"}
                fieldName="email"
                isEditMode={isEditMode}
                className="text-base md:text-base font-medium underline"
                as="a"
                href={`mailto:${content.email || "ti.genoveva@bluewin.ch"}`}
              />
            </div>
          </div>
          <div>
            <EditableTextFooter
              initialValue={content.linksHeading || "Links"}
              fieldName="linksHeading"
              isEditMode={isEditMode}
              className="font-bold text-[#141414] mb-5 text-sm"
              as="h3"
            />
            <ul className="space-y-4 md:space-y-3 text-sm">
              <li>
                <EditableTextFooter
                  initialValue={content.linkStart || "Start"}
                  fieldName="linkStart"
                  isEditMode={isEditMode}
                  className="hover:underline transition-all duration-300 block"
                  as="a"
                  href={addEditModeParam("/vomsauterhof/")}
                />
              </li>
              <li>
                <EditableTextFooter
                  initialValue={content.linkAbout || "Über uns"}
                  fieldName="linkAbout"
                  isEditMode={isEditMode}
                  className="hover:underline transition-all duration-300 block"
                  as="a"
                  href={addEditModeParam("/vomsauterhof/uber-uns")}
                />
              </li>
              <li>
                <EditableTextFooter
                  initialValue={content.linkNews || "News"}
                  fieldName="linkNews"
                  isEditMode={isEditMode}
                  className="hover:underline transition-all duration-300 block"
                  as="a"
                  href={addEditModeParam("/vomsauterhof/news")}
                />
              </li>
              <li>
                <EditableTextFooter
                  initialValue={content.linkBeauceron || "Unsere Beauceron"}
                  fieldName="linkBeauceron"
                  isEditMode={isEditMode}
                  className="hover:underline transition-all duration-300 block"
                  as="a"
                  href={addEditModeParam("/vomsauterhof/unsere-beauceron")}
                />
              </li>
              <li>
                <EditableTextFooter
                  initialValue={content.linkWurf || "Wuif"}
                  fieldName="linkWurf"
                  isEditMode={isEditMode}
                  className="hover:underline transition-all duration-300 block"
                  as="a"
                  href="#"
                />
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center section-container mx-auto mt-5">
          <Link
            style={{
              transition: "ease 0.5s",
              fontSize: "calc(var(--p3) * 0.9)",
            }}
            href={"https://roxstein.ch/"}
            target="_blank"
            className="font-p4 hover:underline cursor-pointer hover:opacity-100 opacity-50 mr-auto "
          >
            Entwickelt von Roxstein
          </Link>
          {!isLoggedIn && (
            <Link
              style={{
                transition: "ease 0.5s",
                fontSize: "calc(var(--p3) * 0.9)",
                backgroundColor: "#58483B",
              }}
              href={"/vomsauterhof/auth/login"}
              className="text-white font-medium px-4 md:px-6 py-2 h-[35px] md:h-[41px] text-sm md:text-base rounded-md hover:opacity-95 transition-opacity duration-150 flex items-center"
            >
              Login
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}
