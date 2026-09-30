import { createClient } from "@/lib/supabase/server";
import type { BankTransaction, Collection, Payment, Run, Tenant, Vendor } from "./types";

export async function loadWorkspace(runId?: string) {
  const supabase = await createClient();
  const [runsResult, tenantsResult, vendorsResult] = await Promise.all([
    supabase.from("reconciliation_runs").select("*").order("period_month", { ascending: false }),
    supabase.from("tenants").select("id,name,expected_monthly").order("name"),
    supabase.from("vendors").select("id,name,account_no").order("name"),
  ]);
  if (runsResult.error) throw new Error(runsResult.error.message);
  if (tenantsResult.error) throw new Error(tenantsResult.error.message);
  if (vendorsResult.error) throw new Error(vendorsResult.error.message);
  const runs = (runsResult.data ?? []) as Run[];
  const tenants = (tenantsResult.data ?? []) as Tenant[];
  const vendors = (vendorsResult.data ?? []) as Vendor[];
  const activeRun = runs.find((run) => run.id === runId) ?? runs[0] ?? null;
  if (!activeRun) return { runs, tenants, vendors, activeRun, collections: [], payments: [], bankLines: [] };

  const [collectionsResult, paymentsResult, bankResult] = await Promise.all([
    supabase.from("tenant_collections").select("*, tenants(name)").eq("run_id", activeRun.id).order("collection_date", { ascending: false }),
    supabase.from("vendor_payments").select("*, vendors(name)").eq("run_id", activeRun.id).order("payment_date", { ascending: false }),
    supabase.from("bank_transactions").select("*").eq("run_id", activeRun.id).order("txn_date", { ascending: false }),
  ]);
  if (collectionsResult.error) throw new Error(collectionsResult.error.message);
  if (paymentsResult.error) throw new Error(paymentsResult.error.message);
  if (bankResult.error) throw new Error(bankResult.error.message);
  return {
    runs, tenants, vendors, activeRun,
    collections: (collectionsResult.data ?? []) as Collection[],
    payments: (paymentsResult.data ?? []) as Payment[],
    bankLines: (bankResult.data ?? []) as BankTransaction[],
  };
}
