import React, { useEffect, useMemo, useState } from "react";

import Modal from "../../ui/Modal";
import Select from "../../ui/Select";
import MultiSelect from "../../ui/MultiSelect";
import { Button } from "../../ui/Button";
import { Field } from "../../ui/Field";
import { money, toPaise, rupeeInput } from "../../ui/format";

const GST_OPTIONS = [
  { title: "S GST 2.5%", value: 2.5 },
  { title: "C GST 2.5%", value: 2.5 },
  { title: "S GST 9%", value: 9 },
  { title: "C GST 9%", value: 9 },
  { title: "S GST 14%", value: 14 },
  { title: "C GST 14%", value: 14 },
];

const EMPTY = {
  productId: "",
  id: undefined,
  productname: "",
  unitprice: "",
  quantity: "1",
  gst: [],
};

// same calculation as the API (utils/billing.js), amounts in paise
const priceLine = (unitPaise, quantity, gst) => {
  const qty = Math.max(0, Math.trunc(Number(quantity) || 0));
  const pandqtotal = unitPaise * qty;
  const taxes = (gst || []).map((slab) => ({
    ...slab,
    taxAmount: Math.round((pandqtotal * Number(slab.value)) / 100),
  }));
  const gsttex = taxes.reduce((sum, slab) => sum + slab.taxAmount, pandqtotal);
  return { pandqtotal, taxes, gsttex };
};

// Add or edit a product line on the bill
function ProductsModal({
  open,
  onClose,
  onSave,
  products = [],
  initial = null,
  takenProductIds = [],
  maxQtyFor,
}) {
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (!open) return;
    setTouched({});
    setValues(
      initial
        ? {
            productId: initial.productId || "",
            id: initial.id,
            productname: initial.productname || "",
            unitprice: rupeeInput(initial.unitprice),
            quantity: initial.quantity != null ? String(initial.quantity) : "1",
            gst: initial.gst || [],
          }
        : EMPTY
    );
  }, [open, initial]);

  const isEdit = Boolean(initial);

  const options = useMemo(
    () =>
      products
        .filter(
          (p) => !takenProductIds.includes(p._id) || p._id === values.productId
        )
        .map((p) => ({
          value: p._id,
          label: p.productname,
          hint: `#${p.id}`,
        })),
    [products, takenProductIds, values.productId]
  );

  const maxQty = values.productId ? maxQtyFor(values.productId) : 0;
  const quantity = Number(values.quantity);
  // price is typed in rupees
  const unitPaise = toPaise(values.unitprice);
  const { pandqtotal, taxes, gsttex } = priceLine(
    unitPaise,
    values.quantity,
    values.gst
  );

  const errors = {};
  if (!values.productId) errors.productId = "Pick a product";
  if (!values.quantity || Number.isNaN(quantity) || quantity <= 0) {
    errors.quantity = "Enter a quantity";
  } else if (!Number.isInteger(quantity)) {
    errors.quantity = "Whole units only";
  } else if (values.productId && quantity > maxQty) {
    errors.quantity =
      maxQty === 0
        ? "This product is out of stock"
        : `Only ${maxQty} available`;
  }
  if (values.unitprice === "" || Number(values.unitprice) < 0) {
    errors.unitprice = "Enter a unit price";
  }
  if (!values.gst.length) errors.gst = "Pick at least one tax slab";

  const pickProduct = (productId) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;
    setValues((prev) => ({
      ...prev,
      productId,
      id: product.id,
      productname: product.productname,
      unitprice: rupeeInput(product.unitprice),
      quantity:
        prev.quantity && Number(prev.quantity) > 0 ? prev.quantity : "1",
    }));
  };

  const submit = () => {
    setTouched({
      productId: true,
      quantity: true,
      unitprice: true,
      gst: true,
    });
    if (Object.keys(errors).length) return;

    onSave({
      productId: values.productId,
      id: values.id,
      productname: values.productname,
      unitprice: unitPaise,
      quantity,
      gst: taxes,
      pandqtotal,
      gsttex,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit line item" : "Add a product"}
      description="Pick the product, quantity and the tax slabs that apply."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>
            {isEdit ? "Update line" : "Add line"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          label="Product"
          value={values.productId}
          onChange={pickProduct}
          options={options}
          placeholder={
            options.length ? "Select a product" : "No products available"
          }
          searchPlaceholder="Search catalogue..."
          emptyText="No products match"
          error={errors.productId}
          touched={touched.productId}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Quantity"
            name="quantity"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={values.quantity}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, quantity: event.target.value }))
            }
            onBlur={() => setTouched((prev) => ({ ...prev, quantity: true }))}
            error={errors.quantity}
            touched={touched.quantity}
            hint={
              values.productId ? `${maxQty} available for this bill` : undefined
            }
          />
          <Field
            label="Unit price (₹)"
            name="unitprice"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={values.unitprice}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, unitprice: event.target.value }))
            }
            onBlur={() => setTouched((prev) => ({ ...prev, unitprice: true }))}
            error={errors.unitprice}
            touched={touched.unitprice}
          />
        </div>

        <MultiSelect
          label="Tax slabs"
          options={GST_OPTIONS}
          value={values.gst}
          onChange={(gst) => {
            setValues((prev) => ({ ...prev, gst }));
            setTouched((prev) => ({ ...prev, gst: true }));
          }}
          limit={2}
          placeholder="Select GST"
          error={errors.gst}
          touched={touched.gst}
        />

        {/* line total preview */}
        <div className="rounded-xl border border-line bg-bg p-3.5">
          <dl className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-mono tabular-nums text-fg">
                {money(pandqtotal)}
              </dd>
            </div>
            {taxes.map((slab) => (
              <div
                key={slab.title}
                className="flex items-center justify-between text-[13px]"
              >
                <dt className="text-faint">{slab.title}</dt>
                <dd className="font-mono tabular-nums text-muted">
                  {money(slab.taxAmount)}
                </dd>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-line pt-2 font-medium">
              <dt className="text-fg">Line total</dt>
              <dd className="font-mono tabular-nums text-fg">
                {money(gsttex)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Modal>
  );
}

export default ProductsModal;
