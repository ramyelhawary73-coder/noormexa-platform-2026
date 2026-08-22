import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NOORMEXA | منصة وسوق التجارة العالمية الذكية",
    short_name: "NOORMEXA",
    description: "NOORMEXA — منصة وسوق التجارة الإلكترونية العالمية الذكية للمتسوقين والبائعين والماركات",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1322",
    theme_color: "#0b1322",
    dir: "rtl",
    lang: "ar",
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
