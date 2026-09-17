import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "sonner";

import Modal from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { FormikField } from "../../ui/Field";
import { TagIcon } from "../../ui/Icons";
import { money, toPaise, rupeeInput } from "../../ui/format";
import axiosInstance, { errorMessage } from "../../../config/AxiosInstance";

const schema = yup.object({
  productname: yup.string().trim().required("Product name is required"),
  availableproductqty: yup
    .number()
    .typeError("Enter a number")
    .integer("Whole units only")
    .min(0, "Cannot be negative")
    .required("Quantity is required"),
  unitprice: yup
    .number()
    .typeError("Enter a number")
    .min(0, "Cannot be negative")
    .required("Unit price is required"),
});

function ProductForm({ id, open, handleClose, editData, getProductsData }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const payload = {
        productname: values.productname.trim(),
        availableproductqty: Number(values.availableproductqty),
        // rupees -> paise
        unitprice: toPaise(values.unitprice),
      };
      const res = id
        ? await axiosInstance.put(`/products/${id}`, payload)
        : await axiosInstance.post("/products", payload);

      if (res?.data?.success) {
        toast.success(res.data.message || "Saved");
        await getProductsData();
        handleClose();
        return;
      }
      toast.error(res?.data?.message || "Could not save the product");
    } catch (error) {
      toast.error(errorMessage(error, "Could not save the product"));
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      productname: editData?.productname || "",
      availableproductqty:
        editData?.availableproductqty != null
          ? String(editData.availableproductqty)
          : "",
      unitprice: rupeeInput(editData?.unitprice),
    },
    validationSchema: schema,
    onSubmit: handleSubmit,
  });

  const close = () => {
    formik.resetForm();
    handleClose();
  };

  const stockValue =
    Number(formik.values.availableproductqty || 0) *
    toPaise(formik.values.unitprice);

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : close}
      title={id ? "Edit product" : "New product"}
      description={
        id
          ? "Update the name, stock level or price."
          : "Add an item you sell and its opening stock."
      }
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={formik.handleSubmit}
            loading={loading}
            loadingText="Saving..."
          >
            {id ? "Save changes" : "Add product"}
          </Button>
        </>
      }
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
        <FormikField
          formik={formik}
          name="productname"
          label="Product name"
          placeholder="A4 Copier Paper 500 sheets"
          icon={TagIcon}
          required
          data-autofocus
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormikField
            formik={formik}
            name="availableproductqty"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            label="Quantity in stock"
            placeholder="0"
            required
          />
          <FormikField
            formik={formik}
            name="unitprice"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            label="Unit price (₹)"
            placeholder="0.00"
            required
          />
        </div>

        {stockValue > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-line bg-bg px-3.5 py-3 text-sm">
            <span className="text-muted">Stock value</span>
            <span className="font-mono tabular-nums text-fg">
              {money(stockValue)}
            </span>
          </div>
        )}

        <button
          type="submit"
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />
      </form>
    </Modal>
  );
}

export default ProductForm;
