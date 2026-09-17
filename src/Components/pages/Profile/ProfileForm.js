import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "sonner";

import PageHeader from "../../ui/PageHeader";
import { Button } from "../../ui/Button";
import { FormikField } from "../../ui/Field";
import {
  BuildingIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ChevronLeftIcon,
} from "../../ui/Icons";
import axiosInstance, { errorMessage } from "../../../config/AxiosInstance";

const schema = yup.object({
  companyname: yup.string().trim().required("Company name is required"),
  cemail: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  address: yup.string().trim().required("Address is required"),
  city: yup.string().trim().required("City is required"),
  state: yup.string().trim().required("State is required"),
  pinno: yup
    .string()
    .matches(/^\d{4,10}$/, "Enter a valid PIN code")
    .required("PIN code is required"),
  phone: yup
    .string()
    .matches(/^\d{10}$/, "Enter a 10-digit number")
    .required("Phone number is required"),
});

// Same form for adding and editing, there is only one profile per account
function ProfileForm() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axiosInstance.get("/profile");
        if (!cancelled) setProfile(res.data?.data || {});
      } catch (error) {
        if (!cancelled) {
          toast.error(
            errorMessage(error, "Could not load the company profile")
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isNew = !profile?._id;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      companyname: profile.companyname || "",
      cemail: profile.cemail || "",
      address: profile.address || "",
      city: profile.city || "",
      state: profile.state || "",
      pinno: profile.pinno ? String(profile.pinno) : "",
      phone: profile.phone ? String(profile.phone) : "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        const res = await axiosInstance.put("/profile", values);

        if (res?.data?.success) {
          toast.success(res.data.message || "Company details saved");
          navigate("/myprofile");
          return;
        }
        toast.error(res?.data?.message || "Could not save the details");
      } catch (error) {
        toast.error(errorMessage(error, "Could not save the details"));
      } finally {
        setSaving(false);
      }
    },
  });

  return (
    <>
      <PageHeader
        title={
          loading
            ? "Company details"
            : isNew
              ? "Add company details"
              : "Edit company details"
        }
        description="Shown as the letterhead on every invoice."
        actions={
          <Button
            variant="secondary"
            icon={ChevronLeftIcon}
            onClick={() => navigate("/myprofile")}
          >
            Back
          </Button>
        }
      />

      {loading ? (
        <div className="card space-y-4 p-6">
          <div className="skeleton h-11 w-full" />
          <div className="skeleton h-11 w-full" />
          <div className="skeleton h-11 w-full" />
        </div>
      ) : (
        <form
          onSubmit={formik.handleSubmit}
          className="card max-w-3xl p-6"
          noValidate
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormikField
                formik={formik}
                name="companyname"
                label="Company name"
                placeholder="Acme Trading Co."
                icon={BuildingIcon}
                required
              />
              <FormikField
                formik={formik}
                name="cemail"
                type="email"
                label="Company email"
                placeholder="accounts@acme.com"
                icon={MailIcon}
                required
              />
            </div>

            <FormikField
              formik={formik}
              name="address"
              label="Address"
              placeholder="12 Industrial Estate, Ring Road"
              icon={MapPinIcon}
              required
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <FormikField
                formik={formik}
                name="city"
                label="City"
                placeholder="Surat"
                required
              />
              <FormikField
                formik={formik}
                name="state"
                label="State"
                placeholder="Gujarat"
                required
              />
              <FormikField
                formik={formik}
                name="pinno"
                inputMode="numeric"
                label="PIN code"
                placeholder="395006"
                required
              />
            </div>

            <FormikField
              formik={formik}
              name="phone"
              type="tel"
              inputMode="numeric"
              label="Phone"
              placeholder="9876543210"
              icon={PhoneIcon}
              className="sm:max-w-xs"
              required
            />
          </div>

          <div className="mt-7 flex flex-wrap justify-end gap-2 border-t border-line pt-5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/myprofile")}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving} loadingText="Saving...">
              {isNew ? "Save details" : "Save changes"}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}

export default ProfileForm;
