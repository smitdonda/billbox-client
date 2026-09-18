import React, { useCallback, useEffect, useRef, useState } from "react";
import cn from "./cn";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  SearchIcon,
  InboxIcon,
  XIcon,
} from "./Icons";
import { Button, IconButton } from "./Button";

const PAGE_SIZES = [10, 25, 50, 100];
const ARIA_SORT = { asc: "ascending", desc: "descending" };

const cellValue = (row, col) =>
  typeof col.accessor === "function" ? col.accessor(row) : row?.[col.key];

const alignClass = (col) =>
  cn(
    col.align === "right" && "text-right tabular-nums",
    col.align === "center" && "text-center"
  );

function SortIndicator({ dir }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn(
        "shrink-0 transition-colors",
        dir ? "text-accent" : "text-muted/70 group-hover/sort:text-fg"
      )}
    >
      <path d="m8 10 4-4 4 4" className={cn(dir === "desc" && "opacity-25")} />
      <path d="m8 14 4 4 4-4" className={cn(dir === "asc" && "opacity-25")} />
    </svg>
  );
}

const rowCell =
  "h-16 border-b border-line bg-surface px-4 align-middle text-fg transition-colors " +
  "first:pl-5 last:pr-5 group-hover:bg-elevated/45";

const headCell =
  "sticky top-0 z-10 border-b border-line bg-elevated px-4 py-3 first:pl-5 last:pr-5 " +
  "text-left text-[12.5px] font-medium text-muted";

