import React from "react";
import cn from "./cn";

const TONES = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning-ink",
  danger: "bg-danger/10 text-danger",
  accent: "bg-accent/10 text-accent",
  neutral: "bg-elevated text-muted",
};

function StatusPill({ tone = "neutral", dot = false, title, children }) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[12px] font-medium tabular-nums",
        TONES[tone] || TONES.neutral
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-current"
        />
      )}
      {children}
    </span>
  );
}

export default StatusPill;
