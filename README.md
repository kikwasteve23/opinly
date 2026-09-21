# Opinly

Opinly is a paid online-research platform: participants complete studies in the browser, see pay up front, and withdraw approved earnings to crypto after they have **15 identity-verified referrals**.

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
| Participant (15 seeded referrals) | `demo@opinly.local` | `demo-dev-only` |
| Admin | `admin@opinly.local` | `admin-dev-only` |

Without `DATABASE_URL`, state is stored in `data/store.json`. With Postgres, the same data is written to `app_state` plus `users`, `submissions`, and `withdrawals` tables.

## Render

1. Create a **PostgreSQL** instance. Copy the **Internal Database URL**.
2. Web service from this repo:
   - Build: `npm ci && npm run build`
   - Start: `npm run start` (binds to Render’s `PORT`)
   - Health check: `/api/health`
3. Environment:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Render Postgres URL |
| `APP_SECRET` | long random string |
| `APP_URL` | `https://your-service.onrender.com` |
| `DEMO_ADMIN_PASSWORD` | admin password |
| `DEMO_USER_PASSWORD` | optional demo participant |

On first boot the app creates tables and seeds the demo/admin accounts.

## What you can do

- Join with a referral code, finish profile / English / identity
- Take studies; pay sits in **pending** until an admin approves the submission
- Withdraw USDT (TRC20) or Litecoin after 15 verified referrals; an admin marks payouts sent
- Admin: `/admin` — people, identity, wallet adjustments, study review, payouts
