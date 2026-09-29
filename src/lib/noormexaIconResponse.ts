import React from "react";
import { ImageResponse } from "next/og";

export type NoormexaIconVariant = "any" | "maskable" | "apple";

const COLORS = {
  midnight: "#07111F",
  midnightSoft: "#0B1C31",
  border: "#17395C",
  blueLight: "#5CC8FF",
  blue: "#1677FF",
  blueDeep: "#082D73",
  goldLight: "#FFF1B8",
  gold: "#DFA83E",
  goldDeep: "#80500F",
  white: "#F8FAFC",
} as const;

function markSvg(variant: NoormexaIconVariant) {
  const markTransform = variant === "maskable" ? "translate(22 22) scale(0.78)" : undefined;

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
        { id: "appBlueFront", x1: "0", y1: "0", x2: "1", y2: "1" },
        React.createElement("stop", { offset: "0%", stopColor: COLORS.blueLight }),
        React.createElement("stop", { offset: "38%", stopColor: COLORS.blue }),
        React.createElement("stop", { offset: "100%", stopColor: COLORS.blueDeep })
      ),
      React.createElement(
        "linearGradient",
        { id: "appGoldFront", x1: "0", y1: "0", x2: "1", y2: "1" },
        React.createElement("stop", { offset: "0%", stopColor: COLORS.goldLight }),
        React.createElement("stop", { offset: "28%", stopColor: "#F3CC69" }),
        React.createElement("stop", { offset: "58%", stopColor: COLORS.gold }),
        React.createElement("stop", { offset: "100%", stopColor: COLORS.goldDeep })
      ),
      React.createElement(
        "linearGradient",
        { id: "appGoldGlint", x1: "0", y1: "0", x2: "1", y2: "0" },
        React.createElement("stop", { offset: "0%", stopColor: "#FFFFFF", stopOpacity: "0.06" }),
        React.createElement("stop", { offset: "52%", stopColor: "#FFFFFF", stopOpacity: "0.92" }),
        React.createElement("stop", { offset: "100%", stopColor: "#FFFFFF", stopOpacity: "0.08" })
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
      React.createElement(
        "g",
        null,
        React.createElement("path", {
          d: "M42 149V58C42 47 49 39 60 35L76 29V118L58 149C54 156 42 155 42 149Z",
          fill: "url(#appBlueFront)",
        }),
        React.createElement("path", {
          d: "M128 73L145 47C151 38 160 42 160 53V142C160 153 153 160 143 160H128V73Z",
          fill: "url(#appBlueFront)",
        }),
        React.createElement("path", {
          d: "M53 38C62 33 73 36 82 46L153 119C162 128 162 139 154 147C146 155 135 154 127 146L52 69C44 61 45 44 53 38Z",
          fill: "url(#appGoldFront)",
        }),
        React.createElement("path", {
          d: "M58 40C65 37 72 39 79 47L148 118",
          stroke: "url(#appGoldGlint)",
          strokeWidth: 3.2,
          strokeLinecap: "round",
        }),
        React.createElement("path", {
          d: "M48 143V61C48 54 52 48 58 45",
          stroke: "#A9E3FF",
          strokeWidth: 2.2,
          strokeLinecap: "round",
          opacity: 0.62,
        }),
        React.createElement("path", {
          d: "M154 54V135",
          stroke: "#74C7FF",
          strokeWidth: 2,
          strokeLinecap: "round",
          opacity: 0.48,
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
