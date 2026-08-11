# REBUILD

You're not starting over. You're building from here.

Mobile-web V1 of Rebuild — a daily recovery companion with a financial
operating system for abstinence (cannabis + alcohol as one journey).

## Product rules (locked for V1)

- **Daily companion wins** when systems conflict; money makes it tangible
- Abstinence-only reclaim (no partial days)
- Home label: **ReBuilding for N days** = calendar days on the **current run**
  (Day 1 = start date)
- Return to use resets the run counter; milestone **history stays**; you
  re-climb and can **re-achieve** milestones; reward pools grow with later days
- Reclaim is separate from day counting (Venmo confirm in the evening)
- No auth — open the link and go
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

| Env | URL | Data |
|---|---|---|
| **Dev** | https://rebuild-dev.fly.dev | Test / sample |
| **Prod** | https://rebuild-prod.fly.dev | Founder true-source |

See `DEPLOY.md`, `PRODUCT_DECISIONS.md`, and `product/` (roadmap + locked fund model).

**Fund buckets (locked):** Future 30% (longer-horizon park) + Treat Yourself 70% (short-term). On reward days: Treat Yourself (Treat first, optional Future pull) or Save for the Future.

## First-run path

1. `/onboarding` — goal, combined daily spend, default supports
2. `/morning` — Start the day
3. `/plan` — log supports (content asks “what will you do differently?”)
4. `/evening` — Close the day + one-line journal (+ Move to Rebuild)
5. `/money` — reclaim ledger, wishlist, What I Rebuilt (Rewards tab)
6. `/journey` — adventure map + milestone history
7. `/settings` — spend, supports, this week’s plan
8. `/craving` — delay + intervention

Primary nav: Home · Journey · Rewards · Journal · Settings
