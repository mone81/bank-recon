export type Run = {
  id: string;
  period_month: string;
  total_credit: number;
  total_debit: number;
  variance: number;
  status: "open" | "reconciled" | "locked";
};

export type Tenant = { id: string; name: string; expected_monthly: number };
export type Vendor = { id: string; name: string; account_no: string | null };
export type Collection = {
  id: string;
  tenant_id: string | null;
  run_id: string | null;
  amount: number;
  collection_date: string;
  source: string | null;
  note: string | null;
  matched: number;
  status: "pending" | "matched" | "short" | "excess";
  tenants?: { name: string } | null;
};
export type Payment = {
  id: string;
  vendor_id: string | null;
  run_id: string | null;
  amount: number;
  payment_date: string;
  reference: string | null;
  status: "outstanding" | "cleared";
  vendors?: { name: string } | null;
};
export type BankTransaction = {
  id: string;
  run_id: string | null;
  txn_date: string;
  amount: number;
  direction: "credit" | "debit";
  description: string | null;
  matched_id: string | null;
  matched_type: string | null;
  status: "unmatched" | "matched" | "cleared";
};
