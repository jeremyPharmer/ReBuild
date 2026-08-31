# JeremyOS

Jeremy's executive assistant and personal operating system — daily rhythm, journal, fund, and recovery tools in one place.

## Product rules (locked for V1)

- **Daily companion wins** when systems conflict; money makes it tangible
- Abstinence-only reclaim (no partial days)
- Home label: **Day N** = calendar days on the **current run**
  (Day 1 = start date)
- Return to use resets the run counter; milestone **history stays**; you
  can **re-achieve** milestones; reward pools grow with later days
- Reclaim is separate from day counting (Venmo confirm in the evening)
- Auth + multi-user (see onboarding)
- Honor system everywhere

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- File-backed JSON store at `.data/db.json`
- Vitest for journey/money logic

## Scripts

```bash
npm install
npm run dev      # http://localhost:3000
npm test
npm run build
```

## Live URLs (Fly.io)

| Env | URL | Notes |
|---|---|---|
| **Prod (now)** | https://rebuild-prod.fly.dev | Legacy app name; JeremyOS branding live |
| **Prod (target)** | https://jeremyos-prod.fly.dev | After URL migration — see `DEPLOY.md` |
| **Dev** | https://jeremyos-dev.fly.dev | Create app when needed |

See `DEPLOY.md`, `PRODUCT_DECISIONS.md`, and `product/` (roadmap + locked fund model).

**Fund buckets (locked):** Future 30% (longer-horizon park) + Treat Yourself 70% (short-term). On reward days: Treat Yourself (Treat first, optional Future pull) or Save for the Future.

## First-run path

1. `/onboarding` — account, supports, fund split, rewards
2. `/morning` — Start the day
3. `/plan` — log supports
4. `/evening` — Close the day + one-line journal
5. `/money` — reclaim ledger, wishlist
6. `/journey` — day log + milestone history
7. `/settings` — spend, supports, email nudges
8. `/craving` — delay + intervention

Primary nav: Home · Journey · Journal · Settings
