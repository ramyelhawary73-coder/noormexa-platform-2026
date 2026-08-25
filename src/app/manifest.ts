import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NOORMEXA — منصة وسوق التجارة الإلكترونية العالمية",
    short_name: "NOORMEXA",
    description: "NOORMEXA — منصة وسوق التجارة الإلكترونية العالمية الذكية",
    start_url: "/",
    id: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0b1322",
    theme_color: "#0b1322",
    orientation: "any",
    dir: "auto",
    lang: "ar",
    categories: ["shopping", "business", "productivity", "finance"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
