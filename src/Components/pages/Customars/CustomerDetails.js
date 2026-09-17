import React, { useMemo, useState } from "react";
import moment from "moment";
import { toast } from "sonner";

import PageHeader from "../../ui/PageHeader";
import DataTable from "../../ui/DataTable";
import ConfirmDialog from "../../ui/ConfirmDialog";
import Avatar from "../../ui/Avatar";
import CopyValue from "../../ui/CopyValue";
import StatusPill from "../../ui/StatusPill";
import { Button, IconButton } from "../../ui/Button";
import { PlusIcon, PencilIcon, TrashIcon } from "../../ui/Icons";
import { number } from "../../ui/format";
import useServerTable from "../../../hooks/useServerTable";
import CustomersFrom from "./CustomersFrom";
import axiosInstance, { errorMessage } from "../../../config/AxiosInstance";

function CustomerDetails() {
  const {
    rows: customers,
    meta,
    loading,
    reload,
    server,
  } = useServerTable({
    url: "/customers",
    errorText: "Could not load customers",
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
      const res = await axiosInstance.delete(`/customers/${pendingDelete._id}`);
      if (res.data?.success) {
        toast.success("Customer deleted");
        setPendingDelete(null);
        await reload();
        return;
      }
      toast.error(res.data?.message || "Could not delete the customer");
    } catch (error) {
      toast.error(errorMessage(error, "Could not delete the customer"));
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={row.name} />
            <div className="min-w-0">
              <p className="truncate font-medium text-fg">{row.name || "—"}</p>
              <p className="truncate text-[12.5px] text-muted">
                {row.email || `Customer #${row.id}`}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "phoneNo",
        header: "Phone",
        sortable: false,
        cell: ({ value }) =>
          value ? (
            <span className="whitespace-nowrap tabular-nums">{value}</span>
          ) : (
            <span className="text-faint">—</span>
          ),
      },
      {
        key: "gstNo",
        header: "GST",
        wide: true,
        sortable: false,
        cell: ({ value }) =>
          value ? (
            <div className="flex min-w-0 items-center gap-2">
              <StatusPill tone="success">Registered</StatusPill>
              <CopyValue value={value} />
            </div>
          ) : (
            <StatusPill>Unregistered</StatusPill>
          ),
      },
      {
        key: "createdAt",
        header: "Added",
        cell: ({ value }) =>
          value ? (
            <span className="whitespace-nowrap text-muted">
              {moment(value).format("DD MMM YYYY")}
            </span>
          ) : (
            <span className="text-faint">—</span>
          ),
      },
    ],
    []
  );

  return (
    <>
      <PageHeader
        title="Customers"
        description="Everyone you raise invoices for."
        actions={
          <Button icon={PlusIcon} onClick={openCreate}>
            New customer
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        server={server}
        searchPlaceholder="Search name, email, GST..."
        emptyTitle="No customers yet"
        emptyDescription="Add a customer and they'll be selectable when you raise a bill."
        emptyAction={
          <Button size="sm" icon={PlusIcon} onClick={openCreate}>
            New customer
          </Button>
        }
        toolbar={
          meta.total > 0 && (
            <span className="text-[13px] tabular-nums text-muted">
              {number(meta.total)} {meta.total === 1 ? "customer" : "customers"}{" "}
              ·{" "}
              <span className="font-medium text-fg">
                {number(meta.gstRegistered || 0)}
              </span>{" "}
              GST-registered
            </span>
          )
        }
        rowActions={(row) => (
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={PencilIcon}
              onClick={() => openEdit(row)}
              aria-label={`Edit ${row.name || "customer"}`}
            >
              Edit
            </Button>
            <IconButton
              icon={TrashIcon}
              label="Delete customer"
              tone="danger"
              onClick={() => setPendingDelete(row)}
            />
          </>
        )}
      />

      <CustomersFrom
        id={editId}
        open={formOpen}
        handleClose={closeForm}
        editData={editData}
        customerData={reload}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this customer?"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" will be removed. Bills already raised for them are not affected.`
            : undefined
        }
      />
    </>
  );
}

export default CustomerDetails;
