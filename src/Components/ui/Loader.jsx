import React from "react";
import cn from "./cn";

// Animated box logo used as the loading indicator (styles in index.css)
function Crate({ size = 18, className = "" }) {
  return (
    <svg
      className={cn("crate", size <= 20 && "crate-sm", className)}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <g className="crate-body">
        <polygon
          className="crate-face crate-top"
          points="24,4.2 37.4,11.9 24,19.6 10.6,11.9"
        />
        <polygon
          className="crate-face crate-right"
          points="38.2,13.1 38.2,28.4 24.8,36.1 24.8,20.8"
        />
        <polygon
          className="crate-face crate-left"
          points="9.8,13.1 23.2,20.8 23.2,36.1 9.8,28.4"
        />
      </g>
    </svg>
  );
}

function BlockLoader({ label = "Loading...", size = 30, className = "" }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-14 text-muted",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Crate size={size} />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

// Full screen loader shown while checking the session
function PageLoader({ label = "Loading...", size = 56 }) {
  return (
    <div
      className="grid min-h-screen place-items-center bg-bg"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 text-accent">
        <Crate size={size} />
        {label && <span className="text-sm text-muted">{label}</span>}
      </div>
    </div>
  );
}

export { Crate, BlockLoader, PageLoader };
