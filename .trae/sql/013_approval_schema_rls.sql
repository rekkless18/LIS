create extension if not exists pgcrypto;

create table if not exists approval_flows (
  id uuid primary key default gen_random_uuid(),
  flow_code text not null,
  flow_name text not null,
  flow_type text not null check (flow_type in ('urgent','inventory_purchase','leave')),
  level integer not null check (level in (1,2,3)),
  description text,
  status text not null check (status in ('enabled','disabled')) default 'enabled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uniq_approval_flows_code unique (flow_code)
);
create index if not exists idx_approval_flows_type on approval_flows(flow_type);

create table if not exists approval_flow_nodes (
  id uuid primary key default gen_random_uuid(),
  flow_id uuid not null references approval_flows(id) on delete cascade,
  node_order integer not null,
  approver_type text not null check (approver_type in ('role','department_head','users','direct_leader','indirect_leader')),
  role_id uuid references roles(id) on delete set null,
  department text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uniq_flow_nodes_order unique (flow_id, node_order)
);
create index if not exists idx_flow_nodes_flow on approval_flow_nodes(flow_id);
create index if not exists idx_flow_nodes_role on approval_flow_nodes(role_id);

create table if not exists approval_flow_node_users (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references approval_flow_nodes(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  constraint uniq_flow_node_user unique (node_id, user_id)
);
create index if not exists idx_flow_node_users_node on approval_flow_node_users(node_id);
create index if not exists idx_flow_node_users_user on approval_flow_node_users(user_id);

create table if not exists approval_requests (
  id uuid primary key default gen_random_uuid(),
  request_code text not null,
  flow_id uuid not null references approval_flows(id) on delete restrict,
  flow_type text not null check (flow_type in ('urgent','inventory_purchase','leave')),
  level integer not null check (level in (1,2,3)),
  applicant_id uuid not null references users(id) on delete restrict,
  request_content text,
  status text not null check (status in ('submitted','in_progress','approved','rejected','withdrawn')) default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uniq_approval_requests_code unique (request_code)
);
create index if not exists idx_approval_requests_flow on approval_requests(flow_id);
create index if not exists idx_approval_requests_applicant on approval_requests(applicant_id);
create index if not exists idx_approval_requests_status on approval_requests(status);

create table if not exists approval_request_nodes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references approval_requests(id) on delete cascade,
  node_order integer not null,
  approver_type text not null check (approver_type in ('role','department_head','users','direct_leader','indirect_leader')),
  role_id uuid references roles(id) on delete set null,
  department text,
  status text not null check (status in ('pending','approved','rejected')) default 'pending',
  acted_at timestamptz,
  comment text,
  constraint uniq_request_nodes_order unique (request_id, node_order)
);
create index if not exists idx_request_nodes_request on approval_request_nodes(request_id);
create index if not exists idx_request_nodes_status on approval_request_nodes(status);

