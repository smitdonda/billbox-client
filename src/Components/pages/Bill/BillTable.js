import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePDF, Resolution, Margin } from "react-to-pdf";
import moment from "moment";
import { toast } from "sonner";

import { Button } from "../../ui/Button";
import { money } from "../../ui/format";
import { DownloadIcon, ChevronLeftIcon, FileTextIcon } from "../../ui/Icons";
import axiosInstance, { errorMessage } from "../../../config/AxiosInstance";

const PDF_OPTIONS = {
  method: "save",
  resolution: Resolution.MEDIUM,
  page: { margin: Margin.SMALL, format: "a4", orientation: "portrait" },
  canvas: { mimeType: "image/png", qualityRatio: 1 },
};

// fixed colours for the invoice so the PDF always looks the same
const SHEET_TEXT = "text-zinc-900";
const SHEET_MUTED = "text-zinc-500";
const SHEET_LINE = "border-zinc-300";

function BillTable() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState({});
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const { toPDF, targetRef: sheetRef } = usePDF(PDF_OPTIONS);

  const downloadPdf = async () => {
    try {
      setExporting(true);
      await toPDF({ filename: `invoice-${invoice?.id || id}.pdf` });
    } catch {
      toast.error("Could not create the PDF, try Print instead");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [billRes, profileRes] = await Promise.allSettled([
        axiosInstance.get(`/bills/${id}`),
        axiosInstance.get("/profile"),
      ]);
      if (cancelled) return;

      if (billRes.status === "fulfilled" && billRes.value.data?.success) {
        setInvoice(billRes.value.data.data || {});
      } else if (billRes.status === "rejected") {
        toast.error(errorMessage(billRes.reason, "Could not load the invoice"));
      }
      if (profileRes.status === "fulfilled") {
        setProfile(profileRes.value.data?.data || {});
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const items = useMemo(() => invoice?.products || [], [invoice]);

  const totals = useMemo(
    () =>
      items.reduce(
        (acc, line) => {
          acc.subtotal += Number(line.pandqtotal) || 0;
          acc.total += Number(line.gsttex) || 0;
          return acc;
        },
        { subtotal: 0, total: 0 }
      ),
    [items]
  );
  const tax = totals.total - totals.subtotal;
  const grandTotal = Number(invoice?.totalproductsprice) || totals.total;

  return (
    <>
      {/* toolbar */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={ChevronLeftIcon}
            onClick={() => navigate("/billinformation")}
          >
            Back
          </Button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-fg">
              Invoice {invoice?.id ? `#${invoice.id}` : ""}
            </h1>
            <p className="text-[13px] text-muted">
              Download it as a PDF or print it.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={FileTextIcon}
            onClick={() => window.print()}
          >
            Print
          </Button>
          <Button
            icon={DownloadIcon}
            onClick={downloadPdf}
            disabled={loading}
            loading={exporting}
            loadingText="Building..."
          >
            Download PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="card space-y-4 p-8">
          <div className="skeleton mx-auto h-7 w-56" />
          <div className="skeleton mx-auto h-4 w-72" />
          <div className="skeleton mt-8 h-40 w-full" />
        </div>
      ) : (
        // fixed width (like A4), scrolls sideways on small screens
        <div className="overflow-x-auto pb-4">
          <div
            ref={sheetRef}
            className={`invoice-sheet mx-auto w-[52rem] min-w-[52rem] rounded-2xl border ${SHEET_LINE} p-10 shadow-soft`}
          >
            {/* company */}
            <header className="text-center">
              <h2
                className={`text-2xl font-semibold tracking-tight ${SHEET_TEXT}`}
              >
                {profile?.companyname || "Your company"}
              </h2>
              <div className={`mt-2 space-y-0.5 text-[13px] ${SHEET_MUTED}`}>
                {profile?.address && (
                  <p className="uppercase">{profile.address}</p>
                )}
                {(profile?.city || profile?.state) && (
                  <p className="uppercase">
                    {[profile?.city, profile?.state, profile?.pinno]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                <p>
                  {profile?.phone ? `Phone ${profile.phone}` : ""}
                  {profile?.phone && profile?.cemail ? "  ·  " : ""}
                  {profile?.cemail || ""}
                </p>
              </div>
              <p
                className={`mt-5 inline-block border-y ${SHEET_LINE} px-6 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] ${SHEET_TEXT}`}
              >
                Tax invoice
              </p>
            </header>

            {/* meta */}
            <section className="mt-8 grid grid-cols-2 gap-8 text-[13px]">
              <div>
                <p
                  className={`mb-2 text-[11px] font-semibold uppercase tracking-wider ${SHEET_MUTED}`}
                >
                  Bill to
                </p>
                <p className={`font-semibold ${SHEET_TEXT}`}>
                  {invoice?.name || "—"}
                </p>
                {invoice?.email && (
                  <p className={SHEET_MUTED}>{invoice.email}</p>
                )}
                {invoice?.phoneNo && (
                  <p className={SHEET_MUTED}>Phone {invoice.phoneNo}</p>
                )}
                {invoice?.gstNo && (
                  <p className={SHEET_MUTED}>GST {invoice.gstNo}</p>
                )}
              </div>
              <div className="text-right">
                <p
                  className={`mb-2 text-[11px] font-semibold uppercase tracking-wider ${SHEET_MUTED}`}
                >
                  Invoice details
                </p>
                <p className={SHEET_TEXT}>
                  <span className={SHEET_MUTED}>No.&nbsp;</span>#{invoice?.id}
                </p>
                <p className={SHEET_TEXT}>
                  <span className={SHEET_MUTED}>Date&nbsp;</span>
                  {invoice?.createdAt
                    ? moment(invoice.createdAt).format("DD MMM YYYY")
                    : "—"}
                </p>
              </div>
            </section>

            {/* items */}
            <table className="mt-8 w-full border-collapse text-[13px]">
              <thead>
                <tr className={`border-y ${SHEET_LINE}`}>
                  <th
                    className={`w-10 px-2 py-2.5 text-left font-semibold ${SHEET_TEXT}`}
                  >
                    #
                  </th>
                  <th
                    className={`px-2 py-2.5 text-left font-semibold ${SHEET_TEXT}`}
                  >
                    Product
                  </th>
                  <th
                    className={`w-16 px-2 py-2.5 text-right font-semibold ${SHEET_TEXT}`}
                  >
                    Qty
                  </th>
                  <th
                    className={`w-28 px-2 py-2.5 text-right font-semibold ${SHEET_TEXT}`}
                  >
                    Unit price
                  </th>
                  <th
                    className={`w-40 px-2 py-2.5 text-left font-semibold ${SHEET_TEXT}`}
                  >
                    Tax
                  </th>
                  <th
                    className={`w-32 px-2 py-2.5 text-right font-semibold ${SHEET_TEXT}`}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className={`px-2 py-10 text-center ${SHEET_MUTED}`}
                    >
                      This bill has no line items.
                    </td>
                  </tr>
                )}
                {items.map((line, index) => (
                  <tr
                    key={`${line.productname}-${index}`}
                    className={`border-b ${SHEET_LINE}`}
                  >
                    <td className={`px-2 py-3 align-top ${SHEET_MUTED}`}>
                      {index + 1}
                    </td>
                    <td className={`px-2 py-3 align-top ${SHEET_TEXT}`}>
                      {line.productname}
                    </td>
                    <td
                      className={`px-2 py-3 text-right align-top tabular-nums ${SHEET_TEXT}`}
                    >
                      {line.quantity}
                    </td>
                    <td
                      className={`px-2 py-3 text-right align-top tabular-nums ${SHEET_TEXT}`}
                    >
                      {money(line.unitprice)}
                    </td>
                    <td className={`px-2 py-3 align-top ${SHEET_MUTED}`}>
                      {line.gst?.map((slab) => (
                        <div key={slab.title} className="whitespace-nowrap">
                          {slab.title}
                          {slab.taxAmount != null && (
                            <span className="ml-1.5 tabular-nums">
                              {money(slab.taxAmount)}
                            </span>
                          )}
                        </div>
                      ))}
                    </td>
                    <td
                      className={`px-2 py-3 text-right align-top tabular-nums ${SHEET_TEXT}`}
                    >
                      {money(line.gsttex)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* totals */}
            <section className="mt-6 flex justify-end">
              <dl className="w-72 space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <dt className={SHEET_MUTED}>Subtotal</dt>
                  <dd className={`tabular-nums ${SHEET_TEXT}`}>
                    {money(totals.subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className={SHEET_MUTED}>Tax</dt>
                  <dd className={`tabular-nums ${SHEET_TEXT}`}>{money(tax)}</dd>
                </div>
                <div
                  className={`flex justify-between border-t ${SHEET_LINE} pt-2.5 text-[15px] font-semibold`}
                >
                  <dt className={SHEET_TEXT}>Total</dt>
                  <dd className={`tabular-nums ${SHEET_TEXT}`}>
                    {money(grandTotal)}
                  </dd>
                </div>
              </dl>
            </section>

            <footer className="mt-16 flex items-end justify-between">
              <p className={`text-[11px] ${SHEET_MUTED}`}>
                Computer-generated invoice.
              </p>
              <div className="text-center">
                <div className={`w-48 border-t ${SHEET_LINE} pt-2`}>
                  <span className={`text-[12px] ${SHEET_MUTED}`}>
                    Authorised signature
                  </span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

export default BillTable;
