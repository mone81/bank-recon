"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

export async function matchCollection(formData: FormData) {
  const runId = textFrom(formData, "run_id");
  const collectionId = textFrom(formData, "collection_id");
  const supabase = await createClient();
  await ensureOpenRun(supabase, runId);
  const [{ data: collection, error: collectionError }, { data: tenant, error: tenantError }] = await Promise.all([
    supabase.from("tenant_collections").select("id,amount,tenant_id,run_id").eq("id", collectionId).eq("run_id", runId).single(),
    supabase.from("tenant_collections").select("tenants(expected_monthly)").eq("id", collectionId).single(),
  ]);
  if (collectionError || !collection) throw new Error("Collection not found.");
  if (tenantError) throw new Error(tenantError.message);
  const tenantInfo = tenant?.tenants as unknown as { expected_monthly: number } | { expected_monthly: number }[] | null;
  const expected = Number((Array.isArray(tenantInfo) ? tenantInfo[0] : tenantInfo)?.expected_monthly ?? 0);
  if (expected <= 0) throw new Error("No expected amount set for tenant.");
  const status = collection.amount === expected ? "matched" : collection.amount < expected ? "short" : "excess";
  const { data: bankLine, error: bankError } = await supabase.from("bank_transactions").select("id").eq("run_id", runId).eq("direction", "credit").eq("amount", collection.amount).eq("status", "unmatched").limit(1).maybeSingle();
  if (bankError) throw new Error(bankError.message);
  const { error } = await supabase.from("tenant_collections").update({ matched: Math.min(collection.amount, expected), status }).eq("id", collectionId);
  if (error) throw new Error(error.message);
  if (bankLine) {
    const { error: linkError } = await supabase.from("bank_transactions").update({ matched_id: collectionId, matched_type: "collection", status: "matched" }).eq("id", bankLine.id);
    if (linkError) throw new Error(linkError.message);
  }
  await refresh(runId);
}

export async function clearPayment(formData: FormData) {
  const runId = textFrom(formData, "run_id");
  const paymentId = textFrom(formData, "payment_id");
  const bankId = textFrom(formData, "bank_id");
  const supabase = await createClient();
  await ensureOpenRun(supabase, runId);
  const [{ data: payment, error: paymentError }, { data: bankLine, error: bankError }] = await Promise.all([
    supabase.from("vendor_payments").select("id,amount,run_id").eq("id", paymentId).eq("run_id", runId).single(),
    supabase.from("bank_transactions").select("id,amount,direction,status,run_id").eq("id", bankId).eq("run_id", runId).single(),
  ]);
  if (paymentError || !payment) throw new Error("Payment not found.");
  if (bankError || !bankLine) throw new Error("Bank line not found.");
  if (bankLine.direction !== "debit" || bankLine.status !== "unmatched") throw new Error("Choose an unmatched debit line.");
  if (Number(bankLine.amount) !== Number(payment.amount)) throw new Error("Payment and bank line amounts must match.");
  const { error: paymentUpdateError } = await supabase.from("vendor_payments").update({ status: "cleared", cleared_at: new Date().toISOString() }).eq("id", paymentId);
  if (paymentUpdateError) throw new Error(paymentUpdateError.message);
  const { error } = await supabase.from("bank_transactions").update({ matched_id: paymentId, matched_type: "payment", status: "cleared" }).eq("id", bankId);
  if (error) throw new Error(error.message);
  await refresh(runId);
}

export async function reconcileRun(formData: FormData) {
  const runId = textFrom(formData, "run_id");
  const supabase = await createClient();
  await ensureOpenRun(supabase, runId);
  const [bankResult, ledgerResult] = await Promise.all([
    supabase.from("bank_transactions").select("amount,direction,status").eq("run_id", runId),
    supabase.from("tenant_collections").select("amount,status").eq("run_id", runId).then(async (collections) => {
      const payments = await supabase.from("vendor_payments").select("amount,status").eq("run_id", runId);
      return { collections, payments };
    }),
  ]);
  if (bankResult.error) throw new Error(bankResult.error.message);
  if (ledgerResult.collections.error) throw new Error(ledgerResult.collections.error.message);
  if (ledgerResult.payments.error) throw new Error(ledgerResult.payments.error.message);
  const bankLines = bankResult.data ?? [];
  const totalCredit = bankLines.filter((line) => line.direction === "credit").reduce((sum, line) => sum + Number(line.amount), 0);
  const totalDebit = bankLines.filter((line) => line.direction === "debit").reduce((sum, line) => sum + Number(line.amount), 0);
  const collections = (ledgerResult.collections.data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  const payments = (ledgerResult.payments.data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  const variance = Math.round(((totalCredit - totalDebit) - (collections - payments)) * 100) / 100;
  const { error: totalsError } = await supabase.from("reconciliation_runs").update({ total_credit: totalCredit, total_debit: totalDebit, variance }).eq("id", runId);
  if (totalsError) throw new Error(totalsError.message);
  if (variance !== 0) throw new Error("Variance must be 0 before this run can be reconciled.");
  const { error } = await supabase.from("reconciliation_runs").update({ status: "reconciled", closed_at: new Date().toISOString() }).eq("id", runId);
  if (error) throw new Error(error.message);
  await refresh(runId);
}
