import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import cn from "./cn";
import { MoreHorizontalIcon } from "./Icons";

// "More actions" menu for a table row.
// items: { label, icon, to } for links or { label, icon, onSelect } for actions.
// The menu is rendered in <body> so the table's scroll area can't cut it off.
function RowMenu({ label = "More actions", items = [] }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();

  const close = useCallback((refocus) => {
    setOpen(false);
    setPosition(null);
    if (refocus) buttonRef.current?.focus();
  }, []);

  // position the menu under the button, or above it if there is no room
  useLayoutEffect(() => {
    if (!open || !buttonRef.current || !menuRef.current) return;
    const button = buttonRef.current.getBoundingClientRect();
    const menu = menuRef.current.getBoundingClientRect();
    const gap = 6;
    const roomBelow = window.innerHeight - button.bottom;
    const openUp = roomBelow < menu.height + gap + 8 && button.top > roomBelow;
    setPosition({
      top: openUp ? button.top - menu.height - gap : button.bottom + gap,
      left: Math.max(8, button.right - menu.width),
    });
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (
        menuRef.current?.contains(event.target) ||
        buttonRef.current?.contains(event.target)
      ) {
        return;
      }
      close(false);
    };
    const onMove = () => close(false);
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open, close]);

  useEffect(() => {
    if (open && position) {
      menuRef.current?.querySelector('[role="menuitem"]')?.focus();
    }
  }, [open, position]);

  const onMenuKeyDown = (event) => {
    const entries = [...menuRef.current.querySelectorAll('[role="menuitem"]')];
    const at = entries.indexOf(document.activeElement);
    const focusAt = (index) =>
      entries[(index + entries.length) % entries.length]?.focus();

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusAt(at + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusAt(at - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusAt(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusAt(entries.length - 1);
    } else if (event.key === "Escape" || event.key === "Tab") {
      event.preventDefault();
      close(true);
    }
  };

  const itemClass = (tone) =>
    cn(
      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors focus:outline-none",
      tone === "danger"
        ? "text-danger hover:bg-danger/10 focus:bg-danger/10"
        : "text-fg hover:bg-elevated focus:bg-elevated"
    );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close(false) : setOpen(true))}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted",
          "transition-colors duration-150 hover:bg-elevated hover:text-fg focus-ring active:scale-95",
          open && "bg-elevated text-fg"
        )}
      >
        <MoreHorizontalIcon size={16} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={label}
            onKeyDown={onMenuKeyDown}
            style={
              position
                ? { top: position.top, left: position.left }
                : { top: 0, left: 0, visibility: "hidden" }
            }
            className="fixed z-50 min-w-[11rem] rounded-xl border border-line bg-surface p-1.5 shadow-pop animate-scale-in"
          >
            {items.map((item) => {
              const Icon = item.icon;
              const content = (
                <>
                  {Icon && <Icon size={15} />}
                  {item.label}
                </>
              );
              return item.to ? (
                <Link
                  key={item.label}
                  to={item.to}
                  role="menuitem"
                  className={itemClass(item.tone)}
                  onClick={() => close(false)}
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  className={itemClass(item.tone)}
                  onClick={() => {
                    close(true);
                    item.onSelect?.();
                  }}
                >
                  {content}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}

export default RowMenu;
