import React from "react";
import { Link } from "react-router-dom";
import {
  CrateIcon,
  TagIcon,
  UsersIcon,
  FileTextIcon,
  CheckIcon,
} from "../ui/Icons";

const HIGHLIGHTS = [
  { icon: UsersIcon, text: "Keep every customer and GST number in one place" },
  { icon: TagIcon, text: "Track stock as bills go out" },
  { icon: FileTextIcon, text: "Generate a tax invoice PDF in one click" },
];

// Login / sign up layout: info panel on the left (large screens only)
function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen bg-bg lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-line bg-surface p-10 lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <Link
          to="/"
          className="relative flex items-center gap-2.5 focus-ring rounded-xl"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-fg">
            <CrateIcon size={20} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-fg">
            BillBox
          </span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-fg">
            Billing and inventory,
            <br />
            without the spreadsheet.
          </h2>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-bg text-muted">
                  <Icon size={16} />
                </span>
                <span className="pt-1.5 text-sm text-muted">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[12px] text-faint">
          &copy; {new Date().getFullYear()} BillBox
        </p>
      </div>

      <div className="flex flex-col">
        {/* logo for small screens */}
        <div className="flex items-center p-4 sm:p-6 lg:hidden">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl focus-ring"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-fg">
              <CrateIcon size={18} />
            </span>
            <span className="font-semibold tracking-tight text-fg">
              BillBox
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-10 sm:px-6">
          <div className="w-full max-w-[26rem]">
            <div className="mb-7">
              <h1 className="text-2xl font-semibold tracking-tight text-fg">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
              )}
            </div>
            {children}
            {footer && <div className="mt-6">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoCredentials({ email, password, onUse }) {
  return (
    <div className="rounded-xl border border-dashed border-strong bg-surface p-4">
      <div className="flex items-center gap-2 text-[13px] font-medium text-fg">
        <CheckIcon size={15} className="text-success" />
        Demo account
      </div>
      <dl className="mt-2.5 space-y-1 text-[13px]">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Email</dt>
          <dd className="truncate font-mono text-fg">{email}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Password</dt>
          <dd className="font-mono text-fg">{password}</dd>
        </div>
      </dl>
      {onUse && (
        <button
          type="button"
          onClick={onUse}
          className="mt-3 w-full rounded-lg border border-line bg-bg py-2 text-[13px] font-medium text-fg transition-colors hover:border-strong focus-ring"
        >
          Fill the form
        </button>
      )}
    </div>
  );
}

export { DemoCredentials };
export default AuthLayout;
