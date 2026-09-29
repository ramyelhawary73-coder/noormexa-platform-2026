import React from "react";
import { ImageResponse } from "next/og";

export type NoormexaIconVariant = "any" | "maskable" | "apple";

const COLORS = {
  midnight: "#07111F",
  midnightSoft: "#0B1C31",
  border: "#17395C",
  azure: "#2F80ED",
  gold: "#F5B941",
  white: "#F8FAFC",
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
      fill: COLORS.midnight,
    }),
    React.createElement("circle", {
      cx: 100,
      cy: 100,
      r: 76,
      fill: COLORS.midnightSoft,
      stroke: COLORS.border,
      strokeWidth: 2,
    }),
    React.createElement(
      "g",
      { transform: markTransform },
      React.createElement("rect", {
        x: 50,
        y: 56,
        width: 22,
        height: 90,
        rx: 11,
        fill: COLORS.azure,
      }),
      React.createElement("rect", {
        x: 128,
        y: 56,
        width: 22,
        height: 90,
        rx: 11,
        fill: COLORS.white,
      }),
      React.createElement("path", {
        d: "M61 68 L139 135",
        stroke: COLORS.gold,
        strokeWidth: 22,
        strokeLinecap: "round",
      }),
      React.createElement("path", {
        d: "M150 34 L154 45 L165 50 L154 55 L150 66 L146 55 L135 50 L146 45 Z",
        fill: COLORS.gold,
      })
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
