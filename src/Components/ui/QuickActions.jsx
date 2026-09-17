import React from "react";
import { Link } from "react-router-dom";
import cn from "./cn";

function QuickActions({ items, className = "" }) {
  return (
    <section className={cn("card p-5", className)}>
      <h2 className="mb-4 font-display text-base font-semibold tracking-tight text-fg">
        Quick actions
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {items.map(({ to, label, icon: Icon, tint }) => (
          <Link
            key={label}
            to={to}
            className={cn(
              "group flex flex-col items-center gap-2.5 rounded-xl bg-bg p-4",
              "transition-[transform,box-shadow] duration-150",
              "hover:-translate-y-0.5 hover:shadow-card focus-ring"
            )}
          >
            <span className={cn("badge h-11 w-11", tint)}>
              <Icon size={21} strokeWidth={1.9} />
            </span>
            <span className="text-center text-[12px] font-semibold leading-tight text-fg">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default QuickActions;
