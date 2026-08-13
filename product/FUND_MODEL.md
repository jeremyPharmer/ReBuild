# Fund model (locked)

Last updated: 2026-08-11  
Status: **Decision locked** — supersedes three-bucket 50/25/25 and the old “Save into Treat” direction.

## Mental model

| Bucket | Horizon | Job |
| --- | --- | --- |
| **Future** | Longer | Park money for bigger / later goals |
| **Treat Yourself** | Short-term | Near-term spendable incentive — “I have $7 in here…” |

**Venmo-matching Total** = Future + Treat Yourself  
**What I Rebuilt** (spent / left Venmo) sits outside Total.

## Split on each Move

On each confirmed **Move to Rebuild** amount `$X`, split by the user’s **Treat / Future** mix (chosen at onboarding; recommended default **70% Treat / 30% Future**):

| Bucket | Default share |
| --- | --- |
| **Future** | **30%** (recommended) |
| **Treat Yourself** | **70%** (recommended) |

Stored on the profile as `treatSplit` and applied to every Move. Weekly support gift ($20 OOP) → into **Treat**; does not count toward Save-delay.

## Reward / Destination moment (UX)

When the journey hits a **Reward** or **Destination** day, present two choices:

### 1. Treat Yourself (short-term)

- Spend on a wishlist item (or create one in-flow).
- Default pay-from: **Treat Yourself** balance.
- User may spend **up to the Treat balance**, and **optionally pull from Future** if they want a bigger treat than Treat alone covers.
- Example: Treat = $7, item = $40 → user can pull $33 from Future (if available) to complete the Treat, or pick a cheaper item, or Save for the Future instead.
- Debits: Treat first, then any opted Future pull. Logged under **What I Rebuilt**.

### 2. Save for the Future (longer horizon)

- Choose **not** to spend the short-term Treat right now.
- Reinforces parking for later — Future stays the long-horizon bucket.
- Does **not** move money *into* Treat (that old “Save & compound → Treat” direction is **retired**).
- Max **2 Saves for the Future in a row**; 3rd reward moment **must** Treat Yourself (Save hidden) so the short-term loop still fires.

## What we drop

- **Rebuild** middle bucket (25%)
- Split of 50 / 25 / 25
- “Save & compound” that moved Future → Treat
- Rule that Treat spend required Treat ≥ full cost with no Future pull

## UX review ask (UXUI)

Please review Money + reward-moment flows for:

1. Two-segment bar: Future | Treat Yourself (30/70 after each Move)
2. Reward screen copy: **Treat Yourself** vs **Save for the Future**
3. Treat flow: show Treat balance; allow optional **pull from Future** when item > Treat
4. Clear short-term vs long-horizon language (Treat = now / soon; Future = park)

Handoff detail: `product/UX_HANDOFF_FUND_BUCKETS.md`

## Implementation note

App code may still use `future / rebuild / treat` and 50/25/25. Migrate ledger + Money UI + milestone reward screen to this model.
