import React from "react";
import { ImageResponse } from "next/og";

export type NoormexaIconVariant = "any" | "maskable" | "apple";

export function createNoormexaIconResponse(
  size: number,
  _variant: NoormexaIconVariant,
  requestUrl: string
) {
  const assetUrl = new URL("/brand/noormexa-app-icon-512.webp?v=master-artwork-2", requestUrl).toString();

  return new ImageResponse(
    React.createElement("div", {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#061326",
      },
    }, React.createElement("img", {
      src: assetUrl,
      width: size,
      height: size,
      alt: "NOORMEXA",
      style: { width: "100%", height: "100%", objectFit: "cover" },
    })),
    {
      width: size,
      height: size,
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    }
  );
}
