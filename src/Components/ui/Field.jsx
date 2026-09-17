import React, { useId, useState } from "react";
import cn from "./cn";
import { EyeIcon, EyeOffIcon } from "./Icons";

const controlBase =
  "w-full rounded-xl bg-surface text-fg placeholder:text-faint border border-line " +
  "px-3.5 transition-[border-color,box-shadow,background-color] duration-150 " +
  "hover:border-strong focus:outline-none focus:border-fg focus:ring-2 focus:ring-fg/15 " +
  "disabled:cursor-not-allowed disabled:bg-elevated disabled:text-muted";

// Input with label and error message. The error shows once the field is touched.
function Field({
  label,
  name,
  type = "text",
  error,
  touched,
  hint,
  icon: Icon,
  className = "",
  required,
  ...rest
}) {
  const reactId = useId();
  const id = rest.id || `${name || "field"}-${reactId}`;
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  const showError = Boolean(touched && error);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-[13px] font-medium text-muted flex items-center gap-1"
        >
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
          />
        )}
        <input
          id={id}
          name={name}
          type={isPassword && reveal ? "text" : type}
          aria-invalid={showError || undefined}
          aria-describedby={showError ? `${id}-error` : undefined}
          className={cn(
            controlBase,
            "h-11 text-sm",
            Icon && "pl-10",
            isPassword && "pr-11",
            showError &&
              "border-danger focus:border-danger focus:ring-danger/20"
          )}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-faint transition-colors hover:text-fg focus-ring"
          >
            {reveal ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
          </button>
        )}
      </div>

      {showError ? (
        <p id={`${id}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-faint">{hint}</p>
      ) : null}
    </div>
  );
}

function FormikField({ formik, name, ...rest }) {
  return (
    <Field
      name={name}
      value={formik.values[name] ?? ""}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.errors[name]}
      touched={formik.touched[name]}
      {...rest}
    />
  );
}

export { Field, FormikField };
export default Field;
