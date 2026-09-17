import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { toast } from "sonner";

import MoneyCard from "../../ui/MoneyCard";
import QuickActions from "../../ui/QuickActions";
import ColumnChart from "../../ui/ColumnChart";
import { money, number, shortMoney } from "../../ui/format";
import { useAuth } from "../../../context/AuthContext";
import {
  ReceiptIcon,
  UsersIcon,
  TagIcon,
  UserCircleIcon,
  PlusIcon,
  ArrowUpIcon,
  LayersIcon,
  AlertTriangleIcon,
  ChevronRightIcon,
  InboxIcon,
} from "../../ui/Icons";
import axiosInstance, { errorMessage } from "../../../config/AxiosInstance";

const EMPTY = {
  counts: { customer: 0, product: 0, billInformation: 0 },
  billed: 0,
  stockValue: 0,
  stockUnits: 0,
  lowStockAt: 5,
  lowStockCount: 0,
  lowStock: [],
  recentBills: [],
  monthlySales: [],
  billedThisMonth: 0,
  billsThisMonth: 0,
};

const QUICK = [
  {
    to: "/billform/new",
    label: "New bill",
    icon: PlusIcon,
    tint: "bg-accent/10 text-accent",
  },
  {
    to: "/billinformation",
    label: "All bills",
    icon: ReceiptIcon,
    tint: "bg-violet/10 text-violet",
  },
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
    to: "/myprofile",
    label: "Company",
    icon: UserCircleIcon,
    tint: "bg-warning/10 text-warning",
  },
];

// "Shreeji Hardware" -> "SH"
const initials = (name) =>
  String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "?";

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

