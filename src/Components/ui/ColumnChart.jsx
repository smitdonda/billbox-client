import React from "react";
import cn from "./cn";
import { shortMoney } from "./format";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Monthly sales chart, the last column is the current month
function ColumnChart({ data = [], loading = false }) {
  if (loading) {
    return (
      <div className="flex h-[11rem] items-end gap-3 pt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="skeleton w-full max-w-[2.75rem] rounded-t-lg"
              style={{ height: `${34 + ((i * 37) % 60)}%` }}
            />
            <div className="skeleton h-3 w-7" />
          </div>
        ))}
      </div>
    );
  }

  const max = data.reduce((top, row) => Math.max(top, row.total || 0), 0);

  if (!data.length || max === 0) {
    return (
      <div className="flex h-[11rem] flex-col items-center justify-center gap-1.5 text-center">
        <p className="text-sm text-muted">No billing in the last six months.</p>
        <p className="text-[12px] text-faint">
          Raise a bill and it will show up here.
        </p>
      </div>
    );
  }

  const summary = data
    .map((row) => `${MONTHS[row.month - 1]} ${shortMoney(row.total)}`)
    .join(", ");

  return (
    <div
      className="flex h-[11rem] items-end gap-2 pt-6 sm:gap-3"
      role="img"
      aria-label={`Billing by month: ${summary}.`}
    >
      {data.map((row, i) => {
        const current = i === data.length - 1;
        // minimum height so small values are still visible
        const height = row.total ? Math.max(4, (row.total / max) * 100) : 1.5;

        return (
          <div
            key={`${row.year}-${row.month}`}
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            <div className="relative flex w-full max-w-[2.75rem] flex-1 items-end">
              <div
                className={cn(
                  "relative w-full rounded-t-lg",
                  current
                    ? "bg-gradient-to-b from-accent2 to-accent"
                    : "bg-accent/20"
                )}
                style={{ height: `${height}%` }}
              >
                <span
                  className={cn(
                    "absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] tabular-nums",
                    current ? "font-bold text-fg" : "font-semibold text-muted"
                  )}
                >
                  {shortMoney(row.total)}
                </span>
              </div>
            </div>
            <span
              className={cn(
                "text-[11.5px]",
                current ? "font-semibold text-fg" : "font-medium text-faint"
              )}
            >
              {MONTHS[row.month - 1]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default ColumnChart;
