import React from "react";
import { ImageResponse } from "next/og";

export type NoormexaIconVariant = "any" | "maskable" | "apple";

const COLORS = {
  midnight: "#07111F",
  border: "#17395C",
  blue: "#2563EB",
  gold: "#D5A447",
  white: "#F7F9FC",
} as const;

function markSvg(variant: NoormexaIconVariant) {
  const markTransform = variant === "maskable" ? "translate(20 20) scale(0.8)" : undefined;

  return React.createElement(
    "svg",
    {
      width: "100%",
      height: "100%",
      viewBox: "0 0 200 200",
      xmlns: "http://www.w3.org/2000/svg",
      role: "img",
      "aria-label": "NOORMEXA",
    },
    React.createElement("rect", {
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      rx: 42,
      fill: COLORS.midnight,
    }),
    React.createElement("rect", {
      x: 1,
      y: 1,
      width: 198,
      height: 198,
      rx: 41,
      fill: "none",
      stroke: COLORS.border,
      strokeWidth: 2,
    }),
    React.createElement(
      "g",
      { transform: markTransform },
      React.createElement(
        "g",
        { transform: "translate(7 4) scale(0.93)" },
        React.createElement("path", {
          d: "M42 151V61C42 49 49 40 60 35L76 28V119L58 149C54 156 42 154 42 151Z",
          fill: COLORS.blue,
        }),
        React.createElement("path", {
          d: "M124 81L144 50C149 43 159 46 159 56V143C159 154 152 161 142 161H124V81Z",
          fill: COLORS.white,
        }),
        React.createElement("path", {
          d: "M57 38C65 34 72 35 79 42L151 119C159 128 160 138 153 146C146 154 135 154 127 146L53 68C45 60 47 44 57 38Z",
          fill: COLORS.gold,
        })
      )
    )
  );
}

export function createNoormexaIconResponse(
  size: number,
  variant: NoormexaIconVariant = "any"
) {
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
          background: COLORS.midnight,
        },
      },
      markSvg(variant)
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
