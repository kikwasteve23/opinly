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

- Join with a referral code, finish profile / English / identity
- Take Beginner studies until $400 in pending plus approved study pay, then Bronze / Gold / Platinum work appears locked until you have 20 / 50 / 100 active referrals
- Completed studies stay in pending while we review responses (approvals also run in the background)
- Withdraw from $500 after a $50 activation deposit that an admin must match and approve (added to available, not a fee). Deposit methods follow the participant’s country plus NOWPayments
- Hire marketers ($5–$10 per referral) to fill slots in 1–2 hours
- Idle sessions sign out after 25 minutes
- Admin (`/login?staff=1` — not linked from the public site) → `/admin`:
  - **Surveys** — write studies by hand or generate a draft with AI, then publish
  - **Applicants** — review identity applications and approve or reject
  - **People** — search participants and open a full profile preview
  - **Deposits** — people who paid via a local method or NOWPayments wait here for approval; you can also adjust a ledger by hand
  - **Withdrawals** — mark crypto payouts sent, or reject and refund
  - **Study reviews** — approve completed work so pay moves to available
