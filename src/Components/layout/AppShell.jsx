import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import cn from "../ui/cn";
import { IconButton } from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import {
  HomeIcon,
  UsersIcon,
  TagIcon,
  ReceiptIcon,
  UserCircleIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
  PanelLeftIcon,
  CrateIcon as BrandIcon,
} from "../ui/Icons";

const NAV = [
  {
    title: "Overview",
    items: [
      {
        to: "/",
        label: "Dashboard",
        icon: HomeIcon,
        end: true,
        tint: "bg-accent/10 text-accent",
      },
    ],
  },
  {
    title: "Records",
    items: [
      {
        to: "/customersdetails",
        label: "Customers",
        icon: UsersIcon,
        tint: "bg-teal/10 text-teal",
      },
      {
        to: "/productsdetails",
        label: "Products",
        icon: TagIcon,
        tint: "bg-rose/10 text-rose",
      },
      {
        to: "/billinformation",
        label: "Bills",
        icon: ReceiptIcon,
        tint: "bg-violet/10 text-violet",
        // new/edit bill form and the invoice view
        also: ["/billform", "/billtable"],
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        to: "/myprofile",
        label: "Company",
        icon: UserCircleIcon,
        tint: "bg-warning/10 text-warning",
        // the edit form
        also: ["/profileform"],
      },
    ],
  },
];

// "also" lists other pages that belong to a nav item, so the item stays
// highlighted and the breadcrumb still shows on them
const onAlsoPage = (also, pathname) =>
  Boolean(also?.some((path) => pathname.startsWith(path)));

const COLLAPSE_KEY = "billbox-sidebar-collapsed";

