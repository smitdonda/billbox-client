import React from "react";
import cn from "./cn";

// full class names so Tailwind picks them up
const TONES = [
  "bg-accent/10 text-accent",
  "bg-teal/10 text-teal",
  "bg-violet/10 text-violet",
  "bg-rose/10 text-rose",
];

// same name always gets the same colour
const toneFor = (name) => {
  let hash = 7;
  for (const ch of String(name || "")) {
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  }
  return TONES[hash % TONES.length];
};

const initialsOf = (name) =>
  String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => [...word][0].toUpperCase())
    .join("") || "?";

function Avatar({ name }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12.5px] font-semibold",
        toneFor(name)
      )}
    >
      {initialsOf(name)}
    </span>
  );
}

export default Avatar;