// Table for the list pages. Search, sort and paging state comes from
// useServerTable through the `server` prop.
function DataTable({
  columns = [],
  data = [],
  loading = false,
  server,
  rowActions,
  searchPlaceholder = "Search...",
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyAction,
  toolbar,
}) {
  const {
    total,
    pageCount: serverPageCount,
    page,
    pageSize,
    query,
    sort,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    onQueryChange: setQuery,
    onSortChange: setSort,
  } = server;

  const pageCount = Math.max(1, serverPageCount);
  const safePage = Math.min(page, pageCount - 1);

  // show a shadow on the side where the table can scroll
  const scrollRef = useRef(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const syncEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setEdges({
      left: el.scrollLeft > 2,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
    });
  }, []);

  useEffect(() => {
    syncEdges();
    window.addEventListener("resize", syncEdges);
    return () => window.removeEventListener("resize", syncEdges);
  }, [syncEdges, data, loading]);

  // asc -> desc -> no sort
  const toggleSort = (col) => {
    if (col.sortable === false) return;
    setSort((prev) =>
      prev.key !== col.key
        ? { key: col.key, dir: "asc" }
        : prev.dir === "asc"
          ? { key: col.key, dir: "desc" }
          : { key: null, dir: "asc" }
    );
  };

  const renderCell = (row, col, index) => {
    const value = cellValue(row, col);
    if (col.cell) return col.cell({ value, row, index });
    if (value == null || value === "")
      return <span className="text-faint">—</span>;
    return value;
  };

  const colCount = columns.length + (rowActions ? 1 : 0);
  const showEmpty = !loading && total === 0;

  const emptyBlock = (
    <EmptyBlock
      title={query ? "No matches" : emptyTitle}
      description={query ? `Nothing matched "${query}".` : emptyDescription}
      action={
        query ? (
          <Button variant="secondary" size="sm" onClick={() => setQuery("")}>
            Clear search
          </Button>
        ) : (
          emptyAction
        )
      }
    />
  );

  return (
    <div className="min-w-0">
      {/* toolbar */}
      <div className="flex flex-col gap-3 rounded-t-xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-9 w-full rounded-lg border border-line bg-bg pl-10 pr-9 text-sm text-fg placeholder:text-faint transition-colors hover:border-strong focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-faint transition-colors hover:text-fg focus-ring"
            >
              <XIcon size={14} />
            </button>
          )}
        </div>
        {toolbar ?? (
          <span className="text-[13px] tabular-nums text-muted">
            {total} {total === 1 ? "record" : "records"}
          </span>
        )}
      </div>

      {/* desktop table */}
      <div className="relative hidden overflow-hidden rounded-b-xl border-b border-line md:block">
        <div
          ref={scrollRef}
          onScroll={syncEdges}
          className="overflow-x-auto border-x border-line"
        >
          <table className="w-full min-w-[72rem] table-auto border-collapse text-sm">
            <thead>
              <tr>
                {columns.map((col) => {
                  const active = sort.key === col.key;
                  const sortable = col.sortable !== false;
                  const dir = active ? sort.dir : null;
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={
                        sortable ? ARIA_SORT[dir] || "none" : undefined
                      }
                      className={cn(headCell, alignClass(col), col.className)}
                    >
                      {sortable ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(col)}
                          aria-label={`Sort by ${col.header}`}
                          className={cn(
                            "group/sort inline-flex items-center gap-1 rounded-md px-1 py-0.5 -mx-1",
                            "transition-colors hover:text-fg focus-ring",
                            active && "text-fg",
                            col.align === "right" && "flex-row-reverse"
                          )}
                        >
                          {col.header}
                          <SortIndicator dir={dir} />
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  );
                })}
                {rowActions && (
                  <th
                    scope="col"
                    className={cn(
                      headCell,
                      "w-[12rem] min-w-[12rem] whitespace-nowrap"
                    )}
                  >
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading &&
                Array.from({ length: Math.min(pageSize, 6) }).map((_, r) => (
                  <tr key={`sk-${r}`}>
                    {Array.from({ length: colCount }).map((__, c) => (
                      <td key={`sk-${r}-${c}`} className={rowCell}>
                        <div
                          className="skeleton h-4"
                          style={{ width: `${45 + ((r + c) % 4) * 14}%` }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading &&
                data.map((row, index) => (
                  <tr key={row._id ?? index} className="group">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(rowCell, alignClass(col), col.className)}
                      >
                        {renderCell(row, col, index)}
                      </td>
                    ))}
                    {rowActions && (
                      <td
                        className={cn(
                          rowCell,
                          "w-[12rem] min-w-[12rem] whitespace-nowrap text-right"
                        )}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {rowActions(row)}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

              {showEmpty && (
                <tr>
                  <td
                    colSpan={colCount}
                    className="border-b border-x border-line bg-surface px-4 py-16"
                  >
                    {emptyBlock}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-20 w-6 bg-gradient-to-r from-fg/10 to-transparent transition-opacity duration-150",
            edges.left ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-20 w-6 bg-gradient-to-l from-fg/10 to-transparent transition-opacity duration-150",
            edges.right ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      {/* mobile cards */}
      <div className="space-y-2 md:hidden">
        {loading &&
          Array.from({ length: 3 }).map((_, r) => (
            <div
              key={`msk-${r}`}
              className="space-y-2.5 rounded-xl border border-line bg-surface p-4"
            >
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-3 w-2/3" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          ))}

        {!loading &&
          data.map((row, index) => {
            const [primary, ...restCols] = columns;
            return (
              <div
                key={row._id ?? index}
                className="rounded-xl border border-line bg-surface p-4 transition-colors active:border-strong"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 font-medium text-fg">
                    {renderCell(row, primary, index)}
                  </div>
                  {rowActions && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      {rowActions(row)}
                    </div>
                  )}
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-line pt-3">
                  {restCols.map((col) => (
                    <div key={col.key} className={cn(col.wide && "col-span-2")}>
                      <dt className="text-[12px] font-medium text-muted">
                        {col.header}
                      </dt>
                      <dd className="mt-1 break-words text-[13.5px] text-fg">
                        {renderCell(row, col, index)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })}

        {showEmpty && (
          <div className="rounded-xl border border-line bg-surface p-10">
            {emptyBlock}
          </div>
        )}
      </div>

      {/* pagination */}
      {!showEmpty && (
        <div className="flex flex-col gap-3 border-x border-b border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-[13px] text-muted">
            <span className="hidden sm:inline">Rows per page</span>
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              aria-label="Rows per page"
              className="h-8 rounded-lg border border-line bg-surface px-2 text-[13px] text-fg transition-colors hover:border-strong focus:border-fg focus:outline-none focus:ring-2 focus:ring-fg/15"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="tabular-nums">
              Showing{" "}
              {total === 0
                ? "0"
                : `${safePage * pageSize + 1}–${Math.min(
                    (safePage + 1) * pageSize,
                    total
                  )}`}{" "}
              of {total}
            </span>
          </div>

          <div className="flex w-full items-center justify-between gap-1 sm:w-auto sm:justify-start sm:gap-1.5">
            <IconButton
              icon={ChevronsLeftIcon}
              label="First page"
              disabled={safePage === 0}
              onClick={() => setPage(0)}
              className="hidden disabled:pointer-events-none disabled:opacity-30 sm:inline-flex"
            />
            <Button
              variant="secondary"
              size="sm"
              icon={ChevronLeftIcon}
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="min-w-0 px-2 sm:px-3"
            >
              Previous
            </Button>
            <span className="shrink-0 whitespace-nowrap px-1 text-[13px] font-medium tabular-nums text-fg sm:px-1.5">
              Page {safePage + 1}
              <span className="font-normal text-muted"> of {pageCount}</span>
            </span>
            <Button
              variant="secondary"
              size="sm"
              iconRight={ChevronRightIcon}
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              className="min-w-0 px-2 sm:px-3"
            >
              Next
            </Button>
            <IconButton
              icon={ChevronsRightIcon}
              label="Last page"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(pageCount - 1)}
              className="hidden disabled:pointer-events-none disabled:opacity-30 sm:inline-flex"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyBlock({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-elevated text-faint">
        <InboxIcon size={22} />
      </div>
      <div>
        <p className="font-medium text-fg">{title}</p>
        {description && (
          <p className="mt-1 max-w-sm text-[13px] text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export default DataTable;