create table if not exists approval_request_node_assignees (
  id uuid primary key default gen_random_uuid(),
  request_node_id uuid not null references approval_request_nodes(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  status text not null check (status in ('pending','approved','rejected')) default 'pending',
  acted_at timestamptz,
  constraint uniq_request_node_assignee unique (request_node_id, user_id)
);
create index if not exists idx_request_node_assignees_node on approval_request_node_assignees(request_node_id);
create index if not exists idx_request_node_assignees_user on approval_request_node_assignees(user_id);

create table if not exists approval_actions (
  id uuid primary key default gen_random_uuid(),
  request_node_id uuid not null references approval_request_nodes(id) on delete cascade,
  operator_id uuid not null references users(id) on delete restrict,
  action text not null check (action in ('submit','approve','reject','withdraw')),
  reason text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_approval_actions_node on approval_actions(request_node_id);
create index if not exists idx_approval_actions_operator on approval_actions(operator_id);

alter table approval_flows enable row level security;
drop policy if exists p_approval_flows_select_auth on approval_flows;
drop policy if exists p_approval_flows_insert_service on approval_flows;
drop policy if exists p_approval_flows_update_service on approval_flows;
drop policy if exists p_approval_flows_delete_service on approval_flows;
create policy p_approval_flows_select_auth on approval_flows for select to authenticated using (true);
create policy p_approval_flows_insert_service on approval_flows for insert to service_role with check (true);
create policy p_approval_flows_update_service on approval_flows for update to service_role using (true) with check (true);
create policy p_approval_flows_delete_service on approval_flows for delete to service_role using (true);

alter table approval_flow_nodes enable row level security;
drop policy if exists p_approval_flow_nodes_select_auth on approval_flow_nodes;
drop policy if exists p_approval_flow_nodes_insert_service on approval_flow_nodes;
drop policy if exists p_approval_flow_nodes_update_service on approval_flow_nodes;
drop policy if exists p_approval_flow_nodes_delete_service on approval_flow_nodes;
create policy p_approval_flow_nodes_select_auth on approval_flow_nodes for select to authenticated using (true);
create policy p_approval_flow_nodes_insert_service on approval_flow_nodes for insert to service_role with check (true);
create policy p_approval_flow_nodes_update_service on approval_flow_nodes for update to service_role using (true) with check (true);
create policy p_approval_flow_nodes_delete_service on approval_flow_nodes for delete to service_role using (true);

alter table approval_flow_node_users enable row level security;
drop policy if exists p_approval_flow_node_users_select_auth on approval_flow_node_users;
drop policy if exists p_approval_flow_node_users_insert_service on approval_flow_node_users;
drop policy if exists p_approval_flow_node_users_update_service on approval_flow_node_users;
drop policy if exists p_approval_flow_node_users_delete_service on approval_flow_node_users;
create policy p_approval_flow_node_users_select_auth on approval_flow_node_users for select to authenticated using (true);
create policy p_approval_flow_node_users_insert_service on approval_flow_node_users for insert to service_role with check (true);
create policy p_approval_flow_node_users_update_service on approval_flow_node_users for update to service_role using (true) with check (true);
create policy p_approval_flow_node_users_delete_service on approval_flow_node_users for delete to service_role using (true);

alter table approval_requests enable row level security;
drop policy if exists p_approval_requests_select_auth on approval_requests;
drop policy if exists p_approval_requests_insert_service on approval_requests;
drop policy if exists p_approval_requests_update_service on approval_requests;
drop policy if exists p_approval_requests_delete_service on approval_requests;
create policy p_approval_requests_select_auth on approval_requests for select to authenticated using (true);
create policy p_approval_requests_insert_service on approval_requests for insert to service_role with check (true);
create policy p_approval_requests_update_service on approval_requests for update to service_role using (true) with check (true);
create policy p_approval_requests_delete_service on approval_requests for delete to service_role using (true);

alter table approval_request_nodes enable row level security;
drop policy if exists p_approval_request_nodes_select_auth on approval_request_nodes;
drop policy if exists p_approval_request_nodes_insert_service on approval_request_nodes;
drop policy if exists p_approval_request_nodes_update_service on approval_request_nodes;
drop policy if exists p_approval_request_nodes_delete_service on approval_request_nodes;
create policy p_approval_request_nodes_select_auth on approval_request_nodes for select to authenticated using (true);
create policy p_approval_request_nodes_insert_service on approval_request_nodes for insert to service_role with check (true);
create policy p_approval_request_nodes_update_service on approval_request_nodes for update to service_role using (true) with check (true);
create policy p_approval_request_nodes_delete_service on approval_request_nodes for delete to service_role using (true);

alter table approval_request_node_assignees enable row level security;
drop policy if exists p_approval_request_node_assignees_select_auth on approval_request_node_assignees;
drop policy if exists p_approval_request_node_assignees_insert_service on approval_request_node_assignees;
drop policy if exists p_approval_request_node_assignees_update_service on approval_request_node_assignees;
drop policy if exists p_approval_request_node_assignees_delete_service on approval_request_node_assignees;
create policy p_approval_request_node_assignees_select_auth on approval_request_node_assignees for select to authenticated using (true);
create policy p_approval_request_node_assignees_insert_service on approval_request_node_assignees for insert to service_role with check (true);
create policy p_approval_request_node_assignees_update_service on approval_request_node_assignees for update to service_role using (true) with check (true);
create policy p_approval_request_node_assignees_delete_service on approval_request_node_assignees for delete to service_role using (true);

alter table approval_actions enable row level security;
drop policy if exists p_approval_actions_select_auth on approval_actions;
drop policy if exists p_approval_actions_insert_service on approval_actions;
drop policy if exists p_approval_actions_update_service on approval_actions;
drop policy if exists p_approval_actions_delete_service on approval_actions;
create policy p_approval_actions_select_auth on approval_actions for select to authenticated using (true);
create policy p_approval_actions_insert_service on approval_actions for insert to service_role with check (true);
create policy p_approval_actions_update_service on approval_actions for update to service_role using (true) with check (true);
create policy p_approval_actions_delete_service on approval_actions for delete to service_role using (true);