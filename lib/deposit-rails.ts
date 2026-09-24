export type DepositRail = {
  methodId: string;
  methodName: string;
  configured: boolean;
  steps: string[];
  payTo: string[];
};

function env(name: string) {
  return (process.env[name] ?? "").trim();
}

function lines(...parts: Array<string | undefined | false>) {
  return parts.filter((p): p is string => Boolean(p && String(p).trim()));
}

export function depositRail(countryCode: string, methodId: string): DepositRail {
  if (methodId === "nowpayments") {
    const address = env("DEPOSIT_USDT_TRC20");
    const configured = Boolean(address);
    return {
      methodId,
      methodName: "NOWPayments / USDT TRC20",
      configured,
      steps: configured
        ? [
            "Open the wallet that holds USDT on TRON (TRC20). The address must start with T.",
            `Send exactly the USD amount shown on this page as USDT-TRC20 to ${address}.`,
            "Wait until your wallet shows the transfer as confirmed on TRON.",
            "Return here and tap “I have sent the payment”. An admin matches the tx before anything is credited.",
          ]
        : [
            "Use deposit chat on this page and tell us you want to pay with USDT TRC20 (or another coin).",
            "Staff will send a live NOWPayments invoice or a USDT TRC20 address in that chat. Do not send crypto until you have that message.",
            "Send the exact USD amount. Wrong network cannot be recovered.",
            "Come back and tap “I have sent the payment” so we can match it.",
          ],
      payTo: configured
        ? [`USDT TRC20 address: ${address}`, "Network: TRON (TRC20) only", "Memo: your Opinly email"]
        : ["No live invoice is published on this page yet. Ask in deposit chat for the address before you send."],
    };
  }

  const code = countryCode.toUpperCase();
  if (code === "US" && methodId === "zelle") {
    const zelle = env("DEPOSIT_US_ZELLE");
    const bank = env("DEPOSIT_US_BANK_NAME");
    const routing = env("DEPOSIT_US_ACH_ROUTING");
    const account = env("DEPOSIT_US_ACH_ACCOUNT");
    const configured = Boolean(zelle || (routing && account));
    return {
      methodId,
      methodName: "Zelle or ACH",
      configured,
      steps: configured
        ? lines(
            zelle && `In your US bank app, send a Zelle payment to ${zelle} for the exact USD amount.`,
            routing && account && `Or send ACH to ${bank || "the Opinly deposit account"}, routing ${routing}, account ${account}.`,
            "Put your Opinly email in the memo / addenda so we can match it.",
            "Tap “I have sent the payment”. An admin credits you after the transfer lands.",
          )
        : [
            "Open deposit chat and ask for today’s Zelle name/email or ACH routing and account. We do not print unverified numbers here.",
            "Send the exact USD amount from a US bank in your own name.",
            "Memo: your Opinly email.",
            "Tap “I have sent the payment” after your bank confirms it left.",
          ],
      payTo: configured
        ? lines(zelle && `Zelle: ${zelle}`, bank && `Bank: ${bank}`, routing && `ACH routing: ${routing}`, account && `ACH account: ${account}`)
        : ["Ask in deposit chat for Zelle or ACH details before you send."],
    };
  }

  if (code === "KE" && methodId === "mpesa") {
    const paybill = env("DEPOSIT_KE_MPESA_PAYBILL");
    const accountHint = env("DEPOSIT_KE_MPESA_ACCOUNT") || "your Opinly email";
    const configured = Boolean(paybill);
    return {
      methodId,
      methodName: "M-Pesa",
      configured,
      steps: configured
        ? [
            "Open M-Pesa → Lipa na M-Pesa → Pay Bill.",
            `Business number: ${paybill}. Account: ${accountHint}.`,
            "Enter the exact KES amount shown on this page (do not round).",
            "PIN, wait for the M-Pesa SMS, then tap “I have sent the payment”.",
          ]
        : [
            "Open deposit chat and ask for the live M-Pesa paybill and account format.",
            "Do not send to a number someone DMs you off this site.",
            "Pay the exact KES amount, then tap “I have sent the payment”.",
          ],
      payTo: configured ? [`Paybill: ${paybill}`, `Account: ${accountHint}`] : ["Ask in deposit chat for the paybill before you send."],
    };
  }

  if (code === "ZA" && methodId === "capitec") {
    const account = env("DEPOSIT_ZA_CAPITEC_ACCOUNT");
    const branch = env("DEPOSIT_ZA_CAPITEC_BRANCH") || "470010";
    const name = env("DEPOSIT_ZA_CAPITEC_NAME") || "Opinly Deposits";
    const configured = Boolean(account);
    return {
      methodId,
      methodName: "Capitec",
      configured,
      steps: configured
        ? [
            "Open the Capitec app → Pay / Transfer → another Capitec account.",
            `Account name: ${name}. Account number: ${account}. Branch: ${branch}. Account type: savings.`,
            "Enter the exact ZAR amount on this page. Reference: your Opinly email.",
            "Wait for the Capitec SMS, then tap “I have sent the payment”.",
          ]
        : [
            "Open deposit chat and ask for the Capitec account name, number, and branch we are matching today.",
            "We will not show a dummy account number on this page.",
            "When you have the live details, send the exact ZAR amount with your Opinly email as reference.",
            "Tap “I have sent the payment” after the SMS.",
          ],
      payTo: configured
        ? [`${name}`, `Capitec ${account}`, `Branch ${branch}`, "Reference: your Opinly email"]
        : ["Ask in deposit chat for Capitec details before you send."],
    };
  }

  const generic: Record<string, string> = {
    faster: "DEPOSIT_GB_SORT_ACCOUNT",
    etransfer: "DEPOSIT_CA_INTERAC_EMAIL",
    payid: "DEPOSIT_AU_PAYID",
    sepa: "DEPOSIT_EU_IBAN",
    bankng: "DEPOSIT_NG_BANK_ACCOUNT",
    momo: "DEPOSIT_GH_MOMO",
    upi: "DEPOSIT_IN_UPI",
    gcash: "DEPOSIT_PH_GCASH",
    jazzcash: "DEPOSIT_PK_WALLET",
    bkash: "DEPOSIT_BD_BKASH",
    mmug: "DEPOSIT_UG_MM",
    mmtz: "DEPOSIT_TZ_MM",
  };
  const key = generic[methodId];
  const value = key ? env(key) : "";
  const names: Record<string, string> = {
    faster: "UK Faster Payments",
    etransfer: "Interac e-Transfer",
    payid: "PayID / Osko",
    sepa: "SEPA transfer",
    bankng: "Nigerian bank transfer",
    momo: "Mobile Money",
    upi: "UPI",
    gcash: "GCash",
    jazzcash: "JazzCash / Easypaisa",
    bkash: "bKash",
    mmug: "Uganda mobile money",
    mmtz: "M-Pesa / Tigo Pesa",
    zelle: "Zelle or ACH",
    mpesa: "M-Pesa",
    capitec: "Capitec",
  };
  const methodName = names[methodId] ?? "Local bank / wallet";
  return {
    methodId,
    methodName,
    configured: Boolean(value),
    steps: value
      ? [
          `Open your ${methodName} app.`,
          `Pay the exact amount shown to: ${value}.`,
          "Reference / note: your Opinly email.",
          "Tap “I have sent the payment” so an admin can match it.",
        ]
      : [
          `Open deposit chat and ask for today’s ${methodName} details for ${code}.`,
          "We only publish numbers we can actually receive. Until staff replies, do not send funds.",
          "When you have the live details, send the exact amount with your Opinly email as the reference.",
          "Tap “I have sent the payment”.",
        ],
    payTo: value ? [value, "Reference: your Opinly email"] : [`Ask in deposit chat for ${methodName} details before you send.`],
  };
}

export const DEPOSIT_WELCOME = "Having trouble with deposits? Send us your message.";
