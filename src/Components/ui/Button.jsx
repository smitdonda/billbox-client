import React from "react";
import { Link } from "react-router-dom";
import cn from "./cn";
import { Crate } from "./Loader";

const VARIANTS = {
  primary:
    "bg-accent text-accent-fg border border-transparent hover:opacity-90 active:opacity-80",
  secondary:
    "bg-surface text-fg border border-line hover:bg-elevated hover:border-strong",
  solidDanger:
    "bg-danger text-white border border-transparent hover:opacity-90 active:opacity-80",
};

const SIZES = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-11 px-5 text-[15px] gap-2 rounded-xl",
};

const base =
  "inline-flex items-center justify-center font-medium select-none whitespace-nowrap " +
  "transition-[background-color,border-color,color,opacity,transform] duration-150 " +
  "focus-ring disabled:opacity-50 disabled:pointer-events-none active:scale-[0.985]";

function Button({
  to,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  loadingText,
  icon: Icon,
  iconRight: IconRight,
  className = "",
  children,
  disabled,
  ...rest
}) {
  const classes = cn(
    base,
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    className
  );

  const small = size === "sm";

  const content = (
    <>
      {loading ? (
        <Crate size={small ? 16 : 18} />
      ) : (
        Icon && <Icon size={small ? 15 : 17} />
      )}
      {loading && loadingText ? loadingText : children}
      {!loading && IconRight && <IconRight size={16} />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...rest}
    >
      {content}
    </button>
  );
}

function IconButton({
  icon: Icon,
  label,
  tone = "default",
  className = "",
  ...rest
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent",
        "transition-colors duration-150 focus-ring active:scale-95",
        tone === "danger"
          ? "text-muted hover:text-danger hover:bg-danger/10"
          : "text-muted hover:text-fg hover:bg-elevated",
        className
      )}
      {...rest}
    >
      <Icon size={16} />
    </button>
  );
}

export { Button, IconButton };
export default Button;
