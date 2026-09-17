import React, { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "sonner";

import Modal from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { FormikField } from "../../ui/Field";
import { MailIcon, PhoneIcon, UserCircleIcon, HashIcon } from "../../ui/Icons";
import axiosInstance, { errorMessage } from "../../../config/AxiosInstance";

const schema = yup.object({
  name: yup.string().trim().required("Name is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  phoneNo: yup
    .string()
    .matches(/^\d{10}$/, "Enter a 10-digit number")
    .required("Phone number is required"),
  gstNo: yup.string().trim(),
});

function CustomersFrom({ id, open, handleClose, editData, customerData }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const res = id
        ? await axiosInstance.put(`/customers/${id}`, values)
        : await axiosInstance.post("/customers", values);

      if (res?.data?.success) {
        toast.success(res.data.message || "Saved");
        await customerData();
        handleClose();
        return;
      }
      toast.error(res?.data?.message || "Could not save the customer");
    } catch (error) {
      toast.error(errorMessage(error, "Could not save the customer"));
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: editData?.name || "",
      email: editData?.email || "",
      phoneNo: editData?.phoneNo ? String(editData.phoneNo) : "",
      gstNo: editData?.gstNo || "",
    },
    validationSchema: schema,
    onSubmit: handleSubmit,
  });

  // reset on close, so the input is kept if saving fails
  const close = () => {
    formik.resetForm();
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : close}
      title={id ? "Edit customer" : "New customer"}
      description={
        id
          ? "Update this customer's billing details."
          : "Add a customer you bill."
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
            {id ? "Save changes" : "Add customer"}
          </Button>
        </>
      }
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
        <FormikField
          formik={formik}
          name="name"
          label="Customer name"
          placeholder="Acme Traders"
          icon={UserCircleIcon}
          required
          data-autofocus
        />
        <FormikField
          formik={formik}
          name="email"
          type="email"
          label="Email"
          placeholder="billing@acme.com"
          icon={MailIcon}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormikField
            formik={formik}
            name="phoneNo"
            type="tel"
            inputMode="numeric"
            label="Phone"
            placeholder="9876543210"
            icon={PhoneIcon}
            required
          />
          <FormikField
            formik={formik}
            name="gstNo"
            label="GST number"
            placeholder="24AAAAA0000A1Z5"
            icon={HashIcon}
          />
        </div>
        {/* hidden submit button so Enter works */}
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

export default CustomersFrom;
