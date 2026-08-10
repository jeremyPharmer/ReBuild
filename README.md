# ReBuild

A recovery app with incentives. Track your recovery streak, earn points for
daily check-ins, and redeem those points for rewards.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router) + React 19
- TypeScript
- Tailwind CSS v4
- [Vitest](https://vitest.dev/) for unit tests
- File-backed JSON store (no database required) at `.data/db.json`

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:3000
```

## Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the development server (port 3000)     |
| `npm run build`     | Production build                             |
| `npm start`         | Run the production build                     |
| `npm run lint`      | Run ESLint                                   |
| `npm run typecheck` | Type-check with `tsc --noEmit`               |
| `npm test`          | Run unit tests (Vitest)                      |

## How it works

- **Create a profile** — enter a name and pick a recovery goal.
- **Daily check-in** — earn `10` points per day. Consecutive days build a
  streak; milestone streaks (3, 7, 14, 30 days) award bonus points.
- **Rewards store** — spend points on rewards (coffee voucher, journal, movie
  ticket, charity donation).

The core incentive logic lives in `src/lib/incentives.ts` (pure functions, unit
tested), persistence in `src/lib/store.ts`, and the API routes under
`src/app/api/`.
