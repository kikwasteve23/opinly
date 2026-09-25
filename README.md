# Opinly

Opinly is a paid online-research platform: participants complete studies in the browser, see pay up front, and withdraw after they have **20 active referrals**, a **$500** available balance, and a **$50** wallet-activation deposit (credited to the balance).

## Run locally

```bash
cp .env.example .env.local
npm install
npm test
npm run dev
```

Open [http://localhost:43173](http://localhost:43173).

| Account | Email | Password |
| --- | --- | --- |
| Participant (20 seeded active referrals, $512 available) | `demo@opinly.local` | `demo-dev-only` |
| Admin | `admin@opinly.local` | `admin-dev-only` |

Demo forgot-password codes (one-time each, only if the demo account has not issued a new set): `SAVE-K7M2`, `SAVE-P9N4`, `SAVE-Q3W8`, `SAVE-T5H6`, `SAVE-R2J9`, `SAVE-X4C7`, `SAVE-B8D3`, `SAVE-F6G2`.

Without `DATABASE_URL`, state is stored in `data/store.json`. With Postgres, live state is the `app_state` JSON document.

## Render + Neon Postgres

The live site uses **file storage** until `DATABASE_URL` is set. Check `https://YOUR-APP.onrender.com/api/health`. You want `"database": "postgres"`. `"file"` means Neon is not connected.

### 1. Copy the Neon URL

In [Neon](https://console.neon.tech):

1. Open a project (create **New project** named Opinly, or use an existing one).
2. Click the project → **Connection details**.
3. Copy the URI. Prefer **Pooled connection** (host contains `-pooler`).
4. It looks like:
   `postgresql://USER:PASSWORD@ep-....neon.tech/neondb?sslmode=require`

You can keep using `aurelia-jewelry-db` if you want; create a database named `opinly` there, or use the default `neondb`.

### 2. Put it on Render

Render dashboard → your **Web Service** → **Environment**:

| Key | Value |
| --- | --- |
| `DATABASE_URL` | paste the Neon URI (no quotes, no extra spaces) |
| `APP_SECRET` | long random string |
| `APP_URL` | `https://your-service.onrender.com` |
| `DEMO_ADMIN_PASSWORD` | the password you will type for staff |
| `DEMO_USER_PASSWORD` | optional; defaults to `demo-dev-only` |
| `OPENAI_API_KEY` | optional; admin survey drafts. Without it, a built-in writer is used |

Save. **Manual Deploy → Deploy latest commit** so the new env vars load.

### 3. Open admin

Admin is **not** in the participant menu.

1. Open `https://your-service.onrender.com/login?staff=1`
2. Email: `admin@opinly.local`
3. Password: the `DEMO_ADMIN_PASSWORD` you set **before** the database was first seeded. If you never set it, try `admin-dev-only`.
4. You should land on `/admin`.

If you were already logged in as a participant, you will see a “Staff only” page — log out first.

If staff login fails after you later changed `DEMO_ADMIN_PASSWORD`, the hash in Postgres is still the old password. Either use the original password, or delete the `users` / `app_state` rows in Neon and redeploy so the admin account is seeded again.

## What you can do

- Create an account and **copy the 8 emergency recovery codes** (XXXX-XXXX). There is no email reset. Use one unused code on `/forgot-password`. Issue a fresh set from Profile. A browser may register at most **3** accounts (cookie + local device token); a fourth attempt shows “This device cannot be used to register more than three accounts.”
- Join with a referral code, finish profile and English (ID is optional later; add a profile photo from Profile)
- Take Beginner studies until your **wallet** (available plus pending) reaches $400, then Beginner work pauses. Share referrals or hire a marketer. Bronze / Gold / Platinum work then appears locked until you have 20 / 50 / 100 active referrals
- Completed studies stay in pending while we review responses (approvals also run in the background)
- Withdraw from $500 after a $50 activation deposit that an admin must match and approve (added to available, not a fee). Deposit methods follow the participant’s country plus NOWPayments
- Hire marketers ($5–$10 per referral). Pay before at the listed price, or pay after they land for 10% extra.
- After onboarding, a lounge chat icon sits at the bottom right (it hides on the deposit page so phone users can see the steps). Two staff names take questions. Join the chat asks you to activate with $50, which is credited and withdrawn with your first cash-out.
- **Deposit chat is live.** Participants send a message on `/app/deposit`. Staff reply from **Admin → Deposit chat**. There is no auto-reply. The first line is always “Having trouble with deposits? Send us your message.”

## Live payment details (required before launch)

Until these env vars are set, the deposit page **will not print account numbers**. It tells people to ask in deposit chat. Put real values on Render (Environment) and redeploy:

| Key | What to paste |
| --- | --- |
| `DEPOSIT_USDT_TRC20` | Your USDT TRC20 address (starts with `T`) |
| `DEPOSIT_US_ZELLE` | Zelle email or US phone |
| `DEPOSIT_US_BANK_NAME` | Bank name for ACH |
| `DEPOSIT_US_ACH_ROUTING` | ACH routing number |
| `DEPOSIT_US_ACH_ACCOUNT` | ACH account number |
| `DEPOSIT_KE_MPESA_PAYBILL` | M-Pesa paybill |
| `DEPOSIT_KE_MPESA_ACCOUNT` | Account format (or leave as email) |
| `DEPOSIT_ZA_CAPITEC_NAME` | Account name |
| `DEPOSIT_ZA_CAPITEC_ACCOUNT` | Capitec account number |
| `DEPOSIT_ZA_CAPITEC_BRANCH` | Branch (default `470010`) |
| `DEPOSIT_GB_SORT_ACCOUNT` | `sort-code account` |
| `DEPOSIT_CA_INTERAC_EMAIL` | Interac email |
| `DEPOSIT_AU_PAYID` | PayID |
| `DEPOSIT_EU_IBAN` | IBAN |
| `DEPOSIT_NG_BANK_ACCOUNT` | Nigerian account |
| `DEPOSIT_GH_MOMO` | MoMo number |
| `DEPOSIT_IN_UPI` | UPI ID |
| `DEPOSIT_PH_GCASH` | GCash number |
| `DEPOSIT_PK_WALLET` | JazzCash / Easypaisa |
| `DEPOSIT_BD_BKASH` | bKash |
| `DEPOSIT_UG_MM` | Uganda MM |
| `DEPOSIT_TZ_MM` | Tanzania MM |

Staff login: `/login?staff=1` → Admin → **Deposit chat**. Reply there; the participant’s thread updates within a few seconds.
- Admin (`/login?staff=1` — not linked from the public site) → `/admin`:
  - **Surveys** — write studies by hand or generate a draft with AI, then publish
  - **Applicants** — review identity applications and approve or reject
  - **People** — search participants, open a profile, and add or remove referrals by count or email
  - **Deposits** — match activation and marketer payments
  - **Deposit chat** — live replies to people stuck on payment
  - **Withdrawals** — mark crypto payouts sent, or reject and refund
  - **Study reviews** — approve completed work so pay moves to available
