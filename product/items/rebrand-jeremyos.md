# Rebrand to JeremyOS

| Field | Value |
| --- | --- |
| ID | RB-012 |
| Rank | 1 |
| Priority | P0 |
| Status | Ready |
| Effort | M |
| Target due | TBD |
| Milestone | v1 |
| Owner | Product |

## Problem

The product is still framed and named as **ReBuild** — a generic recovery app with incentives. The founder has decided on a rebrand to **JeremyOS** (corrected from an early “Jeremy PS” lean). Naming and framing still sell a multi-user recovery product, not a personal OS for Jeremy.

## Outcome

Product docs, user-facing naming, and framing consistently present **JeremyOS**: Jeremy’s personal operating system for the things he wants — not a polished generic recovery SaaS.

## Scope (v1)

- Lock product name **JeremyOS** in roadmap, backlog, and decision docs (this item)
- Product framing copy: personal OS / things Jeremy wants; drop “generic recovery product to love daily” as the north star
- Inventory surfaces that still say ReBuild (app chrome, onboarding, emails, Fly app names) and ship a thin rename pass where low-risk
- Keep historical IDs (`RB-*`) and repo/path history; do not rewrite git history

## Out of scope / later

- Full marketing site / public launch under JeremyOS
- Renaming Fly apps, domains, or package names if that risks deploy breakage (track as follow-on if needed)
- Killing recovery/fund features solely because of the name change (see RB-013 + fund model)

## Dependencies & risks

- UXUI owns user-visible string/chrome changes after product framing lands
- Avoid half-renames that confuse (docs say JeremyOS, UI still screams ReBuild) — prefer one coherent pass for high-traffic chrome
- Open: legal / display variants (“Jeremy OS” vs “JeremyOS”) — default **JeremyOS**

## Notes

- Intake **2026-08-29** from founder: first lean “Jeremy PS” → corrected to **JeremyOS**.
- Rank **1** / **P0** — naming and framing must lead the personal-OS pivot before feature work is re-sold as ReBuild polish.
- Related: [RB-013 Personal OS north star](./personal-os-north-star.md).
