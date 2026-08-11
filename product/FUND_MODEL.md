# Fund model (locked)

Last updated: 2026-08-11  
Status: **Decision locked** — supersedes three-bucket 50/25/25 in prior V1 notes.

## Why we had three buckets

| Bucket | Original intent |
| --- | --- |
| **Future** | Longer-horizon goals — keep money parked for bigger later aims |
| **Rebuild** | “Life spends” while rebuilding — practical spends that aren’t a treat and aren’t long-term savings |
| **Treat Yourself** | Near-term celebration / wishlist — cashable on Reward & Destination days; fed by Save & compound |

**Rebuild** was meant as a middle spending lane. In practice it overlaps both sides: practical life spends can come from Future later, and celebratory spends already have Treat. Three segments also make the Venmo-matching bar harder to read without adding a clear third *user*.

## Locked model: two buckets, 50 / 50

On each confirmed **Move to Rebuild** amount `$X`:

| Bucket | Share | Job |
| --- | --- | --- |
| **Future** | **50%** | Park money for larger / later goals |
| **Treat Yourself** | **50%** | Near-term incentive pool for wishlist Treats; also receives Save & compound and the weekly $20 gift |

**Venmo-matching Total** = Future + Treat Yourself  
**What I Rebuilt** (spent / left Venmo) still sits outside Total.

### Flow rules under two buckets

- **Save & compound** → move $ into **Treat** from **Future** (only source left). Leftover vs suggested stays in Future, not Treat.
- **Treat Yourself** spend → debit Treat; only if Treat ≥ item cost.
- Practical “rebuild life” spends that used to debit Rebuild → either (a) treat as **What I Rebuilt** from Treat when it’s a wishlist win, or (b) spend from **Future** when it’s a longer-horizon life investment. No third ledger line.
- Weekly support gift ($20 OOP) → still into **Treat**; still does not count toward Save-delay.

### What we drop

- Rebuild fund segment (25%)
- Split of 50 / 25 / 25
- “Debit Rebuild for life spends” as a separate path

## Implementation note

App code on the daily-loop branch still uses `future / rebuild / treat` and `splitTransfer` 50/25/25. Implementers should migrate ledger + UI bar + Save sourcing to **Future + Treat @ 50/50** per this doc.
