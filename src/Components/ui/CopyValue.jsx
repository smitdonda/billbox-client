import React, { useEffect, useState } from "react";
import { CopyIcon, CheckIcon } from "./Icons";

/** A value that copies itself when clicked — GST numbers, mostly. */
function CopyValue({ value }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  if (value == null || value === "")
    return <span className="text-faint">—</span>;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
    } catch {
      /* clipboard blocked (insecure origin) — leave the value selectable */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${value}`}
      className="group/copy inline-flex max-w-full items-center gap-1.5 rounded-md px-1.5 py-1 -mx-1.5 text-left transition-colors hover:bg-strong/40 focus-ring"
    >
      <span className="truncate font-mono text-[12.5px]">{String(value)}</span>
      {copied ? (
        <CheckIcon size={13} className="shrink-0 text-success" />
      ) : (
        <CopyIcon
          size={13}
          className="shrink-0 text-faint opacity-0 transition-opacity group-hover/copy:opacity-100"
        />
      )}
    </button>
  );
}

export default CopyValue;
