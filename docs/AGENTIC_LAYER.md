# Agentic Layer

## Draftable actions (low risk — auto, later)
- Suggest a match between a bank_transaction and a payment/collection (draft only).
- Tag a collection source (normalize free text).
- Compute variance and totals for a run (pure calc).

## Executable after approval (medium risk — later)
- Apply a suggested match (updates status + matched_id).
- Set a vendor_payment status to cleared.
- Mark a run reconciled (only if variance = 0).

## Human-only actions (critical)
- Lock a reconciliation run (irreversible for the month).
- Delete a collection or payment.
- Edit an amount after a run is locked.

## Named tools (later)
- `suggest_match(txn_id)` -> returns candidates + confidence
- `apply_match(txn_id, target_id, type)` -> updates rows, logs action
- `clear_payment(payment_id)` -> sets cleared + cleared_at
- `close_run(run_id)` -> checks variance=0, sets reconciled
- `lock_run(run_id)` -> HUMAN ONLY
- Never expose raw `run_sql` / `send_any`.

## Audit log fields (later)
- id · user_id · action · tool_name · target_table · target_id · before (jsonb) · after (jsonb) · created_at
- Every apply/clear/close/lock writes a row.

## v1 vs later
- v1: direct manual actions via server actions, no agent, all human-triggered.
- Later: agent drafts matches, human approves, audit logged.