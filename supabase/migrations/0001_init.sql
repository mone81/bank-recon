-- CORE TABLES ONLY (vendors, tenants, bank_transactions, vendor_payments, tenant_collections, reconciliation_runs)
-- Note: users/teams/memberships/activity_logs/audit_logs use platform tables (later sprint).

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  account_no text,
  created_at timestamptz not null default now()
);
alter table vendors enable row level security;
drop policy if exists "vendors_v1_read" on vendors;
create policy "vendors_v1_read" on vendors for select using (true);
drop policy if exists "vendors_v1_write" on vendors;
create policy "vendors_v1_write" on vendors for all using (true) with check (true);

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  expected_monthly numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);
alter table tenants enable row level security;
drop policy if exists "tenants_v1_read" on tenants;
create policy "tenants_v1_read" on tenants for select using (true);
drop policy if exists "tenants_v1_write" on tenants;
create policy "tenants_v1_write" on tenants for all using (true) with check (true);

create table if not exists bank_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  run_id uuid references reconciliation_runs(id) on delete set null,
  txn_date date not null default current_date,
  amount numeric(12,2) not null,
  direction text not null check (direction in ('credit','debit')),
  description text,
  matched_id uuid,
  matched_type text,
  status text not null default 'unmatched' check (status in ('unmatched','matched','cleared')),
  created_at timestamptz not null default now()
);
alter table bank_transactions enable row level security;
drop policy if exists "bank_transactions_v1_read" on bank_transactions;
create policy "bank_transactions_v1_read" on bank_transactions for select using (true);
drop policy if exists "bank_transactions_v1_write" on bank_transactions;
create policy "bank_transactions_v1_write" on bank_transactions for all using (true) with check (true);

create table if not exists vendor_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  vendor_id uuid references vendors(id) on delete set null,
  run_id uuid references reconciliation_runs(id) on delete set null,
  amount numeric(12,2) not null,
  payment_date date not null default current_date,
  reference text,
  status text not null default 'outstanding' check (status in ('outstanding','cleared')),
  cleared_at timestamptz,
  created_at timestamptz not null default now()
);
alter table vendor_payments enable row level security;
drop policy if exists "vendor_payments_v1_read" on vendor_payments;
create policy "vendor_payments_v1_read" on vendor_payments for select using (true);
drop policy if exists "vendor_payments_v1_write" on vendor_payments;
create policy "vendor_payments_v1_write" on vendor_payments for all using (true) with check (true);

create table if not exists tenant_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  tenant_id uuid references tenants(id) on delete set null,
  run_id uuid references reconciliation_runs(id) on delete set null,
  amount numeric(12,2) not null,
  collection_date date not null default current_date,
  source text,
  note text,
  matched numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','matched','short','excess')),
  created_at timestamptz not null default now()
);
alter table tenant_collections enable row level security;
drop policy if exists "tenant_collections_v1_read" on tenant_collections;
create policy "tenant_collections_v1_read" on tenant_collections for select using (true);
drop policy if exists "tenant_collections_v1_write" on tenant_collections;
create policy "tenant_collections_v1_write" on tenant_collections for all using (true) with check (true);

create table if not exists reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  period_month date not null,
  total_credit numeric(12,2) not null default 0,
  total_debit numeric(12,2) not null default 0,
  variance numeric(12,2) not null default 0,
  status text not null default 'open' check (status in ('open','reconciled','locked')),
  closed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table reconciliation_runs enable row level security;
drop policy if exists "reconciliation_runs_v1_read" on reconciliation_runs;
create policy "reconciliation_runs_v1_read" on reconciliation_runs for select using (true);
drop policy if exists "reconciliation_runs_v1_write" on reconciliation_runs;
create policy "reconciliation_runs_v1_write" on reconciliation_runs for all using (true) with check (true);

-- SEED DEMO DATA
insert into vendors (name, account_no) values ('ABC Suppliers','100200300'), ('City Power Co','100200301'), ('WaterWorks Ltd','100200302') on conflict do nothing;
insert into tenants (name, expected_monthly) values ('Greenfield Retail','5000.00'), ('Sunrise Cafe','3200.00'), ('TechHub Office','8000.00') on conflict do nothing;
insert into reconciliation_runs (period_month, total_credit, total_debit, variance, status) values ('2024-05-01','16200.00','12500.00','0.00','open') on conflict do nothing;
insert into bank_transactions (txn_date, amount, direction, description, status) values ('2024-05-03','5000.00','credit','Greenfield Retail rent','matched'),('2024-05-05','3200.00','credit','Sunrise Cafe rent','matched'),('2024-05-07','8000.00','credit','TechHub Office rent','matched'),('2024-05-10','4500.00','debit','ABC Suppliers INV-223','cleared'),('2024-05-12','3000.00','debit','City Power Co','cleared'),('2024-05-15','5000.00','debit','WaterWorks Ltd','unmatched') on conflict do nothing;
insert into vendor_payments (vendor_id, amount, payment_date, reference, status) values ((select id from vendors where name='ABC Suppliers'),'4500.00','2024-05-10','INV-223','cleared'),((select id from vendors where name='City Power Co'),'3000.00','2024-05-12','MAY-POW','cleared'),((select id from vendors where name='WaterWorks Ltd'),'5000.00','2024-05-15','INV-118','outstanding') on conflict do nothing;
insert into tenant_collections (tenant_id, amount, collection_date, source, matched, status) values ((select id from tenants where name='Greenfield Retail'),'5000.00','2024-05-03','Bank transfer','5000.00','matched'),((select id from tenants where name='Sunrise Cafe'),'3200.00','2024-05-05','Cash','3200.00','matched'),((select id from tenants where name='TechHub Office'),'8000.00','2024-05-07','Cheque','8000.00','matched') on conflict do nothing;