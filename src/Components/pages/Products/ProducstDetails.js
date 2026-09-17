import React, { useMemo, useState } from "react";
import { toast } from "sonner";

import PageHeader from "../../ui/PageHeader";
import DataTable from "../../ui/DataTable";
import ConfirmDialog from "../../ui/ConfirmDialog";
import StatusPill from "../../ui/StatusPill";
import RowMenu from "../../ui/RowMenu";
import { Button } from "../../ui/Button";
import { CrateIcon, PlusIcon, PencilIcon, TrashIcon } from "../../ui/Icons";
import { money, number } from "../../ui/format";
import useServerTable from "../../../hooks/useServerTable";
import ProductForm from "./ProductFrom";
import axiosInstance, { errorMessage } from "../../../config/AxiosInstance";

// used until the API sends lowStockAt
const FALLBACK_LOW_STOCK_AT = 5;

function StockStatus({ qty, lowAt }) {
  const value = Number(qty) || 0;
  if (value === 0) {
    return (
      <StatusPill tone="danger" dot>
        Out of stock
      </StatusPill>
    );
  }
  if (value <= lowAt) {
    return (
      <StatusPill tone="warning" dot>
        Low · {number(value)}
      </StatusPill>
    );
  }
  return (
    <StatusPill tone="success" dot>
      In stock · {number(value)}
    </StatusPill>
  );
}

function ProducstDetails() {
  const {
    rows: products,
    meta,
    loading,
    reload,
    server,
  } = useServerTable({
    url: "/products",
    errorText: "Could not load products",
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [editId, setEditId] = useState(null);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setEditData({});
    setEditId(null);
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setEditData(row);
    setEditId(row._id);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditData({});
    setEditId(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      const res = await axiosInstance.delete(`/products/${pendingDelete._id}`);
      if (res.data?.success) {
        toast.success("Product deleted");
        setPendingDelete(null);
        await reload();
        return;
      }
      toast.error(res.data?.message || "Could not delete the product");
    } catch (error) {
      toast.error(errorMessage(error, "Could not delete the product"));
    } finally {
      setDeleting(false);
    }
  };

  const lowAt = meta.lowStockAt ?? FALLBACK_LOW_STOCK_AT;

  const columns = useMemo(
    () => [
      {
        key: "productname",
        header: "Product",
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="badge h-9 w-9 bg-accent/10 text-accent"
            >
              <CrateIcon size={18} />
            </span>
            <div className="min-w-0">
              <p
                className="truncate font-medium text-fg"
                title={row.productname || "—"}
              >
                {row.productname || "—"}
              </p>
              <p
                className="truncate text-[12.5px] tabular-nums text-muted"
                title={`#${row.id}`}
              >
                #{row.id}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "availableproductqty",
        header: "Stock",
        cell: ({ value }) => <StockStatus qty={value} lowAt={lowAt} />,
      },
      {
        key: "unitprice",
        header: "Unit price",
        align: "right",
        cell: ({ value }) => (
          <span className="tabular-nums">{money(value)}</span>
        ),
      },
      {
        key: "stockValue",
        header: "Stock value",
        align: "right",
        // calculated here, so the API can't sort by it
        sortable: false,
        accessor: (row) =>
          (Number(row.unitprice) || 0) * (Number(row.availableproductqty) || 0),
        cell: ({ value }) => (
          <span className="tabular-nums text-muted">{money(value)}</span>
        ),
      },
    ],
    [lowAt]
  );

  return (
    <>
      <PageHeader
        title="Products"
        description="What you sell, and how much of it is left."
        actions={
          <Button icon={PlusIcon} onClick={openCreate}>
            New product
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        server={server}
        searchPlaceholder="Search products..."
        emptyTitle="No products yet"
        emptyDescription="Add the items you sell so they can be picked when billing."
        emptyAction={
          <Button size="sm" icon={PlusIcon} onClick={openCreate}>
            New product
          </Button>
        }
        toolbar={
          meta.total > 0 && (
            <span className="flex flex-wrap items-center gap-x-1.5 text-[13px] tabular-nums text-muted">
              <span>
                {number(meta.total)} {meta.total === 1 ? "product" : "products"}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <span className="font-medium text-fg">
                  {number(meta.stockUnits || 0)}
                </span>{" "}
                units
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <span className="font-medium text-fg">
                  {money(meta.stockValue || 0)}
                </span>{" "}
                on hand
              </span>
              <span aria-hidden="true">·</span>
              <span
                className={meta.lowStock ? "font-medium text-warning-ink" : ""}
              >
                {number(meta.lowStock || 0)}{" "}
                {meta.lowStock === 1 ? "needs" : "need"} restocking
              </span>
            </span>
          )
        }
        rowActions={(row) => (
          <RowMenu
            label={`More actions for ${row.productname || "product"}`}
            items={[
              {
                label: "Edit product",
                icon: PencilIcon,
                onSelect: () => openEdit(row),
              },
              {
                label: "Delete product",
                icon: TrashIcon,
                tone: "danger",
                onSelect: () => setPendingDelete(row),
              },
            ]}
          />
        )}
      />

      <ProductForm
        id={editId}
        open={formOpen}
        handleClose={closeForm}
        editData={editData}
        getProductsData={reload}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this product?"
        description={
          pendingDelete
            ? `"${pendingDelete.productname}" will be removed from the catalogue. Existing bills keep their line items.`
            : undefined
        }
      />
    </>
  );
}

export default ProducstDetails;
