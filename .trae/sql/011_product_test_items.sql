create table if not exists product_test_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  test_item_id uuid not null references test_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint uniq_product_test_item unique (product_id, test_item_id)
);

create index if not exists idx_product_test_items_product on product_test_items(product_id);
create index if not exists idx_product_test_items_test_item on product_test_items(test_item_id);

alter table product_test_items enable row level security;
create policy p_pti_select_auth on product_test_items for select to authenticated using (true);
create policy p_pti_insert_service on product_test_items for insert to service_role with check (true);
create policy p_pti_update_service on product_test_items for update to service_role using (true) with check (true);
create policy p_pti_delete_service on product_test_items for delete to service_role using (true);