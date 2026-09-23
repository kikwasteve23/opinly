export type CurrencyCode = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "KES" | "NGN" | "GHS" | "ZAR" | "INR" | "PHP" | "PKR" | "BDT" | "UGX" | "TZS";

export type LocalPayment = {
  id: string;
  name: string;
  steps: string[];
};

export type CountryProfile = {
  code: string;
  name: string;
  currency: CurrencyCode;
  locale: string;
  /** Approximate units of local currency per 1 USD, for display only. */
  perUsd: number;
  local: LocalPayment;
};

export const COUNTRIES: CountryProfile[] = [
  { code: "US", name: "United States", currency: "USD", locale: "en-US", perUsd: 1, local: { id: "zelle", name: "Zelle or ACH bank transfer", steps: ["Open your banking app and choose Zelle or ACH.", "Send exactly the activation amount to the Opinly deposit details shown after you confirm the method.", "Use your Opinly email as the payment memo.", "Come back and tap “I have sent the payment”."] } },
  { code: "GB", name: "United Kingdom", currency: "GBP", locale: "en-GB", perUsd: 0.78, local: { id: "faster", name: "Faster Payments", steps: ["Open your UK bank app and start a Faster Payment.", "Pay the GBP equivalent shown below to the Opinly sort code and account.", "Put your referral code in the reference field.", "Return here and confirm the transfer."] } },
  { code: "CA", name: "Canada", currency: "CAD", locale: "en-CA", perUsd: 1.36, local: { id: "etransfer", name: "Interac e-Transfer", steps: ["Open your Canadian banking app.", "Send an Interac e-Transfer for the CAD amount shown.", "Use the deposit email displayed on this page.", "Confirm here once the transfer is sent."] } },
  { code: "AU", name: "Australia", currency: "AUD", locale: "en-AU", perUsd: 1.52, local: { id: "payid", name: "PayID / Osko", steps: ["Open your Australian bank app.", "Pay the AUD amount to the PayID shown after you choose this method.", "Include your Opinly email as the description.", "Tap “I have sent the payment”."] } },
  { code: "IE", name: "Ireland", currency: "EUR", locale: "en-IE", perUsd: 0.92, local: { id: "sepa", name: "SEPA bank transfer", steps: ["Open your SEPA-capable bank app.", "Send the EUR amount to the IBAN shown on this page.", "Use your Opinly email as the payment reference.", "Confirm the transfer here."] } },
  { code: "DE", name: "Germany", currency: "EUR", locale: "de-DE", perUsd: 0.92, local: { id: "sepa", name: "SEPA bank transfer", steps: ["Open your banking app.", "Send a SEPA transfer for the EUR amount shown.", "Put your Opinly email in the Verwendungszweck.", "Return and confirm."] } },
  { code: "KE", name: "Kenya", currency: "KES", locale: "en-KE", perUsd: 129, local: { id: "mpesa", name: "M-Pesa", steps: ["Open M-Pesa on your phone.", "Choose Lipa na M-Pesa → Paybill.", "Enter the business number and account (your Opinly email) shown below.", "Pay the KES amount, then confirm here."] } },
  { code: "NG", name: "Nigeria", currency: "NGN", locale: "en-NG", perUsd: 1550, local: { id: "bankng", name: "Nigerian bank transfer", steps: ["Open your Nigerian bank or fintech app.", "Transfer the NGN amount to the Opinly account shown.", "Use your email as the narration.", "Tap “I have sent the payment”."] } },
  { code: "GH", name: "Ghana", currency: "GHS", locale: "en-GH", perUsd: 15.2, local: { id: "momo", name: "Mobile Money", steps: ["Dial your MoMo short code or open the wallet app.", "Send the GHS amount to the merchant number shown.", "Use your Opinly email as the reference.", "Confirm the payment here."] } },
  { code: "ZA", name: "South Africa", currency: "ZAR", locale: "en-ZA", perUsd: 18.4, local: { id: "capitec", name: "Capitec (recommended)", steps: [
    "Open the Capitec remote-banking app. Opinly recommends Capitec for South African deposits because it is the fastest to match.",
    "Tap Pay / Transfer, then choose Capitec Pay or an EFT to another Capitec account.",
    "Beneficiary bank: Capitec. Account name: Opinly Deposits. Account type: Savings.",
    "Account number: 1480054321. Branch code: 470010.",
    "Enter the exact ZAR amount shown on this page. Do not round it.",
    "Payment reference: your Opinly email (this is how we match the deposit).",
    "Send the payment, wait for the Capitec confirmation SMS, then return here and tap “I have sent the payment”.",
  ] } },
  { code: "IN", name: "India", currency: "INR", locale: "en-IN", perUsd: 84, local: { id: "upi", name: "UPI", steps: ["Open GPay, PhonePe, or your UPI app.", "Pay the INR amount to the UPI ID shown.", "Add your Opinly email in the note.", "Return and confirm."] } },
  { code: "PH", name: "Philippines", currency: "PHP", locale: "en-PH", perUsd: 58, local: { id: "gcash", name: "GCash", steps: ["Open GCash.", "Send the PHP amount to the GCash number shown.", "Put your Opinly email in the message.", "Confirm the transfer here."] } },
  { code: "PK", name: "Pakistan", currency: "PKR", locale: "en-PK", perUsd: 278, local: { id: "jazzcash", name: "JazzCash / Easypaisa", steps: ["Open JazzCash or Easypaisa.", "Send the PKR amount to the merchant shown.", "Use your Opinly email as the reference.", "Confirm here."] } },
  { code: "BD", name: "Bangladesh", currency: "BDT", locale: "en-BD", perUsd: 122, local: { id: "bkash", name: "bKash", steps: ["Open bKash.", "Send the BDT amount to the merchant wallet shown.", "Use your email as the reference.", "Confirm the payment here."] } },
  { code: "UG", name: "Uganda", currency: "UGX", locale: "en-UG", perUsd: 3700, local: { id: "mmug", name: "Mobile money", steps: ["Open your mobile-money menu.", "Send the UGX amount to the merchant shown.", "Use your Opinly email as the reason.", "Confirm here."] } },
  { code: "TZ", name: "Tanzania", currency: "TZS", locale: "en-TZ", perUsd: 2600, local: { id: "mmtz", name: "M-Pesa / Tigo Pesa", steps: ["Open M-Pesa or Tigo Pesa.", "Pay the TZS amount to the business number shown.", "Add your Opinly email as the account.", "Confirm the payment here."] } },
];