function Home() {
  const [summary, setSummary] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/dashboard/summary");
        if (cancelled) return;
        if (res.data?.success) setSummary({ ...EMPTY, ...res.data.data });
      } catch (error) {
        if (!cancelled) {
          toast.error(errorMessage(error, "Could not load the dashboard"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const {
    counts,
    billed,
    stockValue,
    stockUnits,
    lowStock,
    lowStockCount,
    recentBills,
    monthlySales,
    billedThisMonth,
    billsThisMonth,
  } = summary;

  const outOfStock = useMemo(
    () => lowStock.filter((p) => Number(p.availableproductqty) === 0).length,
    [lowStock]
  );

  // short status line under the greeting
  const headline = useMemo(() => {
    if (loading) return "Loading your books...";
    if (outOfStock) {
      return `${outOfStock} ${outOfStock === 1 ? "item is" : "items are"} out of stock and ${lowStockCount} ${lowStockCount === 1 ? "needs" : "need"} restocking.`;
    }
    if (lowStockCount) {
      return `${lowStockCount} ${lowStockCount === 1 ? "item needs" : "items need"} restocking.`;
    }
    if (!counts.billInformation) return "No bills raised yet. Start with one.";
    return "Everything is stocked and up to date.";
  }, [loading, outOfStock, lowStockCount, counts.billInformation]);

  const name = user?.username ? user.username.split(/\s+/)[0] : null;

  return (
    <>
      {/* greeting */}
      <section className="band rounded-2xl px-5 pb-[4.5rem] pt-6 sm:px-7 sm:pt-7">
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-[22px] font-semibold tracking-[-0.025em] sm:text-2xl">
              {greeting()}
              {name ? `, ${name}` : ""}
            </h1>
            <p className="mt-1.5 text-[13.5px] text-accent-fg/80">{headline}</p>

            <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-4">
              <div>
                <dt className="text-[11px] font-medium text-accent-fg/70">
                  Billed this month
                </dt>
                <dd className="mt-1 font-display text-[19px] font-semibold tracking-tight tabular-nums">
                  {loading ? "—" : shortMoney(billedThisMonth)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium text-accent-fg/70">
                  Bills this month
                </dt>
                <dd className="mt-1 font-display text-[19px] font-semibold tracking-tight tabular-nums">
                  {loading ? "—" : number(billsThisMonth)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium text-accent-fg/70">
                  Customers
                </dt>
                <dd className="mt-1 font-display text-[19px] font-semibold tracking-tight tabular-nums">
                  {loading ? "—" : number(counts.customer)}
                </dd>
              </div>
            </dl>
          </div>

          <Link
            to="/billform/new"
            className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full bg-accent-fg/15 px-4 text-sm font-semibold ring-1 ring-inset ring-accent-fg/30 transition-colors hover:bg-accent-fg/25 focus-ring focus-visible:ring-offset-accent"
          >
            <PlusIcon size={16} strokeWidth={2.4} />
            New bill
          </Link>
        </div>
      </section>

      {/* total billed and stock value */}
      <div className="relative z-10 -mt-12 grid grid-cols-1 gap-4 px-2 sm:grid-cols-2 sm:px-3">
        <MoneyCard
          label="Total billed"
          value={billed}
          caption={`Across ${number(counts.billInformation)} ${counts.billInformation === 1 ? "invoice" : "invoices"}`}
          icon={ArrowUpIcon}
          tone="success"
          actionLabel="View all"
          to="/billinformation"
          loading={loading}
        />
        <MoneyCard
          label="Stock value"
          value={stockValue}
          caption={
            lowStockCount
              ? `${number(stockUnits)} units on hand · ${lowStockCount} low`
              : `${number(stockUnits)} units on hand`
          }
          icon={LayersIcon}
          tone="accent"
          actionLabel="Manage"
          to="/productsdetails"
          loading={loading}
        />
      </div>

      <QuickActions items={QUICK} className="mt-4" />

      {/* sales chart and stock alerts */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="card p-5 xl:col-span-2">
          <div className="mb-1 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold tracking-tight text-fg">
                Sales
              </h2>
              <p className="mt-0.5 text-[13px] text-muted">
                Billed per month, last six months.
              </p>
            </div>
            <Link
              to="/billinformation"
              className="hidden items-center gap-1 rounded-lg px-2 py-1 text-[13px] font-medium text-muted transition-colors hover:text-fg focus-ring sm:inline-flex"
            >
              All bills
              <ChevronRightIcon size={14} />
            </Link>
          </div>
          <ColumnChart data={monthlySales} loading={loading} />
        </section>

        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangleIcon size={17} className="text-warning" />
              <h2 className="font-display text-base font-semibold tracking-tight text-fg">
                Stock alerts
              </h2>
            </div>
            {!loading && lowStockCount > 0 && (
              <span className="rounded-full bg-warning/10 px-2.5 py-1 text-[11.5px] font-bold tabular-nums text-warning">
                {number(lowStockCount)}
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-12" />
              ))}
            </div>
          ) : lowStock.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <InboxIcon size={20} className="text-faint" />
              <p className="text-sm text-muted">
                Nothing under {summary.lowStockAt} units.
              </p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-line">
                {lowStock.map((p) => {
                  const out = Number(p.availableproductqty) === 0;
                  return (
                    <li
                      key={p._id}
                      className="flex items-center gap-3 py-2.5 first:pt-0"
                    >
                      <span
                        className={`badge h-9 w-9 font-display text-[11.5px] font-bold ${
                          out
                            ? "bg-danger/10 text-danger"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {initials(p.productname)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-semibold text-fg">
                          {p.productname}
                        </span>
                        <span className="text-[11.5px] text-faint">
                          {money(p.unitprice)} per unit
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-bold tabular-nums ${
                          out
                            ? "bg-danger/10 text-danger"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {out ? "Out" : `${number(p.availableproductqty)} left`}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {lowStockCount > lowStock.length && (
                <p className="mt-3 text-[12px] text-faint">
                  {lowStockCount - lowStock.length} more below{" "}
                  {summary.lowStockAt} units.
                </p>
              )}
            </>
          )}
        </section>
      </div>

      {/* recent bills */}
      <section className="card mt-4 overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-5 pb-4">
          <div>
            <h2 className="font-display text-base font-semibold tracking-tight text-fg">
              Recent bills
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              The last {recentBills.length || 6} invoices you raised.
            </p>
          </div>
          <Link
            to="/billinformation"
            className="shrink-0 rounded-full bg-elevated px-3.5 py-2 text-[12.5px] font-semibold text-muted transition-colors hover:text-fg focus-ring"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className="divide-y divide-line border-t border-line">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="skeleton h-9 w-9 rounded-xl" />
                <div className="skeleton h-4 flex-1" />
                <div className="skeleton h-4 w-20" />
              </div>
            ))}
          </div>
        ) : recentBills.length === 0 ? (
          <div className="flex flex-col items-center gap-3 border-t border-line py-14 text-center">
            <InboxIcon size={22} className="text-faint" />
            <p className="text-sm text-muted">No bills raised yet.</p>
            <Link
              to="/billform/new"
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-accent-fg transition-opacity hover:opacity-90 focus-ring"
            >
              <PlusIcon size={15} strokeWidth={2.4} />
              Create the first one
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {recentBills.map((bill) => (
              <li key={bill._id}>
                <Link
                  to={`/billtable/${bill._id}`}
                  className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-elevated/60 focus-ring"
                >
                  <span className="badge h-10 w-10 bg-accent/10 font-display text-[12px] font-bold text-accent">
                    {initials(bill.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-fg">
                      {bill.name || "Unnamed customer"}
                    </span>
                    <span className="block text-[12px] text-faint">
                      #{bill.id} ·{" "}
                      {moment(bill.createdAt).format("DD MMM YYYY")} ·{" "}
                      {bill.productCount || 0} item
                      {bill.productCount === 1 ? "" : "s"}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-sm font-bold tabular-nums text-success">
                    {money(bill.totalproductsprice)}
                  </span>
                  <ChevronRightIcon size={16} className="shrink-0 text-faint" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default Home;
