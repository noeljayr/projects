import type { Metadata } from "next";
import { Suspense } from "react";
import "@/css/globals.css";
import { Navbar } from "@/components/Navbar";
import { FooterClient } from "@/components/FooterClient";

import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";
import "@fontsource/work-sans/300.css";
import "@fontsource/work-sans/400.css";
import "@fontsource/work-sans/500.css";
import "@fontsource/work-sans/600.css";
import "@fontsource/work-sans/700.css";
import "@fontsource/work-sans/800.css";
import "@fontsource/work-sans/900.css";
import Mode from "@/components/Mode";
import { AuthInitializer } from "@/components/AuthInitializer";
import clientPromise from "@/lib/mongodb";
import { NavbarContent } from "@/types/navbar";
import { FooterContent } from "@/types/footer";
import { OrganizationSchema } from "@/components/StructuredData";

export const metadata: Metadata = {
  metadataBase: new URL("https://vom-sauterhof.de"),
  title: {
    default: "Beauceron Vom Sauterhof",
    template: "%s | Beauceron Vom Sauterhof",
  },
  description:
    "Wir haben eine kleine familiäre Beauceronzucht und züchten mit Leidenschaft und Herzblut Beauceron mit FCI-Papieren.",
  keywords: [
    "Beauceron",
    "Beauceronzucht",
    "FCI",
    "Hunde",
    "Züchter",
    "Sauterhof",
    "Welpen",
    "Rassehunde",
    "Deutschland",
  ],
  authors: [{ name: "Beauceron Vom Sauterhof" }],
  creator: "Beauceron Vom Sauterhof",
  publisher: "Beauceron Vom Sauterhof",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://vom-sauterhof.de",
    title: "Beauceron Vom Sauterhof",
    description:
      "Wir haben eine kleine familiäre Beauceronzucht und züchten mit Leidenschaft und Herzblut Beauceron mit FCI-Papieren.",
    siteName: "Beauceron Vom Sauterhof",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Beauceron Vom Sauterhof",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Beauceron Vom Sauterhof",
    description:
      "Wir haben eine kleine familiäre Beauceronzucht und züchten mit Leidenschaft und Herzblut Beauceron mit FCI-Papieren.",
    images: ["/opengraph-image.png"],
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export const revalidate = 0;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = await clientPromise;
  const db = client.db("vom_sauterhof");

  // Fetch navbar content
  const navbarCollection = db.collection("navbar");
  const navbarData = await navbarCollection.findOne({});
  const navbarContent: NavbarContent = navbarData
    ? {
        linkStart: navbarData.linkStart,
        linkAbout: navbarData.linkAbout,
        linkNews: navbarData.linkNews,
        linkBreed: navbarData.linkBreed,
        linkWurf: navbarData.linkWurf,
        contactButton: navbarData.contactButton,
        mobileContactHeading: navbarData.mobileContactHeading,
        mobilePhone: navbarData.mobilePhone,
        mobileEmail: navbarData.mobileEmail,
      }
    : {};

  // Fetch footer content
  const footerCollection = db.collection("footer");
  const footerData = await footerCollection.findOne({});
  const footerContent: FooterContent = footerData
    ? {
        companyName: footerData.companyName,
        address1: footerData.address1,
        address2: footerData.address2,
        phone: footerData.phone,
        email: footerData.email,
        linksHeading: footerData.linksHeading,
        linkStart: footerData.linkStart,
        linkAbout: footerData.linkAbout,
        linkNews: footerData.linkNews,
        linkBeauceron: footerData.linkBeauceron,
        linkWurf: footerData.linkWurf,
      }
    : {};

  return (
    <>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F9ECE1" />
      </head>

      <OrganizationSchema />
      <AuthInitializer />
      <Suspense fallback={null}>
        <Mode />
      </Suspense>
      <Navbar content={navbarContent} />
      {children}
      <Suspense fallback={null}>
        <FooterClient content={footerContent} />
      </Suspense>
    </>
  );
}
