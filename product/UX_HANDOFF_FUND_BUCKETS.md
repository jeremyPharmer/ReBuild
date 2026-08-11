# UXUI handoff — Future + Treat Yourself fund model

**From:** Head of Product (`cursor/head-of-product-roadmap-df3d`)  
**To:** UXUI (`cursor/home-journey-ux-589f`, PR #3)  
**Date:** 2026-08-11  
**Please review** Money + Reward/Destination moment against the locked model in [`FUND_MODEL.md`](./FUND_MODEL.md).

## Product intent (plain language)

- **Future** = longer-horizon park  
- **Treat Yourself** = short-term spendable (“ooh, I have $5 in there”)  
- On a **reward** day: choose **Treat Yourself** or **Save for the Future**  
- Treating: use Treat balance; **pull from Future if needed / wanted** for a bigger treat  

## Flows to review / adjust

### Money

- Segmented bar: only **Future** and **Treat Yourself** (no Rebuild)
- After Move $X → 30% Future / 70% Treat

### Reward / Destination moment

| Choice | Behavior |
| --- | --- |
| **Treat Yourself** | Pick/create wishlist item. Pay from Treat first. If cost > Treat, offer optional pull from Future (up to Future balance). |
| **Save for the Future** | Skip spending this time; reinforce long-horizon park. Not the old “move money into Treat.” |

Guardrail: after **2** Saves for the Future in a row, next cashable moment **must** Treat Yourself.

## Example copy direction (not final)

- Treat balance line: “Treat Yourself · $5 short-term”
- Future line: “Future · $120 parked”
- Treat with pull: “This is $40. Use $5 from Treat + $35 from Future?”
- Save: “Save for the Future — keep this win parked for later.”

## Out of scope for this review

- Venmo API / auto-pull (RB-001)
- Weekly podcast/book offers (RB-005)

## Source

- Locked model: `product/FUND_MODEL.md`
- Backlog: RB-006
