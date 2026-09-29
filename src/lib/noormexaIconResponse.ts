import React from "react";
import { ImageResponse } from "next/og";

export type NoormexaIconVariant = "any" | "maskable" | "apple";

export function createNoormexaIconResponse(
  size: number,
  variant: NoormexaIconVariant,
  requestUrl: string
) {
  const markUrl = new URL(
    "/brand/noormexa-mark.svg?v=vector-master-1",
    requestUrl
  ).toString();

  const markScale =
    variant === "maskable" ? 0.64 : variant === "apple" ? 0.70 : 0.74;

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
          borderRadius: Math.round(size * 0.22),
        },
      },
      React.createElement("img", {
        src: markUrl,
        width: Math.round(size * markScale),
        height: Math.round(size * markScale),
        alt: "NOORMEXA",
        style: {
          width: Math.round(markScale * 100) + "%",
          height: Math.round(markScale * 100) + "%",
          objectFit: "contain",
        },
      })
    ),
    {
      width: size,
      height: size,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    }
  );
}
