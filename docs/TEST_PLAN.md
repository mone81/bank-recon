# Test Plan

## v1 success scenario (manual)
1. Open app -> see May run with seeded collections/payments, no login.
2. Click **Add Collection** -> tenant Greenfield Retail, amount 5000, date today, source Bank transfer -> save.
3. Ledger shows new row, status pending, matched 0.
4. Click **Match** on that row -> status matched, matched 5000.
5. Click **Add Payment** -> vendor ABC Suppliers, amount 4500, reference INV-223 -> save.
6. Ledger shows payment, status outstanding.
7. Click **Clear** on that payment + select matching bank line -> status cleared, cleared_at set.
8. Run page shows total_credit, total_debit, variance = 0.
9. Click **Mark Reconciled** -> status reconciled.
10. Refresh page -> all changes persist.

## Empty states
- New empty run: ledger shows "No collections or payments yet" + add buttons.
- No vendors: vendor picker shows "Add a vendor first".

## Error states
- Match collection where expected_monthly = 0 -> shows "No expected amount set for tenant".
- Mark reconciled when variance != 0 -> button disabled with "Variance must be 0".
- Submit form with missing amount -> validation error, no row written.

## Loading states
- Ledger loads with skeleton rows before data.
- Form submit shows spinner, disables button until done.

## Permission (later)
- Logged-out on demo landing: seed rows visible, no write.
- Logged-in: only own rows; another user's row not visible.