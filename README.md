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
- Take studies; pay sits in **pending** until an admin approves the submission
- Withdraw USDT (TRC20) or Litecoin after 15 verified referrals; an admin marks payouts sent
- Admin: `/admin` — people, identity, wallet adjustments, study review, payouts
