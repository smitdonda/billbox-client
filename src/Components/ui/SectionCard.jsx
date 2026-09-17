import React from "react";
import cn from "./cn";

// Card with a tinted icon, a title and a short description above its content
function SectionCard({ icon: Icon, tint, title, description, tag, children }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-start gap-3.5">
        <span className={cn("badge h-10 w-10", tint)}>
          <Icon size={19} strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-semibold tracking-tight text-fg">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-[13px] text-muted">{description}</p>
          )}
        </div>
        {tag}
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export default SectionCard;
