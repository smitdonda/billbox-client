import React from "react";
import { Link } from "react-router-dom";
import cn from "./cn";
import { shortMoney } from "./format";

const TONES = {
  success: {
    badge: "bg-success/10 text-success",
    value: "text-success",
    action: "bg-success/10 text-success",
  },
  accent: {
    badge: "bg-accent/10 text-accent",
    value: "text-accent",
    action: "bg-accent/10 text-accent",
  },
};

// Big amount card at the top of the dashboard
function MoneyCard({
  label,
  value,
  caption,
  icon: Icon,
  tone = "accent",
  actionLabel,
  to,
  loading = false,
}) {
  const t = TONES[tone] || TONES.accent;

  const body = (
    <>
      <span className={cn("badge h-[3.25rem] w-[3.25rem]", t.badge)}>
        {Icon && <Icon size={24} strokeWidth={2} />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-muted">
          {label}
        </span>
        {loading ? (
          <span className="skeleton mt-1.5 block h-8 w-36" />
        ) : (
          <span
            className={cn(
              "mt-1 block font-display text-[27px] font-bold leading-none tracking-[-0.035em] tabular-nums",
              t.value
            )}
          >
            {shortMoney(value)}
          </span>
        )}
        {caption && (
          <span className="mt-1.5 block text-[12px] text-faint">{caption}</span>
        )}
      </span>

      {actionLabel && (
        <span
          className={cn(
            "shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-semibold",
            t.action
          )}
        >
          {actionLabel}
        </span>
      )}
    </>
  );

  const classes = cn(
    "card flex items-center gap-4 p-5 shadow-lift transition-transform duration-150",
    to && "hover:-translate-y-0.5 focus-ring"
  );

  return to ? (
    <Link to={to} className={classes}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}

export default MoneyCard;
