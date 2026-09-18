import React, { useMemo, useState } from "react";
import moment from "moment";
import { toast } from "sonner";

import PageHeader from "../../ui/PageHeader";
import DataTable from "../../ui/DataTable";
import ConfirmDialog from "../../ui/ConfirmDialog";
import Avatar from "../../ui/Avatar";
import StatusPill from "../../ui/StatusPill";
import RowMenu from "../../ui/RowMenu";
import { Button } from "../../ui/Button";
import { money, number } from "../../ui/format";
import { PlusIcon, PencilIcon, TrashIcon, FileTextIcon } from "../../ui/Icons";
import useServerTable from "../../../hooks/useServerTable";
import axiosInstance, { errorMessage } from "../../../config/AxiosInstance";

// first product + "+N" for the rest (names in the tooltip)
function ItemChips({ items = [] }) {
  if (!items.length) return <span className="text-faint">—</span>;
  const [first, ...others] = items;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="min-w-0 truncate text-[13px] font-medium text-fg">
        {first.productname}
        {first.quantity ? (
          <span className="ml-1 font-normal tabular-nums text-muted">
            ×{number(first.quantity)}
          </span>
        ) : null}
      </span>
      {others.length > 0 && (
        <span
          title={others.map((p) => p.productname).join(", ")}
          className="shrink-0 rounded-full bg-elevated px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted"
        >
          +{others.length} more
        </span>
      )}
    </div>
  );
}

function BillInformation() {
  const {
    rows: bills,
    meta,
    loading,
    reload,
    server,
  } = useServerTable({
    url: "/bills",
    initialSort: { key: "createdAt", dir: "desc" },
    errorText: "Could not load bills",
  });

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      const res = await axiosInstance.delete(`/bills/${pendingDelete._id}`);
      if (res.data?.success) {
        toast.success("Bill deleted");
        setPendingDelete(null);
        await reload();
        return;
      }
      toast.error(res.data?.message || "Could not delete the bill");
    } catch (error) {
      toast.error(errorMessage(error, "Could not delete the bill"));
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Customer",
        className: "w-[14rem]",
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={row.name} />
            <div className="min-w-0">
              <p
                className="truncate font-medium text-fg"
                title={row.name || "Unnamed customer"}
              >
                {row.name || "Unnamed customer"}
              </p>
              <p
                className="truncate text-[12.5px] tabular-nums text-muted"
                title={`Bill #${row.id}`}
              >
                Bill #{row.id}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "products",
        header: "Items",
        className: "w-[16rem]",
        sortable: false,
        wide: true,
        cell: ({ value }) => <ItemChips items={value || []} />,
      },
      {
        // customer with a GST number = B2B, without = B2C
        key: "gstNo",
        header: "Type",
        className: "w-[6rem]",
        sortable: false,
        cell: ({ value }) =>
          value ? (
            <StatusPill
              tone="accent"
              title="Billed to a GST-registered business"
            >
              B2B
            </StatusPill>
          ) : (
            <StatusPill title="The customer has no GSTIN">B2C</StatusPill>
          ),
      },
      {
        key: "createdAt",
        header: "Date",
        className: "w-[9rem]",
        cell: ({ value }) => (
          <span className="whitespace-nowrap text-muted">
            {value ? moment(value).format("DD MMM YYYY") : "—"}
          </span>
        ),
      },
      {
        key: "totalproductsprice",
        header: "Total",
        align: "right",
        className: "w-[10rem] min-w-[10rem] whitespace-nowrap",
        cell: ({ value }) => (
          <span className="text-[14.5px] font-semibold tabular-nums text-fg">
            {money(value)}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <>
      <PageHeader
        title="Bills"
        description="Every invoice you have raised."
        actions={
          <Button to="/billform/new" icon={PlusIcon}>
            New bill
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={bills}
        loading={loading}
        server={server}
        searchPlaceholder="Search customer, id, product..."
        emptyTitle="No bills yet"
        emptyDescription="Raise your first invoice and it will show up here."
        emptyAction={
          <Button to="/billform/new" size="sm" icon={PlusIcon}>
            New bill
          </Button>
        }
        toolbar={
          meta.total > 0 && (
            <span className="text-[13px] tabular-nums text-muted">
              {number(meta.total)} {meta.total === 1 ? "bill" : "bills"} ·{" "}
              <span className="font-medium text-fg">
                {money(meta.totalBilled || 0)}
              </span>{" "}
              billed
            </span>
          )
        }
        rowActions={(row) => (
          <>
            <Button
              to={`/billtable/${row._id}`}
              variant="secondary"
              size="sm"
              icon={FileTextIcon}
              aria-label={`Invoice for bill #${row.id}`}
            >
              Invoice
            </Button>
            <RowMenu
              label={`More actions for bill #${row.id}`}
              items={[
                {
                  label: "Edit bill",
                  icon: PencilIcon,
                  to: `/billform/${row._id}`,
                },
                {
                  label: "Delete bill",
                  icon: TrashIcon,
                  tone: "danger",
                  onSelect: () => setPendingDelete(row),
                },
              ]}
            />
          </>
        )}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this bill?"
        description={
          pendingDelete
            ? `Bill #${pendingDelete.id} for "${pendingDelete.name}" will be removed and its stock returned to inventory.`
            : undefined
        }
      />
    </>
  );
}

export default BillInformation;
