import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "sonner";

import PageHeader from "../../ui/PageHeader";
import { Button } from "../../ui/Button";
import { FormikField } from "../../ui/Field";
import SectionCard from "../../ui/SectionCard";
import {
  BuildingIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ReceiptIcon,
  StoreIcon,
  ChevronLeftIcon,
} from "../../ui/Icons";
import axiosInstance, { errorMessage } from "../../../config/AxiosInstance";
import { LAYOUT, LetterheadPreview, ProfileSkeleton } from "./shared";

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

  const cancel = () => navigate("/myprofile");
  const saveLabel = isNew ? "Save details" : "Save changes";

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
          <Button variant="secondary" icon={ChevronLeftIcon} onClick={cancel}>
            Back
          </Button>
        }
      />

      {loading ? (
        <ProfileSkeleton />
      ) : (
        <form onSubmit={formik.handleSubmit} className={LAYOUT} noValidate>
          <div className="min-w-0 space-y-4">
            <SectionCard
              icon={StoreIcon}
              tint="bg-warning/10 text-warning"
              title="Business"
              description="Trading name and contact details."
            >
              <FormikField
                formik={formik}
                name="companyname"
                label="Company name"
                placeholder="Acme Trading Co."
                icon={BuildingIcon}
                autoComplete="organization"
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormikField
                  formik={formik}
                  name="cemail"
                  type="email"
                  label="Email"
                  placeholder="accounts@acme.com"
                  icon={MailIcon}
                  autoComplete="email"
                  required
                />
                <FormikField
                  formik={formik}
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  label="Phone"
                  placeholder="9876543210"
                  icon={PhoneIcon}
                  autoComplete="tel-national"
                  required
                />
              </div>
            </SectionCard>

            <SectionCard
              icon={MapPinIcon}
              tint="bg-accent/10 text-accent"
              title="Address"
              description="Where your business is based."
            >
              <FormikField
                formik={formik}
                name="address"
                label="Street address"
                placeholder="12 Industrial Estate, Ring Road"
                autoComplete="address-line1"
                required
              />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <FormikField
                  formik={formik}
                  name="city"
                  label="City"
                  placeholder="Surat"
                  autoComplete="address-level2"
                  className="col-span-2 sm:col-span-1"
                  required
                />
                <FormikField
                  formik={formik}
                  name="state"
                  label="State"
                  placeholder="Gujarat"
                  autoComplete="address-level1"
                  required
                />
                <FormikField
                  formik={formik}
                  name="pinno"
                  inputMode="numeric"
                  label="PIN code"
                  placeholder="395006"
                  autoComplete="postal-code"
                  required
                />
              </div>
            </SectionCard>
          </div>

          <aside className="xl:sticky xl:top-24">
            <SectionCard
              icon={ReceiptIcon}
              tint="bg-violet/10 text-violet"
              title="Invoice preview"
              description="Top of every invoice."
              tag={
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11.5px] font-bold text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Live
                </span>
              }
            >
              <LetterheadPreview values={formik.values} />
              <p className="text-[12px] leading-relaxed text-faint">
                Applies to all invoices, old and new.
              </p>
              <div className="hidden flex-col gap-2 border-t border-line pt-4 xl:flex">
                <Button
                  type="submit"
                  size="lg"
                  loading={saving}
                  loadingText="Saving..."
                >
                  {saveLabel}
                </Button>
                <Button variant="secondary" onClick={cancel} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </SectionCard>
          </aside>

          {/* below xl the buttons float at the bottom so they stay in reach */}
          <div className="sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-10 flex gap-2 rounded-2xl border border-line bg-surface/90 p-2 shadow-lift backdrop-blur-md sm:w-[22rem] sm:justify-self-end xl:hidden">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={cancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-[2]"
              loading={saving}
              loadingText="Saving..."
            >
              {saveLabel}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}

export default ProfileForm;