export const NOWPAYMENTS: LocalPayment = {
  id: "nowpayments",
  name: "NOWPayments (crypto, worldwide)",
  steps: [
    "Choose NOWPayments if your local rails are slow or unavailable.",
    "Send USDT (TRC20) or the listed coin to the invoice address. Send the exact USD amount.",
    "Wait for the network to confirm (usually a few minutes).",
    "Return here and tap “I have sent the payment”. The $50 is added to your available balance, not taken as a fee.",
  ],
};

const NAME_TO_CODE: Record<string, string> = Object.fromEntries(COUNTRIES.map((c) => [c.name.toLowerCase(), c.code]));

export function countryByCode(code: string | null | undefined) {
  const upper = (code ?? "US").toUpperCase();
  return COUNTRIES.find((c) => c.code === upper) ?? COUNTRIES[0]!;
}

export function countryFromName(name: string | null | undefined) {
  if (!name) return COUNTRIES[0]!;
  const code = NAME_TO_CODE[name.trim().toLowerCase()];
  if (code) return countryByCode(code);
  const match = COUNTRIES.find((c) => name.toLowerCase().includes(c.name.toLowerCase()));
  return match ?? COUNTRIES[0]!;
}

export function countryFromHeaders(headers: Headers) {
  const raw =
    headers.get("cf-ipcountry") ||
    headers.get("x-vercel-ip-country") ||
    headers.get("x-country-code") ||
    headers.get("x-geo-country") ||
    "";
  if (raw && raw !== "XX" && raw !== "T1") return countryByCode(raw);
  return null;
}

export function formatMoney(amountUsd: number, country: CountryProfile) {
  const local = amountUsd * country.perUsd;
  return new Intl.NumberFormat(country.locale, {
    style: "currency",
    currency: country.currency,
    maximumFractionDigits: country.currency === "UGX" || country.currency === "TZS" ? 0 : 2,
  }).format(local);
}

export const OPEN_COUNTRY_NAMES = COUNTRIES.map((c) => c.name);
