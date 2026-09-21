# Opinly

Opinly is a paid online-research platform: participants complete studies in the browser, see pay and length up front, and withdraw approved earnings to crypto.

This is a working product slice with its own branding (name, indigo palette, and logo). It is **not** affiliated with PaidSay. Identity checks and withdrawals are simulated locally so you can try the full flow without sending documents or funds.

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
| Pre-verified demo | `demo@opinly.local` | `demo-dev-only` |

New accounts go through profile, English, and identity onboarding. In this demo the identity step auto-approves.

Without extra infrastructure, state is stored in `data/store.json`.

## What you can do

- Marketing site with how-it-works, studies, payouts, and FAQ
- Register / log in
- Onboarding (profile, English assessment, identity)
- Dashboard of matched studies
- Take a study with saved progress, attention checks, and approval into the wallet
- Withdraw to USDT (TRC20) or Litecoin with the 5% platform fee and network fee shown before confirm

## Environment

See `.env.example`. Never commit real credentials.