const readCollapsed = () => {
  try {
    return window.localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
};

// tooltip for the collapsed sidebar
function Tip({ children }) {
  return (
    <span
      role="tooltip"
      className={cn(
        "pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden whitespace-nowrap rounded-lg bg-fg px-2.5 py-1.5 text-[12px] font-medium text-bg opacity-0 shadow-pop lg:block",
        "-translate-x-1 -translate-y-1/2 transition-[opacity,transform] duration-150 ease-out",
        "group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none"
      )}
    >
      {children}
    </span>
  );
}

const CURVE = "ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none";
const RAIL = `duration-[380ms] ${CURVE}`;
const ITEM = `duration-[260ms] ${CURVE}`;
// same length as the drawer-out animation in tailwind.config.js
const DRAWER_EXIT_MS = 200;
const ENTER = "animate-nav-in motion-reduce:animate-none";

// position of each group title and link, used to delay the animations
// so the items appear one after another
const ORDER = (() => {
  const order = new Map();
  let i = 0;
  NAV.forEach((group) => {
    order.set(group.title, i++);
    group.items.forEach((item) => order.set(item.to, i++));
  });
  return order;
})();

// labels appear one by one when expanding, all at once when collapsing
const stagger = (collapsed, key) => ({
  transitionDelay: collapsed ? "0ms" : `${50 + (ORDER.get(key) ?? 0) * 26}ms`,
});

const entrance = (key) => ({
  animationDelay: `${(ORDER.get(key) ?? 0) * 45}ms`,
});

const labelMotion = (collapsed) =>
  cn(
    "overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin]",
    ITEM,
    "ml-3 max-w-[11rem] opacity-100",
    collapsed && "lg:ml-0 lg:max-w-0 lg:opacity-0"
  );

// shift the icon 3px left so it is centred in the collapsed sidebar
const iconMotion = (collapsed) =>
  cn(
    "h-[30px] w-[30px] shrink-0 transition-transform",
    RAIL,
    collapsed && "lg:-translate-x-[3px]"
  );

function NavItems({ collapsed, onNavigate }) {
  const { pathname } = useLocation();

  return (
    <nav className="flex flex-col gap-6 px-3">
      {NAV.map((group) => (
        <div key={group.title} className="flex flex-col gap-1">
          <span
            style={{
              ...stagger(collapsed, group.title),
              ...entrance(group.title),
            }}
            className={cn(
              "block overflow-hidden whitespace-nowrap px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-faint",
              ENTER,
              "transition-[max-height,opacity,margin]",
              ITEM,
              "mb-1 max-h-4 opacity-100",
              collapsed && "lg:mb-0 lg:max-h-0 lg:opacity-0"
            )}
          >
            {group.title}
          </span>

          {group.items.map(({ to, label, icon: Icon, end, tint, also }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              style={entrance(to)}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center rounded-xl px-3 py-2 text-sm",
                  "transition-colors duration-150 focus-ring",
                  ENTER,
                  isActive || onAlsoPage(also, pathname)
                    ? "bg-accent/10 font-semibold text-accent"
                    : "font-medium text-muted hover:bg-elevated hover:text-fg"
                )
              }
            >
              {({ isActive: exact }) => {
                const isActive = exact || onAlsoPage(also, pathname);
                return (
                  <>
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 h-5 w-1 origin-center -translate-y-1/2 rounded-r-full bg-accent animate-mark-in motion-reduce:animate-none"
                      />
                    )}
                    <span
                      className={cn(
                        "badge",
                        iconMotion(collapsed),
                        "group-hover:-translate-y-px group-active:translate-y-0",
                        isActive
                          ? "bg-accent text-accent-fg shadow-soft"
                          : tint || "bg-elevated text-muted"
                      )}
                    >
                      <Icon size={16} />
                    </span>
                    <span
                      style={stagger(collapsed, to)}
                      className={labelMotion(collapsed)}
                    >
                      {label}
                    </span>
                    {collapsed && <Tip>{label}</Tip>}
                  </>
                );
              }}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

function Brand({ collapsed }) {
  return (
    <Link to="/" className="flex items-center rounded-xl px-3 py-1 focus-ring">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent2 text-accent-fg shadow-soft",
          "transition-transform",
          RAIL,
          collapsed && "lg:-translate-x-1.5"
        )}
      >
        <BrandIcon size={18} />
      </span>
      <span
        style={{ transitionDelay: collapsed ? "0ms" : "50ms" }}
        className={cn(
          "overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin]",
          ITEM,
          "ml-2.5 max-w-[10rem] opacity-100",
          collapsed && "lg:ml-0 lg:max-w-0 lg:opacity-0"
        )}
      >
        <span className="block truncate text-[15px] font-semibold tracking-tight text-fg">
          BillBox
        </span>
        <span className="block truncate text-[11px] text-faint">
          Inventory &amp; billing
        </span>
      </span>
    </Link>
  );
}

// Layout for logged in pages: sidebar on desktop, drawer on mobile
function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  // keep the drawer mounted until its closing animation has finished
  const [drawerClosing, setDrawerClosing] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const closeDrawer = useCallback(() => setDrawerClosing(true), []);

  const openDrawer = useCallback(() => {
    setDrawerClosing(false);
    setDrawerOpen(true);
  }, []);

  useEffect(() => {
    if (!drawerClosing) return undefined;
    if (!drawerOpen) {
      setDrawerClosing(false);
      return undefined;
    }
    const timer = setTimeout(() => {
      setDrawerOpen(false);
      setDrawerClosing(false);
    }, DRAWER_EXIT_MS);
    return () => clearTimeout(timer);
  }, [drawerClosing, drawerOpen]);

  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  useEffect(() => {
    try {
      window.localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      // localStorage not available
    }
  }, [collapsed]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onEsc = (event) => event.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [drawerOpen, closeDrawer]);

  const logOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const current = useMemo(() => {
    for (const group of NAV) {
      const item = group.items.find((entry) =>
        entry.end
          ? pathname === entry.to
          : pathname.startsWith(entry.to) || onAlsoPage(entry.also, pathname)
      );
      if (item) return { group: group.title, label: item.label };
    }
    return null;
  }, [pathname]);

  const logOutClasses =
    "group relative flex items-center rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-danger/10 hover:text-danger focus-ring";

  return (
    <div className="min-h-screen bg-bg">
      {/* desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden shrink-0 flex-col border-r border-line bg-surface lg:flex",
          `transition-[width] ${RAIL}`,
          collapsed ? "w-[4.5rem]" : "w-[16rem]"
        )}
      >
        <div className="flex h-16 shrink-0 items-center border-b border-line/70 px-3">
          <Brand collapsed={collapsed} />
        </div>

        <div
          className={cn(
            "flex-1 py-5",
            // overflow-visible so the tooltips are not cut off
            collapsed ? "overflow-visible" : "overflow-y-auto"
          )}
        >
          <NavItems collapsed={collapsed} />
        </div>

        <div className="shrink-0 border-t border-line p-3">
          <button
            type="button"
            onClick={logOut}
            className={cn(logOutClasses, "w-full")}
          >
            <span
              className={cn(
                "badge bg-elevated text-muted transition-colors group-hover:bg-danger/10 group-hover:text-danger",
                iconMotion(collapsed)
              )}
            >
              <LogOutIcon size={16} />
            </span>
            <span
              style={{
                transitionDelay: collapsed
                  ? "0ms"
                  : `${50 + ORDER.size * 26}ms`,
              }}
              className={labelMotion(collapsed)}
            >
              Log out
            </span>
            {collapsed && <Tip>Log out</Tip>}
          </button>
        </div>
      </aside>

      {/* mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className={cn(
              "absolute inset-0 bg-zinc-950/50 backdrop-blur-[2px]",
              drawerClosing ? "animate-fade-out" : "animate-fade-in"
            )}
            onClick={closeDrawer}
          />
          <aside
            className={cn(
              "absolute inset-y-0 left-0 flex w-[17rem] max-w-[85vw] flex-col border-r border-line bg-surface shadow-pop",
              drawerClosing ? "animate-drawer-out" : "animate-drawer-in",
              "motion-reduce:animate-none"
            )}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line/70 px-3">
              <Brand collapsed={false} />
              <IconButton
                icon={XIcon}
                label="Close menu"
                onClick={closeDrawer}
              />
            </div>
            <div className="flex-1 overflow-y-auto py-5">
              <NavItems collapsed={false} onNavigate={closeDrawer} />
            </div>
            <div className="shrink-0 border-t border-line p-3">
              <button
                type="button"
                onClick={logOut}
                className={cn(logOutClasses, "w-full")}
              >
                <span className="badge h-[30px] w-[30px] bg-elevated text-muted transition-colors group-hover:bg-danger/10 group-hover:text-danger">
                  <LogOutIcon size={16} />
                </span>
                <span className="ml-3">Log out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* main content */}
      <div
        className={cn(
          "flex min-h-screen flex-col",
          `transition-[padding] ${RAIL}`,
          collapsed ? "lg:pl-[4.5rem]" : "lg:pl-[16rem]"
        )}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur-md sm:px-6">
          <IconButton
            icon={MenuIcon}
            label="Open menu"
            onClick={openDrawer}
            className="lg:hidden"
          />
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-elevated hover:text-fg focus-ring active:scale-95 lg:inline-flex"
          >
            <PanelLeftIcon
              size={17}
              className={cn(
                "transition-transform duration-200",
                collapsed && "rotate-180"
              )}
            />
          </button>
          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 truncate text-[15px] font-semibold tracking-tight text-fg">
              {current?.group && (
                <span className="hidden items-center gap-1.5 font-medium text-faint lg:flex">
                  {current.group}
                  <span aria-hidden="true">/</span>
                </span>
              )}
              {current?.label || "BillBox"}
            </span>
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={logOut}
              className="hidden h-9 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm font-medium text-muted transition-colors hover:border-strong hover:text-fg focus-ring sm:inline-flex lg:hidden"
            >
              <LogOutIcon size={16} />
              Log out
            </button>
            <IconButton
              icon={LogOutIcon}
              label="Log out"
              tone="danger"
              onClick={logOut}
              className="sm:hidden"
            />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;
