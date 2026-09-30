# Intelligence Layer

## Messy inputs
- Tenant collection source field is free text ("cash", "Bank transfer", "chq").
- Bank statement descriptions are noisy ("NEFT GREENFIELD RENT MAY").
- Vendor payment references vary ("INV-223", "may power", blank).

## Auto-structure (later)
Normalize raw statement line -> match candidate:
```json
{
  "raw": "NEFT GREENFIELD RENT MAY",
  "amount": 5000.00,
  "direction": "credit",
  "candidates": [
    {"type": "tenant", "id": "...", "name": "Greenfield Retail", "score": 0.92}
  ],
  "best_match_id": "...",
  "confidence": 0.92,
  "source": "name+amount fuzzy",
  "review_status": "unreviewed"
}
```

## Events to track
- collection_captured, collection_matched (matched/short/excess)
- payment_captured, payment_cleared
- run_created, run_closed
- match_suggested (later), match_accepted/rejected (later)

## Scoring rules (start rule-based, later)
- amount exact + tenant name contains -> 0.90
- amount within 5% + name fuzzy -> 0.75
- amount exact + vendor ref contains -> 0.85
- unmatched -> 0.0
Threshold >= 0.80 auto-suggests; below requires manual match.

## What gets ranked
Unmatched bank_transactions ranked by best candidate score, highest first, on the match queue.

## v1 vs later
- v1: manual match + clear, status computed by exact rules, no AI.
- Later: fuzzy auto-match, confidence stored, review queue, learn from accept/reject.