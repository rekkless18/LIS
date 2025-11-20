create extension if not exists pgcrypto;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  customer_code text not null,
  customer_name text not null,
  customer_type text not null check (customer_type in ('enterprise','university','research')),
  region text not null check (region in ('mainland','hkmotw','western_europe','southeast_asia','middle_east','north_america','other')),
  status text not null check (status in ('enabled','disabled')) default 'enabled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uniq_customers_code unique (customer_code)
);
create index if not exists idx_customers_name on customers(customer_name);
create index if not exists idx_customers_status on customers(status);
create index if not exists idx_customers_created on customers(created_at);
create index if not exists idx_customers_type_region on customers(customer_type, region);

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null,
  room_location text not null,
  protection_level text not null check (protection_level in ('level1','level2','level3')),
  status text not null check (status in ('normal','abnormal')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uniq_rooms_code unique (room_code)
);
create index if not exists idx_rooms_location on rooms(room_location);
create index if not exists idx_rooms_status on rooms(status);
create index if not exists idx_rooms_level on rooms(protection_level);
create index if not exists idx_rooms_created on rooms(created_at);

create table if not exists environment_readings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  temperature numeric(6,2),
  humidity numeric(5,2),
  pressure numeric(8,3),
  reading_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_env_readings_room_time on environment_readings(room_id, reading_at desc);
create index if not exists idx_env_readings_room on environment_readings(room_id);

create table if not exists equipment (
  id uuid primary key default gen_random_uuid(),
  device_code text not null,
  device_name text not null,
  device_type text not null check (device_type in ('sequencer','qpcr','centrifuge','incubator','biochemical','mass_spectrometer','hematology','refrigerator','other')),
  device_status text not null check (device_status in ('running','shutdown','maintenance','fault','scrapped')),
  device_location text not null,
  manufacturer text,
  purchase_date date,
  last_maintenance_date date,
  scrap_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uniq_equipment_code unique (device_code)
);
create index if not exists idx_equipment_name on equipment(device_name);
create index if not exists idx_equipment_type on equipment(device_type);
create index if not exists idx_equipment_status on equipment(device_status);
create index if not exists idx_equipment_location on equipment(device_location);
create index if not exists idx_equipment_purchase on equipment(purchase_date);
create index if not exists idx_equipment_maint on equipment(last_maintenance_date);
create index if not exists idx_equipment_scrap on equipment(scrap_date);

create table if not exists equipment_responsibles (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references equipment(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint uniq_equipment_responsible unique (equipment_id, user_id)
);
create index if not exists idx_equipment_responsibles_equipment on equipment_responsibles(equipment_id);
create index if not exists idx_equipment_responsibles_user on equipment_responsibles(user_id);

create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  material_code text not null,
  material_name text not null,
  manufacturer text,
  batch_no text,
  expiry_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  quantity integer not null,
  threshold_level text not null check (threshold_level in ('out','low','medium','high')),
  constraint uniq_inventory_code unique (material_code)
);
create index if not exists idx_inventory_name on inventory_items(material_name);
create index if not exists idx_inventory_manu on inventory_items(manufacturer);
create index if not exists idx_inventory_batch on inventory_items(batch_no);
create index if not exists idx_inventory_expiry on inventory_items(expiry_date);
create index if not exists idx_inventory_threshold on inventory_items(threshold_level);
create index if not exists idx_inventory_created on inventory_items(created_at);

alter table customers enable row level security;
drop policy if exists p_customers_select_auth on customers;
drop policy if exists p_customers_insert_service on customers;
drop policy if exists p_customers_update_service on customers;
drop policy if exists p_customers_delete_service on customers;
create policy p_customers_select_auth on customers for select to authenticated using (true);
create policy p_customers_insert_service on customers for insert to service_role with check (true);
create policy p_customers_update_service on customers for update to service_role using (true) with check (true);
create policy p_customers_delete_service on customers for delete to service_role using (true);

alter table rooms enable row level security;
drop policy if exists p_rooms_select_auth on rooms;
drop policy if exists p_rooms_insert_service on rooms;
drop policy if exists p_rooms_update_service on rooms;
drop policy if exists p_rooms_delete_service on rooms;
create policy p_rooms_select_auth on rooms for select to authenticated using (true);
create policy p_rooms_insert_service on rooms for insert to service_role with check (true);
create policy p_rooms_update_service on rooms for update to service_role using (true) with check (true);
create policy p_rooms_delete_service on rooms for delete to service_role using (true);

alter table environment_readings enable row level security;
drop policy if exists p_env_select_auth on environment_readings;
drop policy if exists p_env_insert_service on environment_readings;
drop policy if exists p_env_update_service on environment_readings;
drop policy if exists p_env_delete_service on environment_readings;
create policy p_env_select_auth on environment_readings for select to authenticated using (true);
create policy p_env_insert_service on environment_readings for insert to service_role with check (true);
create policy p_env_update_service on environment_readings for update to service_role using (true) with check (true);
create policy p_env_delete_service on environment_readings for delete to service_role using (true);

alter table equipment enable row level security;
drop policy if exists p_equipment_select_auth on equipment;
drop policy if exists p_equipment_insert_service on equipment;
drop policy if exists p_equipment_update_service on equipment;
drop policy if exists p_equipment_delete_service on equipment;
create policy p_equipment_select_auth on equipment for select to authenticated using (true);
create policy p_equipment_insert_service on equipment for insert to service_role with check (true);
create policy p_equipment_update_service on equipment for update to service_role using (true) with check (true);
create policy p_equipment_delete_service on equipment for delete to service_role using (true);

alter table equipment_responsibles enable row level security;
drop policy if exists p_eqresp_select_auth on equipment_responsibles;
drop policy if exists p_eqresp_insert_service on equipment_responsibles;
drop policy if exists p_eqresp_update_service on equipment_responsibles;
drop policy if exists p_eqresp_delete_service on equipment_responsibles;
create policy p_eqresp_select_auth on equipment_responsibles for select to authenticated using (true);
create policy p_eqresp_insert_service on equipment_responsibles for insert to service_role with check (true);
create policy p_eqresp_update_service on equipment_responsibles for update to service_role using (true) with check (true);
create policy p_eqresp_delete_service on equipment_responsibles for delete to service_role using (true);

alter table inventory_items enable row level security;
drop policy if exists p_inventory_select_auth on inventory_items;
drop policy if exists p_inventory_insert_service on inventory_items;
drop policy if exists p_inventory_update_service on inventory_items;
drop policy if exists p_inventory_delete_service on inventory_items;
create policy p_inventory_select_auth on inventory_items for select to authenticated using (true);
create policy p_inventory_insert_service on inventory_items for insert to service_role with check (true);
create policy p_inventory_update_service on inventory_items for update to service_role using (true) with check (true);
create policy p_inventory_delete_service on inventory_items for delete to service_role using (true);