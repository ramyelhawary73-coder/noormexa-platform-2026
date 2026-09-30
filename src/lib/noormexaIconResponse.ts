import React from "react";
import { ImageResponse } from "next/og";

export type NoormexaIconVariant = "any" | "maskable" | "apple";

export function createNoormexaIconResponse(
  size: number,
  variant: NoormexaIconVariant,
  requestUrl: string
) {
  const assetUrl = new URL("/brand/noormexa-mark-v2.svg?v=identity-v2", requestUrl).toString();
  const markSize = variant === "maskable" ? "72%" : variant === "apple" ? "76%" : "78%";

  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07111F",
        },
      },
      React.createElement("img", {
        src: assetUrl,
        alt: "NOORMEXA",
        style: {
          width: markSize,
          height: markSize,
          objectFit: "contain",
        },
      })
    ),
    {
      width: size,
      height: size,
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    }
  );
}
