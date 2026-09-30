begin;
-- CORE TABLES ONLY (vendors, tenants, bank_transactions, vendor_payments, tenant_collections, reconciliation_runs)
-- Note: users/teams/memberships/activity_logs/audit_logs use platform tables (later sprint).

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

-- Stable IDs make this seed safe to apply again without duplicating demo rows.
insert into vendors (id, name, account_no) values
('10000000-0000-4000-8000-000000000001','ABC Suppliers','100200300'),
('10000000-0000-4000-8000-000000000002','City Power Co','100200301'),
('10000000-0000-4000-8000-000000000003','WaterWorks Ltd','100200302') on conflict (id) do nothing;
insert into tenants (id, name, expected_monthly) values
('20000000-0000-4000-8000-000000000001','Greenfield Retail',5000),
('20000000-0000-4000-8000-000000000002','Sunrise Cafe',3200),
('20000000-0000-4000-8000-000000000003','TechHub Office',8000) on conflict (id) do nothing;
insert into reconciliation_runs (id, period_month, total_credit, total_debit, variance) values
('30000000-0000-4000-8000-000000000001','2024-05-01',16200,12500,0) on conflict (id) do nothing;
insert into bank_transactions (id, run_id, txn_date, amount, direction, description) values
('40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','2024-05-03',5000,'credit','Greenfield Retail rent'),
('40000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001','2024-05-05',3200,'credit','Sunrise Cafe rent'),
('40000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000001','2024-05-07',8000,'credit','TechHub Office rent'),
('40000000-0000-4000-8000-000000000004','30000000-0000-4000-8000-000000000001','2024-05-10',4500,'debit','ABC Suppliers INV-223'),
('40000000-0000-4000-8000-000000000005','30000000-0000-4000-8000-000000000001','2024-05-12',3000,'debit','City Power Co'),
('40000000-0000-4000-8000-000000000006','30000000-0000-4000-8000-000000000001','2024-05-15',5000,'debit','WaterWorks Ltd') on conflict (id) do nothing;
insert into vendor_payments (id, vendor_id, run_id, amount, payment_date, reference) values
('50000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001',4500,'2024-05-10','INV-223'),
('50000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001',3000,'2024-05-12','MAY-POW'),
('50000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000001',5000,'2024-05-15','INV-118') on conflict (id) do nothing;
insert into tenant_collections (id, tenant_id, run_id, amount, collection_date, source) values
('60000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001',5000,'2024-05-03','Bank transfer'),
('60000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001',3200,'2024-05-05','Cash'),
('60000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000001',8000,'2024-05-07','Cheque') on conflict (id) do nothing;
commit;
