// The API sends and receives money in paise. Rupees are only used
// in input fields and when showing amounts.

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

// 12345678 -> "₹1,23,456.78"
export const money = (paise) => {
  const n = Number(paise);
  return Number.isFinite(n) ? currencyFormatter.format(n / 100) : "—";
};

// rupees typed by the user -> paise
export const toPaise = (rupees) => {
  const n = Number(rupees);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0;
};

// paise -> value for a rupee input ("" when empty)
export const rupeeInput = (paise) => {
  if (paise === null || paise === undefined || paise === "") return "";
  const n = Number(paise);
  if (!Number.isFinite(n)) return "";
  return String(n / 100);
};

export const number = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString("en-IN") : "—";
};

// short amounts like ₹1.3Cr, ₹4.2L, ₹8,400
export const shortMoney = (paise) => {
  const n = Number(paise);
  if (!Number.isFinite(n)) return "—";
  const rupees = n / 100;
  const abs = Math.abs(rupees);
  const sign = rupees < 0 ? "-" : "";
  const trim = (value) => String(value).replace(/\.0$/, "");
  if (abs >= 1e7) return `${sign}₹${trim((abs / 1e7).toFixed(1))}Cr`;
  if (abs >= 1e5) return `${sign}₹${trim((abs / 1e5).toFixed(1))}L`;
  return `${sign}₹${Math.round(abs).toLocaleString("en-IN")}`;
};
