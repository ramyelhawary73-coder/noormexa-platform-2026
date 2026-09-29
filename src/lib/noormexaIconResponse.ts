import React from "react";
import { ImageResponse } from "next/og";

export type NoormexaIconVariant = "any" | "maskable" | "apple";

const COLORS = {
  midnight: "#061326",
  border: "#164A88",
  blueLight: "#67D4FF",
  blue: "#1F8CFF",
  blueMid: "#095DDA",
  blueDeep: "#05275F",
  goldLight: "#FFF3BD",
  goldSoft: "#F8D77F",
  gold: "#E5AD46",
  goldMid: "#B87520",
  goldDeep: "#70400A",
  flare: "#FFF4C1",
} as const;

function markSvg(variant: NoormexaIconVariant) {
  const markTransform =
    variant === "maskable"
      ? "translate(22 22) scale(0.78)"
      : "translate(8 8) scale(0.92)";

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
    React.createElement(
      "defs",
      null,
      React.createElement(
        "linearGradient",
        { id: "appBlue", x1: "0", y1: "0", x2: "1", y2: "1" },
        React.createElement("stop", { offset: "0%", stopColor: COLORS.blueLight }),
        React.createElement("stop", { offset: "24%", stopColor: COLORS.blue }),
        React.createElement("stop", { offset: "58%", stopColor: COLORS.blueMid }),
        React.createElement("stop", { offset: "100%", stopColor: COLORS.blueDeep })
      ),
      React.createElement(
        "linearGradient",
        { id: "appBlueSide", x1: "0", y1: "0", x2: "1", y2: "0" },
        React.createElement("stop", { offset: "0%", stopColor: "#03152E" }),
        React.createElement("stop", { offset: "100%", stopColor: "#0B438F" })
      ),
      React.createElement(
        "linearGradient",
        { id: "appGold", x1: "0", y1: "0", x2: "1", y2: "1" },
        React.createElement("stop", { offset: "0%", stopColor: COLORS.goldLight }),
        React.createElement("stop", { offset: "18%", stopColor: COLORS.goldSoft }),
        React.createElement("stop", { offset: "46%", stopColor: COLORS.gold }),
        React.createElement("stop", { offset: "73%", stopColor: COLORS.goldMid }),
        React.createElement("stop", { offset: "100%", stopColor: COLORS.goldDeep })
      ),
      React.createElement(
        "linearGradient",
        { id: "appGoldEdge", x1: "0", y1: "0", x2: "1", y2: "0" },
        React.createElement("stop", { offset: "0%", stopColor: "#6E3D08" }),
        React.createElement("stop", { offset: "50%", stopColor: "#B8731B" }),
        React.createElement("stop", { offset: "100%", stopColor: "#4D2A05" })
      )
    ),
    React.createElement("rect", {
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      rx: 42,
      fill: COLORS.midnight,
    }),
    React.createElement("rect", {
      x: 1.5,
      y: 1.5,
      width: 197,
      height: 197,
      rx: 40.5,
      fill: "none",
      stroke: COLORS.border,
      strokeWidth: 3,
    }),
    React.createElement(
      "g",
      { transform: markTransform },
      React.createElement("path", {
        d: "M47 151V66C47 54 53 46 64 42L78 37V112C78 125 74 136 66 147L60 155C55 160 47 157 47 151Z",
        fill: "url(#appBlue)",
      }),
      React.createElement("path", {
        d: "M47 151V66C47 55 53 48 63 43V142L57 153C54 157 47 155 47 151Z",
        fill: "url(#appBlueSide)",
        opacity: 0.68,
      }),
      React.createElement("path", {
        d: "M126 77C126 67 130 58 137 51L149 39C157 31 166 36 166 48V140C166 153 158 160 146 160H126V77Z",
        fill: "url(#appBlue)",
      }),
      React.createElement("path", {
        d: "M151 39C158 32 166 36 166 48V140C166 151 160 158 151 160V39Z",
        fill: "url(#appBlueSide)",
        opacity: 0.55,
      }),
      React.createElement("path", {
        d: "M55 42C65 34 79 36 90 48L154 115C165 126 165 140 155 150C145 160 130 158 120 147L53 78C42 67 44 51 55 42Z",
        fill: "url(#appGold)",
      }),
      React.createElement("path", {
        d: "M52 72L121 145C131 156 145 158 155 150C151 157 143 161 135 159C130 158 125 154 120 149L53 80C50 77 48 74 47 70L52 72Z",
        fill: "url(#appGoldEdge)",
        opacity: 0.78,
      }),
      React.createElement("path", {
        d: "M59 43C67 38 77 40 86 50L150 116",
        stroke: "#FFF7D7",
        strokeWidth: 3,
        strokeLinecap: "round",
        opacity: 0.78,
      }),
      React.createElement("path", {
        d: "M53 145V68C53 58 57 52 65 48",
        stroke: "#A9E8FF",
        strokeWidth: 2.3,
        strokeLinecap: "round",
        opacity: 0.68,
      }),
      React.createElement("path", {
        d: "M160 49V137",
        stroke: "#72C9FF",
        strokeWidth: 2.2,
        strokeLinecap: "round",
        opacity: 0.58,
      }),
      React.createElement("circle", {
        cx: 159,
        cy: 41,
        r: 5.2,
        fill: COLORS.flare,
      }),
      React.createElement("path", {
        d: "M159 30V52M148 41H170",
        stroke: COLORS.flare,
        strokeWidth: 1.8,
        strokeLinecap: "round",
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
