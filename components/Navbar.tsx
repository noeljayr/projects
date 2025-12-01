"use client";

import { Button } from "@/components/ui/button";
import { gsap } from "gsap";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import logo from "@/public/logo.svg";
import {
  IconCheck,
  IconChevronDown,
  IconLogout,
  IconNotes,
} from "@tabler/icons-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { NavbarContent } from "@/types/navbar";
import { useAuthStore } from "@/stores/useAuthStore";
import { AnimatePresence, motion } from "motion/react";
import { motionTransition } from "@/constants/motionTransition";

type Props = {
  content: NavbarContent;
};

export function Navbar({ content }: Props) {
  const headerRef = useRef<HTMLElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuOverlayRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isEditMode = searchParams.get("mode") === "edit";

  const [isScrolled, setIsScrolled] = useState(false);
  const { userName, enabled, logout } = useAuthStore();
  const isLoggedIn = enabled && userName;

  const addEditModeParam = (href: string) => {
    return isEditMode ? `${href}?mode=edit` : href;
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      logout();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY >= 35;
    setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      handleScroll(); // Set initial scroll state
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { y: -100, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
        );
      }

      if (desktopNavRef.current) {
        const navItems = desktopNavRef.current.querySelectorAll("a");
        gsap.fromTo(
          navItems,
          { y: -20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            delay: 0.8,
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);

    if (mobileMenuOverlayRef.current && mobileMenuRef.current) {
      const tl = gsap.timeline();

      tl.fromTo(
        mobileMenuOverlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );

      tl.fromTo(
        mobileMenuRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.5, ease: "power3.out" },
        "-=0.2"
      );

      const menuItems =
        mobileMenuRef.current.querySelectorAll(".mobile-menu-item");
      tl.fromTo(
        menuItems,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out",
        },
        "-=0.2"
      );
    }
  };

  const closeMobileMenu = () => {
    if (mobileMenuOverlayRef.current && mobileMenuRef.current) {
      const tl = gsap.timeline();
      const menuItems =
        mobileMenuRef.current.querySelectorAll(".mobile-menu-item");

      tl.to(menuItems, {
        x: 30,
        opacity: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.in",
      });

      tl.to(
        mobileMenuRef.current,
        {
          x: "100%",
          duration: 0.4,
          ease: "power3.in",
        },
        "-=0.1"
      );

      tl.to(
        mobileMenuOverlayRef.current,
        {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => setIsMobileMenuOpen(false),
        },
        "-=0.2"
      );
    }
  };

  const links = [
    {
      name: content.linkStart || "Start",
      href: "/vomsauterhof",
    },
    {
      name: content.linkAbout || "Über uns",
      href: "/vomsauterhof/uber-uns",
    },
    {
      name: content.linkNews || "News",
      href: "/vomsauterhof/news",
    },
    {
      name: content.linkBreed || "Unsere beauceron",
      href: "/vomsauterhof/unsere-beauceron",
    },
    {
      name: content.linkWurf || "Wurf",
      href: "/vomsauterhof/wurf",
    },
  ];

  const activeLink = (href: string) => {
    if (href === "/vomsauterhof") {
      return pathname === "/vomsauterhof";
    }
    return pathname.startsWith(href);
  };

  const [editMode, setEditMode] = useState(isEditMode);
  useEffect(() => {
    setEditMode(isEditMode);
  }, [isEditMode]);

  const toggleEditMode = () => {
    const newMode = !editMode;
    setEditMode(newMode);
    const url = new URL(window.location.href);
    if (newMode) {
      url.searchParams.set("mode", "edit");
    } else {
      url.searchParams.delete("mode");
    }
    router.push(url.pathname + url.search);
  };

  if (
    pathname.startsWith("/vomsauterhof/content") ||
    pathname.startsWith("/vomsauterhof/auth")
  ) {
    return <></>;
  }

  return (
    <>
      <div
        style={{ transition: "var(--transition)" }}
        className={`fixed top-0 left-0 w-screen z-[999] ${
          isScrolled ? "bg-[#BEA99A]" : "bg-transparent"
        }`}
      >
        <header
          ref={headerRef}
          className="py-6 flex items-center justify-between"
        >
          <div className="section-container mx-auto grid grid-cols-[auto_auto] items-center justify-between">
            <Link
              href={"/vomsauterhof"}
              className="flex items-center justify-center"
            >
              <Image
                src={logo}
                alt="Logo"
                className="w-[5rem] max-sm:w-[4rem]"
              />
            </Link>

            <nav
              ref={desktopNavRef}
              className="hidden lg:flex items-center absolute justify-self-center space-x-1 bg-[#DBC6B3] text-[14px] rounded-full p-1"
            >
              {links.map((link, index) => (
                <Link
                  key={index}
                  href={addEditModeParam(link.href)}
                  className={`text-black font-medium  px-5 py-2 ${
                    activeLink(link.href)
                      ? "bg-[#EEE5DD] border border-[#D5BEAA]"
                      : "bg-[#DBC6B3]"
                  } hover:brightness-[0.97] rounded-full cursor-pointer flex justify-center items-center leading-[0] transition-[filter,background-color] h-[2rem] duration-150`}
                >
                  {link.name}
                </Link>
              ))}
              {/* <Link
                href={addEditModeParam("/wurf")}
                className={`text-black font-medium cursor-pointer  px-4 py-2 ${
                  activeLink("wurf")
                    ? "bg-[#EEE5DD] border border-[#D5BEAA]"
                    : "bg-[#DBC6B3]"
                } hover:brightness-[0.97] rounded-full flex justify-center items-center leading-[0] transition-[filter,background-color] h-[2rem] duration-150`}
              >
                {content.linkWurf || "Wurf"}
                <IconChevronDown className="h-4 w-4 ml-2 opacity-75" />
              </Link> */}
            </nav>

            <div className="flex flex-row-reverse items-center gap-3">
              <button
                onClick={openMobileMenu}
                className="lg:hidden p-2 text-black hover:bg-white/20 rounded-md transition-colors duration-150"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>

              <a
                target="_blank"
                href={"mailto:ti.genoveva@bluewin.ch"}
                className="text-white font-medium px-4 md:px-6 py-2 h-[35px] md:h-[41px] text-sm md:text-base rounded-[0.65rem] hover:opacity-95 transition-opacity duration-150"
                style={{ backgroundColor: "#58483B" }}
              >
                {content.contactButton || "Kontaktieren"}
              </a>
            </div>
          </div>
        </header>

        {isMobileMenuOpen && (
          <div
            ref={mobileMenuOverlayRef}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={closeMobileMenu}
          >
            <div
              ref={mobileMenuRef}
              className="fixed flex flex-col right-0 top-0 h-dvh w-80 bg-[#BEA99A] shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6">
                <Image
                  src={"logo.svg"}
                  width={60}
                  height={60}
                  alt="Logo"
                  className="hover-scale"
                />
                <button
                  onClick={closeMobileMenu}
                  className="p-2 text-black bg-[#EEE5DD] hover:bg-white/50 rounded-md transition-colors duration-150"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col items-center">
                <div className="space-y-1 w-full px-4">
                  <Link
                    href={addEditModeParam("/vomsauterhof/")}
                    className={`mobile-menu-item block text-black font-medium font-p4 py-2 px-4 rounded-lg ${
                      activeLink("/vomsauterhof/") ? "bg-[#EEE5DD]" : ""
                    }  hover:bg-white/50 transition-colors duration-150`}
                  >
                    {content.linkStart || "Start"}
                  </Link>
                  <Link
                    href={addEditModeParam("/vomsauterhof/uber-uns")}
                    className={`mobile-menu-item block text-black font-p4 py-2 px-4 rounded-lg ${
                      activeLink("/vomsauterhof/uber-uns") ? "bg-[#EEE5DD]" : ""
                    } hover:bg-white/30 transition-colors duration-150`}
                  >
                    {content.linkAbout || "Über uns"}
                  </Link>
                  <Link
                    href={addEditModeParam("/vomsauterhof/news")}
                    className={`mobile-menu-item block text-black font-p4 py-2 px-4 rounded-lg ${
                      activeLink("/vomsauterhof/news") ? "bg-[#EEE5DD]" : ""
                    } hover:bg-white/30 transition-colors duration-150`}
                  >
                    {content.linkNews || "News"}
                  </Link>
                  <Link
                    href={addEditModeParam("/vomsauterhof/unsere-beauceron")}
                    className={`mobile-menu-item block text-black font-p4 py-2 px-4 rounded-lg ${
                      activeLink("/vomsauterhof/unsere-beauceron")
                        ? "bg-[#EEE5DD]"
                        : ""
                    } hover:bg-white/30 transition-colors duration-150`}
                  >
                    {content.linkBreed || "Unsere beauceron"}
                  </Link>
                  <a
                    href="/vomsauterhof/wurf"
                    className={`mobile-menu-item block text-black font-p4 py-2 px-4 rounded-lg ${
                      activeLink("/vomsauterhof/wurf") ? "bg-[#EEE5DD]" : ""
                    } hover:bg-white/30 transition-colors duration-150`}
                  >
                    {content.linkWurf || "Wuif"}
                  </a>
                </div>

                <div className="mobile-menu-item absolute bottom-2 pt-6 border-t border-[#A89485] w-full max-w-[240px] text-center">
                  <div className="text-black">
                    <p className="font-semibold mb-3 text-lg">
                      {content.mobileContactHeading || "Familie Sauter"}
                    </p>
                    <p className="text-sm mb-2">
                      {content.mobilePhone || "079 770 49 24"}
                    </p>
                    <p className="text-sm">
                      {content.mobileEmail || "h.sauter@sauterhof.ch"}
                    </p>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>

      {isLoggedIn && (
        <div className="flex flex-col w-[9.5rem] items-center bg-white p-1.5 rounded-[0.75rem] shadow-lg gap-1.5 fixed bottom-8 right-8 z-[9999] ">
          <div
            onClick={toggleEditMode}
            className="flex gap-2 w-full cursor-pointer items-center px-3 h-[2.5rem] border border-[var(--c-border)] font-p4 rounded-[0.5rem]"
          >
            <span
              style={{ transition: "ease 0.5s" }}
              className={`relative w-[2.5rem] ${
                editMode ? "bg-[#F38D3B]/20" : "bg-[#F38D3B]/5"
              } flex p-0.5 px-0 border border-[var(--c-border)] rounded-full`}
            >
              <span
                style={{ transition: "ease 0.5s" }}
                className={`h-4 w-4 rounded-full relative flex items-center justify-center ${
                  editMode
                    ? "bg-[#F38D3B] left-[calc(100%_-_1.125rem)]"
                    : "bg-black left-0.5"
                }`}
              >
                {editMode && (
                  <AnimatePresence>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={motionTransition()}
                    >
                      <IconCheck color="white" className="h-3 w-3" />
                    </motion.span>
                  </AnimatePresence>
                )}
              </span>
            </span>
            <span
              style={{ fontSize: "calc(var(--p3) * 0.9)" }}
              className="opacity-70"
            >
              Bearbeiten
            </span>
          </div>

          <Link
            href={"/vomsauterhof/content/news"}
            className="w-full items-center gap-2 px-3 h-[2.5rem] text-black font-p4 rounded-[0.5rem] border border-[var(--c-border)] flex opacity-70 cursor-pointer hover:opacity-100"
          >
            <IconNotes className="h-4.5 w-4.5" />
            <span style={{ fontSize: "calc(var(--p3) * 0.9)" }} className="">
              Admin-Panel
            </span>
          </Link>

          <div
            onClick={handleLogout}
            className="w-full items-center gap-2 px-3 h-[2.5rem] text-black font-p4 rounded-[0.5rem] border border-[var(--c-border)] flex opacity-70 cursor-pointer hover:opacity-100"
          >
            <IconLogout className="h-4.5 w-4.5" />
            <span className="">Abmelden</span>
          </div>
        </div>
      )}
    </>
  );
}
