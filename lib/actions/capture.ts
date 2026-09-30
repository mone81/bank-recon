"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function amountFrom(formData: FormData, field = "amount") {
  const value = Number(formData.get(field));
  if (!Number.isFinite(value) || value <= 0) throw new Error("Enter an amount greater than zero.");
  return Math.round(value * 100) / 100;
}
function dateFrom(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Enter a valid date.");
  return value;
}
function textFrom(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}
async function ensureOpenRun(supabase: Awaited<ReturnType<typeof createClient>>, runId: string) {
  const { data: run, error } = await supabase.from("reconciliation_runs").select("id,status").eq("id", runId).single();
  if (error || !run) throw new Error("Reconciliation run not found.");
  if (run.status !== "open") throw new Error("This run is reconciled or locked and cannot be changed.");
}
async function refresh(runId?: string) {
  revalidatePath("/");
  if (runId) revalidatePath(`/recon/${runId}`);
}

export async function createRun(formData: FormData) {
  const month = textFrom(formData, "period_month");
  if (!/^\d{4}-\d{2}$/.test(month) || Number(month.slice(5)) < 1 || Number(month.slice(5)) > 12) throw new Error("Choose a valid month.");
  const supabase = await createClient();
  const { data, error } = await supabase.from("reconciliation_runs").insert({ period_month: `${month.slice(0, 7)}-01` }).select("id").single();
  if (error) throw new Error(error.message);
  await refresh(data.id);
}

export async function createTenant(formData: FormData) {
  const name = textFrom(formData, "name");
  if (!name) throw new Error("Tenant name is required.");
  const expected = Number(formData.get("expected_monthly"));
  if (!Number.isFinite(expected) || expected < 0) throw new Error("Expected rent must be zero or greater.");
  const supabase = await createClient();
  const { error } = await supabase.from("tenants").insert({ name, expected_monthly: expected });
  if (error) throw new Error(error.message);
  await refresh();
}

export async function createVendor(formData: FormData) {
  const name = textFrom(formData, "name");
  if (!name) throw new Error("Vendor name is required.");
  const supabase = await createClient();
  const { error } = await supabase.from("vendors").insert({ name, account_no: textFrom(formData, "account_no") || null });
  if (error) throw new Error(error.message);
  await refresh();
}

export async function captureCollection(formData: FormData) {
  const runId = textFrom(formData, "run_id");
  const tenantId = textFrom(formData, "tenant_id");
  if (!tenantId) throw new Error("Choose a tenant.");
  const supabase = await createClient();
  await ensureOpenRun(supabase, runId);
  const { error } = await supabase.from("tenant_collections").insert({
    run_id: runId, tenant_id: tenantId, amount: amountFrom(formData),
    collection_date: dateFrom(formData, "collection_date"),
    source: textFrom(formData, "source") || null, note: textFrom(formData, "note") || null,
  });
  if (error) throw new Error(error.message);
  await refresh(runId);
}

export async function capturePayment(formData: FormData) {
  const runId = textFrom(formData, "run_id");
  const vendorId = textFrom(formData, "vendor_id");
  if (!vendorId) throw new Error("Choose a vendor.");
  const supabase = await createClient();
  await ensureOpenRun(supabase, runId);
  const { error } = await supabase.from("vendor_payments").insert({
    run_id: runId, vendor_id: vendorId, amount: amountFrom(formData),
    payment_date: dateFrom(formData, "payment_date"), reference: textFrom(formData, "reference") || null,
  });
  if (error) throw new Error(error.message);
  await refresh(runId);
}

export async function captureBankLine(formData: FormData) {
  const runId = textFrom(formData, "run_id");
  const supabase = await createClient();
  await ensureOpenRun(supabase, runId);
  const description = textFrom(formData, "description");
  const direction = textFrom(formData, "direction");
  if (!description) throw new Error("Add a bank statement description.");
  if (direction !== "credit" && direction !== "debit") throw new Error("Choose credit or debit.");
  const { error } = await supabase.from("bank_transactions").insert({
    run_id: runId, txn_date: dateFrom(formData, "txn_date"), amount: amountFrom(formData), direction, description,
  });
  if (error) throw new Error(error.message);
  await refresh(runId);
}

