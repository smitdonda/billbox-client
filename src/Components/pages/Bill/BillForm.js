import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "sonner";

import PageHeader from "../../ui/PageHeader";
import Select from "../../ui/Select";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { Button, IconButton } from "../../ui/Button";
import { FormikField } from "../../ui/Field";
import { money } from "../../ui/format";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  MailIcon,
  PhoneIcon,
  HashIcon,
  InboxIcon,
} from "../../ui/Icons";
import ProductsModal from "./ProductsModal";
import axiosInstance, { errorMessage } from "../../../config/AxiosInstance";

// older bills have no productId, use the name for those
const lineKey = (line) => line?.productId || line?.productname;

function BillForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [bill, setBill] = useState({});
  const [lines, setLines] = useState([]);
  const [originalLines, setOriginalLines] = useState([]);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [pendingRemove, setPendingRemove] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // load everything for the dropdowns (500 is the API maximum)
      const [customerRes, productRes] = await Promise.allSettled([
        axiosInstance.get("/customers", { params: { limit: 500 } }),
        axiosInstance.get("/products", { params: { limit: 500 } }),
      ]);
      if (cancelled) return;
      if (customerRes.status === "fulfilled") {
        setCustomers(customerRes.value.data?.data || []);
      }
      if (productRes.status === "fulfilled") {
        setProducts(productRes.value.data?.data || []);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isNew) {
      setBill({});
      setLines([]);
      setOriginalLines([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/bills/${id}`);
        if (cancelled) return;
        if (res.data?.success) {
          const loaded = res.data.data?.products || [];
          setBill(res.data.data || {});
          setLines(loaded);
          setOriginalLines(loaded);
        }
      } catch (error) {
        if (!cancelled)
          toast.error(errorMessage(error, "Could not load the bill"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  const totals = useMemo(
    () =>
      lines.reduce(
        (acc, line) => {
          acc.subtotal += Number(line.pandqtotal) || 0;
          acc.total += Number(line.gsttex) || 0;
          return acc;
        },
        { subtotal: 0, total: 0 }
      ),
    [lines]
  );
  const tax = totals.total - totals.subtotal;

  // stock left + what this bill already had when it was opened
  const maxQtyFor = useCallback(
    (productId) => {
      const product = products.find((p) => p._id === productId);
      const live = Number(product?.availableproductqty) || 0;
      const previous = originalLines.find(
        (line) => lineKey(line) === (productId || product?.productname)
      );
      return live + (Number(previous?.quantity) || 0);
    },
    [products, originalLines]
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: bill?.name || "",
      email: bill?.email || "",
      phoneNo: bill?.phoneNo ? String(bill.phoneNo) : "",
      gstNo: bill?.gstNo || "",
    },
    validationSchema: yup.object({
      name: yup.string().required("Select a customer"),
      email: yup
        .string()
        .email("Enter a valid email")
        .required("Email is required"),
      phoneNo: yup
        .string()
        .matches(/^\d{10}$/, "Enter a 10-digit number")
        .required("Phone number is required"),
      gstNo: yup.string(),
    }),
    onSubmit: async (values) => {
      if (!lines.length) {
        toast.error("Add at least one product to the bill");
        return;
      }
      try {
        setSaving(true);
        const payload = {
          ...values,
          products: lines,
          totalproductsprice: totals.total,
        };
        const res = isNew
          ? await axiosInstance.post("/bills", payload)
          : await axiosInstance.put(`/bills/${id}`, payload);

        if (res.data?.success) {
          toast.success(res.data.message || "Bill saved");
          navigate("/billinformation");
          return;
        }
        toast.error(res.data?.message || "Could not save the bill");
      } catch (error) {
        toast.error(errorMessage(error, "Could not save the bill"));
      } finally {
        setSaving(false);
      }
    },
  });

  const selectCustomer = (customerId) => {
    const customer = customers.find((c) => c._id === customerId);
    if (!customer) return;
    formik.setValues({
      name: customer.name || "",
      email: customer.email || "",
      phoneNo: customer.phoneNo ? String(customer.phoneNo) : "",
      gstNo: customer.gstNo || "",
    });
  };

  // keep showing the name if the customer on this bill was deleted
  const ORPHAN = "__on-this-bill__";
  const customerOptions = useMemo(() => {
    const options = customers.map((c) => ({
      value: c._id,
      label: c.name,
      hint: `#${c.id}`,
    }));
    if (
      formik.values.name &&
      !customers.some((c) => c.name === formik.values.name)
    ) {
      options.unshift({
        value: ORPHAN,
        label: formik.values.name,
        hint: "on this bill",
      });
    }
    return options;
  }, [customers, formik.values.name]);

  const selectedCustomerId =
    customers.find((c) => c.name === formik.values.name)?._id ||
    (formik.values.name ? ORPHAN : "");

  const saveLine = (line) => {
    setLines((prev) => {
      const index = prev.findIndex((item) => lineKey(item) === lineKey(line));
      if (index === -1) return [...prev, line];
      const next = [...prev];
      next[index] = line;
      return next;
    });
  };

  const removeLine = () => {
    if (!pendingRemove) return;
    setLines((prev) =>
      prev.filter((line) => lineKey(line) !== lineKey(pendingRemove))
    );
    setPendingRemove(null);
  };

  const takenProductIds = lines
    .filter((line) => lineKey(line) !== lineKey(editingLine))
    .map((line) => line.productId)
    .filter(Boolean);

  return (
    <>
      <PageHeader
        title={isNew ? "New bill" : `Edit bill #${bill?.id ?? ""}`}
        description="Pick a customer, add line items, then save."
        actions={
          <>
            <Button
              variant="secondary"
              icon={ChevronLeftIcon}
              onClick={() => navigate("/billinformation")}
            >
              Back
            </Button>
            <Button
              onClick={formik.handleSubmit}
              loading={saving}
              loadingText="Saving..."
              disabled={loading}
            >
              {isNew ? "Save bill" : "Update bill"}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* left column */}
        <div className="space-y-4 xl:col-span-2">
          <section className="card p-5">
            <h2 className="text-base font-semibold tracking-tight text-fg">
              Bill to
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              Choose a saved customer, or adjust the details for this bill only.
            </p>

            <div className="mt-5 space-y-4">
              <Select
                label="Customer"
                value={selectedCustomerId}
                onChange={selectCustomer}
                options={customerOptions}
                placeholder={
                  customers.length ? "Select a customer" : "No customers yet"
                }
                searchPlaceholder="Search customers..."
                emptyText="No customers match"
                error={formik.errors.name}
                touched={formik.touched.name || formik.submitCount > 0}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormikField
                  formik={formik}
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="billing@acme.com"
                  icon={MailIcon}
                />
                <FormikField
                  formik={formik}
                  name="phoneNo"
                  type="tel"
                  inputMode="numeric"
                  label="Phone"
                  placeholder="9876543210"
                  icon={PhoneIcon}
                />
              </div>
              <FormikField
                formik={formik}
                name="gstNo"
                label="GST number"
                placeholder="24AAAAA0000A1Z5"
                icon={HashIcon}
              />
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-fg">
                  Line items
                </h2>
                <p className="mt-0.5 text-[13px] text-muted">
                  {lines.length} {lines.length === 1 ? "product" : "products"}{" "}
                  on this bill
                </p>
              </div>
              <Button
                size="sm"
                icon={PlusIcon}
                onClick={() => {
                  setEditingLine(null);
                  setModalOpen(true);
                }}
              >
                Add product
              </Button>
            </div>

            {loading ? (
              <div className="divide-y divide-line">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <div className="skeleton h-4 flex-1" />
                    <div className="skeleton h-4 w-16" />
                    <div className="skeleton h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : lines.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-14 text-center">
                <InboxIcon size={22} className="text-faint" />
                <p className="text-sm text-muted">No products added yet.</p>
                <Button
                  size="sm"
                  icon={PlusIcon}
                  onClick={() => {
                    setEditingLine(null);
                    setModalOpen(true);
                  }}
                >
                  Add the first product
                </Button>
              </div>
            ) : (
              <>
                {/* desktop */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[44rem] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-line bg-elevated/50 text-[12px] uppercase tracking-wider text-muted">
                        <th className="px-4 py-3 text-left font-semibold">
                          Product
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Unit price
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Tax
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Line total
                        </th>
                        <th className="w-px px-4 py-3 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, index) => (
                        <tr
                          key={lineKey(line) || index}
                          className="border-b border-line last:border-0 hover:bg-elevated/50"
                        >
                          <td className="px-4 py-3.5">
                            <p className="font-medium text-fg">
                              {line.productname}
                            </p>
                            {line.id != null && (
                              <p className="text-[12px] text-faint">
                                #{line.id}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono tabular-nums">
                            {line.quantity}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono tabular-nums">
                            {money(line.unitprice)}
                          </td>
                          <td className="px-4 py-3.5">
                            <ul className="space-y-0.5">
                              {line.gst?.map((slab) => (
                                <li
                                  key={slab.title}
                                  className="text-[12.5px] text-muted"
                                >
                                  {slab.title}
                                  {slab.taxAmount != null && (
                                    <span className="ml-1.5 font-mono tabular-nums text-faint">
                                      {money(slab.taxAmount)}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono tabular-nums font-medium text-fg">
                            {money(line.gsttex)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right">
                            <div className="flex justify-end gap-1">
                              <IconButton
                                icon={PencilIcon}
                                label="Edit line"
                                onClick={() => {
                                  setEditingLine(line);
                                  setModalOpen(true);
                                }}
                              />
                              <IconButton
                                icon={TrashIcon}
                                label="Remove line"
                                tone="danger"
                                onClick={() => setPendingRemove(line)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* mobile */}
                <div className="divide-y divide-line md:hidden">
                  {lines.map((line, index) => (
                    <div key={lineKey(line) || index} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-fg">
                            {line.productname}
                          </p>
                          <p className="text-[12px] text-faint">
                            {line.quantity} × {money(line.unitprice)}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <IconButton
                            icon={PencilIcon}
                            label="Edit line"
                            onClick={() => {
                              setEditingLine(line);
                              setModalOpen(true);
                            }}
                          />
                          <IconButton
                            icon={TrashIcon}
                            label="Remove line"
                            tone="danger"
                            onClick={() => setPendingRemove(line)}
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <ul className="space-y-0.5">
                          {line.gst?.map((slab) => (
                            <li
                              key={slab.title}
                              className="text-[12px] text-muted"
                            >
                              {slab.title}
                              {slab.taxAmount != null && (
                                <span className="ml-1.5 font-mono text-faint">
                                  {money(slab.taxAmount)}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                        <span className="font-mono tabular-nums font-medium text-fg">
                          {money(line.gsttex)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>

        {/* summary */}
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <section className="card p-5">
            <h2 className="text-base font-semibold tracking-tight text-fg">
              Summary
            </h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-mono tabular-nums text-fg">
                  {money(totals.subtotal)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">Tax</dt>
                <dd className="font-mono tabular-nums text-fg">{money(tax)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-3">
                <dt className="font-medium text-fg">Total</dt>
                <dd className="text-lg font-semibold tracking-tight text-fg">
                  {money(totals.total)}
                </dd>
              </div>
            </dl>

            <Button
              className="mt-5 w-full"
              size="lg"
              onClick={formik.handleSubmit}
              loading={saving}
              loadingText="Saving..."
              disabled={loading}
            >
              {isNew ? "Save bill" : "Update bill"}
            </Button>
            <p className="mt-3 text-[12px] leading-relaxed text-faint">
              Saving adjusts product stock by the difference between this bill
              and what was previously recorded.
            </p>
          </section>
        </aside>
      </div>

      <ProductsModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingLine(null);
        }}
        onSave={saveLine}
        products={products}
        initial={editingLine}
        takenProductIds={takenProductIds}
        maxQtyFor={maxQtyFor}
      />

      <ConfirmDialog
        open={Boolean(pendingRemove)}
        onClose={() => setPendingRemove(null)}
        onConfirm={removeLine}
        title="Remove this line?"
        description={
          pendingRemove
            ? `"${pendingRemove.productname}" will be taken off this bill.`
            : undefined
        }
        confirmLabel="Remove"
      />
    </>
  );
}

export default BillForm;
