import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Beauceron Vom Sauterhof",
    short_name: "Vom Sauterhof",
    description:
      "Wir haben eine kleine familiäre Beauceronzucht und züchten mit Leidenschaft und Herzblut Beauceron mit FCI-Papieren.",
    start_url: "/",
    display: "standalone",
    background_color: "#F9ECE1",
    theme_color: "#F9ECE1",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
