import type { Metadata } from "next";

export const siteConfig = {
  name: "Beauceron Vom Sauterhof",
  description:
    "Wir haben eine kleine familiäre Beauceronzucht und züchten mit Leidenschaft und Herzblut Beauceron mit FCI-Papieren.",
  url: "https://vom-sauterhof.de",
  ogImage: "/opengraph-image.png",
  locale: "de_DE",
  type: "website",
};

export function generateSEOMetadata({
  title,
  description,
  path = "",
  image,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const pageDescription = description || siteConfig.description;
  const pageUrl = `${siteConfig.url}${path}`;
  const pageImage = image || siteConfig.ogImage;

  return {
    title: pageTitle,
    description: pageDescription,
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
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: siteConfig.type as "website",
      locale: siteConfig.locale,
      url: pageUrl,
      title: pageTitle,
      description: pageDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
    },
  };
}
