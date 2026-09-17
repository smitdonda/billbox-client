import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import cn from "./cn";
import { ChevronDownIcon, CheckIcon, SearchIcon } from "./Icons";

// Dropdown with a search box. Options are { value, label, hint }.
function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No matches",
  error,
  touched,
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef(null);
  const searchRef = useRef(null);
  const showError = Boolean(touched && error);

  useEffect(() => {
    if (!open) return undefined;
    const onDocDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };
    const onEsc = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onEsc);
    const timer = window.setTimeout(() => searchRef.current?.focus(), 20);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onEsc);
      window.clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) =>
      `${opt.label} ${opt.hint || ""}`.toLowerCase().includes(q)
    );
  }, [options, query]);

  const selected = options.find((opt) => opt.value === value);

  return (
    <div className="flex flex-col gap-1.5" ref={wrapRef}>
      {label && (
        <label htmlFor={id} className="text-[13px] font-medium text-muted">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-surface px-3.5 text-sm",
            "transition-[border-color,box-shadow] duration-150 focus-ring hover:border-strong",
            showError ? "border-danger" : "border-line",
            open && "border-fg ring-2 ring-fg/15"
          )}
        >
          <span className={cn("truncate", !selected && "text-faint")}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDownIcon
            size={16}
            className={cn(
              "text-faint transition-transform duration-150",
              open && "rotate-180"
            )}
          />
        </button>

        {open && (
          <div className="absolute z-40 mt-1.5 w-full min-w-[13rem] overflow-hidden rounded-xl border border-line bg-surface shadow-pop animate-scale-in">
            <div className="relative border-b border-line">
              <SearchIcon
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
              />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 w-full bg-transparent pl-9 pr-3 text-sm text-fg placeholder:text-faint focus:outline-none"
              />
            </div>

            <ul role="listbox" className="max-h-60 overflow-y-auto p-1.5">
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-faint">
                  {emptyText}
                </li>
              )}
              {filtered.map((opt) => {
                const active = opt.value === value;
                return (
                  <li key={String(opt.value)}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        onChange?.(opt.value, opt);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        active
                          ? "bg-elevated text-fg font-medium"
                          : "text-muted hover:bg-elevated hover:text-fg"
                      )}
                    >
                      <span className="flex min-w-0 items-baseline gap-2">
                        <span className="truncate">{opt.label}</span>
                        {opt.hint && (
                          <span className="shrink-0 font-mono text-[11px] text-faint">
                            {opt.hint}
                          </span>
                        )}
                      </span>
                      {active && <CheckIcon size={15} />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {showError && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export default Select;
