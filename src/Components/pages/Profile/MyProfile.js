import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import PageHeader from "../../ui/PageHeader";
import { Button } from "../../ui/Button";
import SectionCard from "../../ui/SectionCard";
import cn from "../../ui/cn";
import {
  PencilIcon,
  PlusIcon,
  MapPinIcon,
  ReceiptIcon,
  StoreIcon,
} from "../../ui/Icons";
import axiosInstance, { errorMessage } from "../../../config/AxiosInstance";
import { LAYOUT, LetterheadPreview, ProfileSkeleton } from "./shared";

// one saved value, in the same spot as its field on the edit form
function Detail({ label, value, className }) {
  const shown = String(value ?? "").trim();

  return (
    <div className={cn("min-w-0 rounded-xl bg-bg px-4 py-3", className)}>
      <dt className="text-[12px] font-medium text-faint">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-semibold text-fg">
        {shown || <span className="font-normal text-faint">Not set</span>}
      </dd>
    </div>
  );
}

function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axiosInstance.get("/profile");
        if (cancelled) return;
        setProfile(res.data?.data || null);
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

  return (
    <>
      <PageHeader
        title="Company"
        description="Printed as the letterhead on every invoice."
        actions={
          // with no profile yet, the empty card has the button instead
          !loading &&
          profile && (
            <Button to="/profileform" variant="secondary" icon={PencilIcon}>
              Edit details
            </Button>
          )
        }
      />

      {loading ? (
        <ProfileSkeleton />
      ) : (
        <div className={LAYOUT}>
          <div className="min-w-0 space-y-4">
            {profile ? (
              <>
                <SectionCard
                  icon={StoreIcon}
                  tint="bg-warning/10 text-warning"
                  title="Business"
                  description="Trading name and contact details."
                >
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <Detail
                      label="Company name"
                      value={profile.companyname}
                      className="sm:col-span-2"
                    />
                    <Detail label="Email" value={profile.cemail} />
                    <Detail label="Phone" value={profile.phone} />
                  </dl>
                </SectionCard>

                <SectionCard
                  icon={MapPinIcon}
                  tint="bg-accent/10 text-accent"
                  title="Address"
                  description="Where your business is based."
                >
                  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Detail
                      label="Street address"
                      value={profile.address}
                      className="col-span-2 sm:col-span-3"
                    />
                    <Detail
                      label="City"
                      value={profile.city}
                      className="col-span-2 sm:col-span-1"
                    />
                    <Detail label="State" value={profile.state} />
                    <Detail label="PIN code" value={profile.pinno} />
                  </dl>
                </SectionCard>
              </>
            ) : (
              <section className="card flex flex-col items-center px-6 py-14 text-center">
                <span className="badge h-14 w-14 bg-warning/10 text-warning">
                  <StoreIcon size={26} strokeWidth={1.9} />
                </span>
                <h2 className="mt-4 font-display text-lg font-semibold tracking-tight text-fg">
                  No company details yet
                </h2>
                <p className="mt-1.5 max-w-sm text-[13.5px] text-muted">
                  Add your business name, address and contact details so every
                  invoice prints with the right letterhead.
                </p>
                <Button to="/profileform" icon={PlusIcon} className="mt-6">
                  Add details
                </Button>
              </section>
            )}
          </div>

          <aside className="xl:sticky xl:top-24">
            <SectionCard
              icon={ReceiptIcon}
              tint="bg-violet/10 text-violet"
              title="Invoice preview"
              description="Top of every invoice."
            >
              <LetterheadPreview values={profile || {}} />
            </SectionCard>
          </aside>
        </div>
      )}
    </>
  );
}

export default MyProfile;
