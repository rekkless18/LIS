create extension if not exists pgcrypto;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  product_code text not null,
  product_name text not null,
  product_type text not null check (product_type in ('普检产品','特检产品','质谱产品','研发产品','其他产品')),
  status text not null check (status in ('enabled','disabled')) default 'enabled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uniq_products_code unique (product_code)
);
create index if not exists idx_products_name on products(product_name);

create table if not exists test_items (
  id uuid primary key default gen_random_uuid(),
  item_code text not null,
  item_name text not null,
  item_type text not null check (item_type in ('普检检测项','特检检测项','质谱检测项','研发检测项','其他检测项')),
  judgement_type text not null check (judgement_type in ('上限','下限','上下限','定性','阴阳性','聚合')),
  limit_upper numeric,
  limit_lower numeric,
  unit text,
  qualitative_value text,
  status text not null check (status in ('enabled','disabled')) default 'enabled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uniq_test_items_code unique (item_code)
);
create index if not exists idx_test_items_name on test_items(item_name);
create index if not exists idx_test_items_type on test_items(item_type);

create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  package_code text not null,
  package_name text not null,
  package_type text not null check (package_type in ('常规套餐','科研套餐','VIP套餐')),
  status text not null check (status in ('enabled','disabled')) default 'enabled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uniq_packages_code unique (package_code)
);
create index if not exists idx_packages_name on packages(package_name);

create table if not exists package_products (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references packages(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  sample_type text not null check (sample_type in ('全血','血浆','组织液','尿液','切片')),
  created_at timestamptz not null default now(),
  constraint uniq_package_product_sample unique (package_id, product_id, sample_type)
);
create index if not exists idx_package_products_package on package_products(package_id);
create index if not exists idx_package_products_product on package_products(product_id);

create table if not exists test_item_aggregate_rules (
  id uuid primary key default gen_random_uuid(),
  parent_item_id uuid not null references test_items(id) on delete cascade,
  child_item_id uuid not null references test_items(id) on delete cascade,
  condition text not null check (condition in ('任意满足','所有满足','任意不满足','所有不满足')),
  result text not null check (result in ('偏高','偏低','正常','异常')),
  created_at timestamptz not null default now(),
  constraint uniq_agg_rule unique (parent_item_id, child_item_id, condition, result)
);
create index if not exists idx_agg_parent on test_item_aggregate_rules(parent_item_id);
create index if not exists idx_agg_child on test_item_aggregate_rules(child_item_id);

alter table products enable row level security;
drop policy if exists p_products_select_auth on products;
drop policy if exists p_products_insert_service on products;
drop policy if exists p_products_update_service on products;
drop policy if exists p_products_delete_service on products;
create policy p_products_select_auth on products for select to authenticated using (true);
create policy p_products_insert_service on products for insert to service_role with check (true);
create policy p_products_update_service on products for update to service_role using (true) with check (true);
create policy p_products_delete_service on products for delete to service_role using (true);

alter table test_items enable row level security;
drop policy if exists p_test_items_select_auth on test_items;
drop policy if exists p_test_items_insert_service on test_items;
drop policy if exists p_test_items_update_service on test_items;
drop policy if exists p_test_items_delete_service on test_items;
create policy p_test_items_select_auth on test_items for select to authenticated using (true);
create policy p_test_items_insert_service on test_items for insert to service_role with check (true);
create policy p_test_items_update_service on test_items for update to service_role using (true) with check (true);
create policy p_test_items_delete_service on test_items for delete to service_role using (true);

alter table packages enable row level security;
drop policy if exists p_packages_select_auth on packages;
drop policy if exists p_packages_insert_service on packages;
drop policy if exists p_packages_update_service on packages;
drop policy if exists p_packages_delete_service on packages;
create policy p_packages_select_auth on packages for select to authenticated using (true);
create policy p_packages_insert_service on packages for insert to service_role with check (true);
create policy p_packages_update_service on packages for update to service_role using (true) with check (true);
create policy p_packages_delete_service on packages for delete to service_role using (true);

alter table package_products enable row level security;
drop policy if exists p_package_products_select_auth on package_products;
drop policy if exists p_package_products_insert_service on package_products;
drop policy if exists p_package_products_update_service on package_products;
drop policy if exists p_package_products_delete_service on package_products;
create policy p_package_products_select_auth on package_products for select to authenticated using (true);
create policy p_package_products_insert_service on package_products for insert to service_role with check (true);
create policy p_package_products_update_service on package_products for update to service_role using (true) with check (true);
create policy p_package_products_delete_service on package_products for delete to service_role using (true);

alter table test_item_aggregate_rules enable row level security;
drop policy if exists p_test_item_aggregate_rules_select_auth on test_item_aggregate_rules;
drop policy if exists p_test_item_aggregate_rules_insert_service on test_item_aggregate_rules;
drop policy if exists p_test_item_aggregate_rules_update_service on test_item_aggregate_rules;
drop policy if exists p_test_item_aggregate_rules_delete_service on test_item_aggregate_rules;
create policy p_test_item_aggregate_rules_select_auth on test_item_aggregate_rules for select to authenticated using (true);
create policy p_test_item_aggregate_rules_insert_service on test_item_aggregate_rules for insert to service_role with check (true);
create policy p_test_item_aggregate_rules_update_service on test_item_aggregate_rules for update to service_role using (true) with check (true);
create policy p_test_item_aggregate_rules_delete_service on test_item_aggregate_rules for delete to service_role using (true);