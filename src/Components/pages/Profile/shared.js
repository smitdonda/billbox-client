import React from "react";
import cn from "../../ui/cn";

// Pieces used by both company pages (MyProfile and ProfileForm)

// content column next to the invoice preview (single column below xl)
export const LAYOUT =
  "grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]";

const text = (value) => String(value ?? "").trim();

// Top of the invoice, laid out like BillTable.js so it matches the real one
export function LetterheadPreview({ values = {} }) {
  const name = text(values.companyname);
  const address = text(values.address);
  const place =
    text(values.city) || text(values.state)
      ? [values.city, values.state, values.pinno]
          .map(text)
          .filter(Boolean)
          .join(", ")
      : "";
  const contact = [
    text(values.phone) && `Phone ${text(values.phone)}`,
    text(values.cemail),
  ]
    .filter(Boolean)
    .join(" · ");

  const empty = (label) => <span className="text-zinc-400">{label}</span>;

  return (
    <div className="band rounded-xl px-4 pt-5">
      <div className="invoice-sheet relative z-10 mx-auto max-w-sm rounded-t-lg px-4 pb-5 pt-6 shadow-pop">
        <div className="text-center">
          <p className="break-words text-[17px] font-semibold leading-snug tracking-tight">
            {name || empty("Your company")}
          </p>
          <div className="mt-1.5 space-y-0.5 break-words text-[10.5px] leading-relaxed text-zinc-500">
            <p className="uppercase">{address || empty("Street address")}</p>
            <p className="uppercase">{place || empty("City, state, PIN")}</p>
            <p>{contact || empty("Phone · email")}</p>
          </div>
          <p className="mt-4 inline-block border-y px-4 py-1 text-[9px] font-semibold uppercase tracking-[0.2em]">
            Tax invoice
          </p>
        </div>

        {/* rest of the invoice, greyed out */}
        <div aria-hidden="true" className="mt-5">
          <div className="flex justify-between">
            <div className="space-y-1.5">
              <span className="block h-1.5 w-9 rounded-full bg-zinc-300" />
              <span className="block h-2 w-24 rounded-full bg-zinc-200" />
              <span className="block h-1.5 w-16 rounded-full bg-zinc-100" />
            </div>
            <div className="flex flex-col items-end space-y-1.5">
              <span className="block h-1.5 w-12 rounded-full bg-zinc-300" />
              <span className="block h-2 w-14 rounded-full bg-zinc-200" />
              <span className="block h-1.5 w-20 rounded-full bg-zinc-100" />
            </div>
          </div>
          <div className="mt-4 space-y-2.5 border-y py-2.5">
            {["w-28", "w-20"].map((width) => (
              <div key={width} className="flex justify-between">
                <span
                  className={cn("block h-1.5 rounded-full bg-zinc-200", width)}
                />
                <span className="block h-1.5 w-10 rounded-full bg-zinc-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// shown while the profile loads, same shape as the loaded page
export function ProfileSkeleton() {
  return (
    <div className={LAYOUT}>
      <div className="space-y-4">
        {["business", "address"].map((key) => (
          <div key={key} className="card p-5 sm:p-6">
            <div className="flex items-center gap-3.5">
              <div className="skeleton h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-28" />
                <div className="skeleton h-3 w-52 max-w-full" />
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <div className="skeleton h-11 w-full rounded-xl" />
              <div className="skeleton h-11 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
      <div className="card p-5 sm:p-6">
        <div className="skeleton h-80 w-full rounded-xl" />
      </div>
    </div>
  );
}
