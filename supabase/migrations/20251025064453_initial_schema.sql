-- Enable required extensions
create extension if not exists "pgcrypto";
create extension if not exists "citext";
-- Note: pgvector must be enabled via Supabase Dashboard first
-- create extension if not exists "pgvector";

-- Singleton restaurant profile configuration
create table if not exists public.restaurant_profile (
    profile_key text primary key default 'clay_pit',
    display_name text not null,
    timezone text not null,
    opens_at time,
    closes_at time,
    service_notes text,
    updated_at timestamptz not null default now()
);

-- Customers master table
create table if not exists public.customers (
    customer_id uuid primary key default gen_random_uuid(),
    full_name text not null,
    email citext unique,
    phone text unique,
    gender text check (gender in ('female','male','non_binary','prefer_not_to_say')),
    date_of_birth date,
    primary_address_id uuid,
    preferred_contact_channel text check (preferred_contact_channel in ('phone','sms','email','whatsapp','none')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Customer addresses with geo metadata
create table if not exists public.customer_addresses (
    address_id uuid primary key default gen_random_uuid(),
    customer_id uuid not null references public.customers(customer_id) on delete cascade,
    label text not null,
    street text not null,
    city text not null,
    state text,
    postal_code text not null,
    country text not null default 'US',
    latitude numeric(9,6),
    longitude numeric(9,6),
    is_default boolean not null default false,
    created_at timestamptz not null default now()
);

-- Add deferred foreign key for primary address
alter table public.customers
    add constraint customers_primary_address_fk
    foreign key (primary_address_id) references public.customer_addresses(address_id);

-- Preference profiles (1:1)
create table if not exists public.customer_profiles (
    customer_id uuid primary key references public.customers(customer_id) on delete cascade,
    dietary_restriction text,
    spice_tolerance text check (spice_tolerance in ('none','mild','medium','hot','chef_special')),
    allergies text[],
    favorite_cuisine_notes text,
    language_preference text,
    crm_tags text[],
    last_updated_by text,
    updated_at timestamptz not null default now()
);

-- Premium/VIP customers
create table if not exists public.premium_customers (
    customer_id uuid primary key references public.customers(customer_id) on delete cascade,
    qualifying_date date not null,
    qualification_reason text not null,
    ltv_percentile numeric(5,2),
    sentiment_avg numeric(4,2),
    concierge_notes text
);

-- Agent personas
create table if not exists public.agent_personas (
    agent_persona_id uuid primary key default gen_random_uuid(),
    name text not null unique,
    description text,
    tone_guidelines jsonb not null,
    suggestion_rules jsonb,
    default_channel text check (default_channel in ('voice','sms','email')),
    created_at timestamptz not null default now()
);

-- Customer-level persona overrides (1:1)
create table if not exists public.customer_persona_overrides (
    customer_id uuid primary key references public.customers(customer_id) on delete cascade,
    agent_persona_id uuid references public.agent_personas(agent_persona_id),
    tone_overrides jsonb,
    playbook_overrides jsonb,
    valid_from timestamptz not null default now(),
    valid_to timestamptz,
    last_reviewed_at timestamptz
);

-- Menu categories
create table if not exists public.menu_categories (
    category_id uuid primary key default gen_random_uuid(),
    name text not null unique,
    description text,
    display_order integer not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- Menu items
create table if not exists public.menu_items (
    menu_item_id uuid primary key default gen_random_uuid(),
    category_id uuid not null references public.menu_categories(category_id),
    name text not null,
    description text,
    is_vegetarian boolean not null default false,
    is_vegan boolean not null default false,
    is_gluten_free boolean not null default false,
    spice_level text check (spice_level in ('none','mild','medium','hot','chef_special')),
    base_price numeric(8,2) not null,
    is_active boolean not null default true,
    image_url text,
    prep_time_minutes integer,
    created_at timestamptz not null default now()
);

-- Customer segments
create table if not exists public.customer_segments (
    segment_id uuid primary key default gen_random_uuid(),
    name text not null unique,
    definition jsonb not null,
    is_dynamic boolean not null default true,
    created_at timestamptz not null default now(),
    refreshed_at timestamptz
);

-- Discounts / offers
create table if not exists public.discounts (
    discount_id uuid primary key default gen_random_uuid(),
    name text not null,
    discount_type text not null check (discount_type in ('percent','fixed','bogo')),
    value numeric(6,2) not null,
    starts_at timestamptz not null,
    ends_at timestamptz,
    min_order_total numeric(8,2) not null default 0,
    segment_id uuid references public.customer_segments(segment_id),
    is_stackable boolean not null default false,
    notes text,
    created_at timestamptz not null default now()
);

-- Menu item ↔ discount join table
create table if not exists public.menu_item_discounts (
    menu_item_id uuid not null references public.menu_items(menu_item_id) on delete cascade,
    discount_id uuid not null references public.discounts(discount_id) on delete cascade,
    channel_scope text check (channel_scope in ('voice','in_store','delivery_app','all')),
    created_at timestamptz not null default now(),
    primary key (menu_item_id, discount_id)
);

-- Segment membership
create table if not exists public.customer_segment_members (
    segment_id uuid not null references public.customer_segments(segment_id) on delete cascade,
    customer_id uuid not null references public.customers(customer_id) on delete cascade,
    joined_at timestamptz not null default now(),
    exit_at timestamptz,
    primary key (segment_id, customer_id)
);

-- Orders fact table
create table if not exists public.orders (
    order_id uuid primary key default gen_random_uuid(),
    customer_id uuid not null references public.customers(customer_id),
    placed_at timestamptz not null default now(),
    status text not null check (status in ('draft','confirmed','in_kitchen','out_for_delivery','completed','cancelled')),
    subtotal numeric(10,2) not null,
    tax numeric(10,2) not null default 0,
    discount_total numeric(10,2) not null default 0,
    tip numeric(10,2) not null default 0,
    total numeric(10,2) not null,
    average_order_value_snapshot numeric(10,2) not null,
    fulfillment_type text not null check (fulfillment_type in ('dine_in','takeout','delivery','catering','marketplace')),
    delivery_address_id uuid references public.customer_addresses(address_id),
    delivery_instructions text,
    origin_channel text not null check (origin_channel in ('voice_agent','web','mobile','marketplace','walk_in')),
    agent_persona_id uuid references public.agent_personas(agent_persona_id),
    created_at timestamptz not null default now()
);

-- Order line items
create table if not exists public.order_items (
    order_item_id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(order_id) on delete cascade,
    menu_item_id uuid not null references public.menu_items(menu_item_id),
    quantity integer not null default 1,
    unit_price numeric(8,2) not null,
    discount_applied numeric(8,2) not null default 0,
    special_requests text
);

-- Interaction sessions
create table if not exists public.agent_interactions (
    interaction_id uuid primary key default gen_random_uuid(),
    customer_id uuid not null references public.customers(customer_id),
    order_id uuid references public.orders(order_id),
    agent_persona_id uuid references public.agent_personas(agent_persona_id),
    channel text not null check (channel in ('voice','chat','sms','in_app')),
    started_at timestamptz not null default now(),
    ended_at timestamptz,
    intent text,
    sentiment_score numeric(4,2),
    resolution_status text check (resolution_status in ('resolved','pending_followup','escalated')),
    summary text,
    audio_reference text
);

-- Turn-level transcripts
create table if not exists public.interaction_transcripts (
    transcript_id uuid primary key default gen_random_uuid(),
    interaction_id uuid not null references public.agent_interactions(interaction_id) on delete cascade,
    turn_index integer not null,
    speaker text not null check (speaker in ('customer','agent','system')),
    content text not null,
    -- embedding_vector vector(1536),  -- Requires pgvector extension
    confidence numeric(4,2),
    created_at timestamptz not null default now(),
    unique (interaction_id, turn_index)
);

-- Optional media metadata
create table if not exists public.transcript_media (
    media_id uuid primary key default gen_random_uuid(),
    interaction_id uuid not null references public.agent_interactions(interaction_id) on delete cascade,
    storage_path text not null,
    media_type text not null check (media_type in ('audio/mp3','audio/wav','video/mp4')),
    duration_seconds integer,
    is_transcoded boolean not null default false,
    created_at timestamptz not null default now()
);

-- Indexes to support common access patterns
create index if not exists customers_phone_idx on public.customers using btree(phone);
create index if not exists customers_email_idx on public.customers using btree(email);
create index if not exists customer_addresses_customer_idx on public.customer_addresses(customer_id);
create index if not exists orders_customer_idx on public.orders(customer_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists menu_items_category_idx on public.menu_items(category_id);
create index if not exists agent_interactions_customer_idx on public.agent_interactions(customer_id);
-- Vector index requires pgvector extension
-- create index if not exists interaction_transcripts_vector_idx on public.interaction_transcripts using ivfflat (embedding_vector vector_cosine) with (lists = 100);

-- Materialized view aggregating customer metrics
create materialized view if not exists public.customer_order_metrics as
with base_orders as (
    select
        o.customer_id,
        o.total,
        o.status,
        o.placed_at
    from public.orders o
),
favorite_items as (
    select
        c.customer_id,
        array_agg(f.menu_item_id order by f.frequency desc) as favorite_items
    from public.customers c
    left join lateral (
        select oi.menu_item_id, count(*) as frequency
        from public.order_items oi
        join public.orders o on o.order_id = oi.order_id
        where o.customer_id = c.customer_id
          and o.status = 'completed'
        group by oi.menu_item_id
        order by frequency desc
        limit 5
    ) as f on true
    group by c.customer_id
)
select
    c.customer_id,
    coalesce(sum(case when o.status = 'completed' then o.total end), 0)::numeric(12,2) as lifetime_value,
    count(*) filter (where o.status = 'completed') as order_count,
    coalesce(avg(o.total) filter (where o.status = 'completed'), 0)::numeric(10,2) as avg_order_value,
    max(o.placed_at) filter (where o.status = 'completed') as last_order_at,
    fi.favorite_items,
    (
        select ai2.sentiment_score
        from public.agent_interactions ai2
        where ai2.customer_id = c.customer_id
          and ai2.sentiment_score is not null
        order by ai2.started_at desc
        limit 1
    )::numeric(4,2) as last_sentiment,
    null::numeric(4,2) as churn_risk_score
from public.customers c
left join base_orders o on o.customer_id = c.customer_id
left join favorite_items fi on fi.customer_id = c.customer_id
group by c.customer_id, fi.favorite_items;

create unique index if not exists customer_order_metrics_customer_idx
    on public.customer_order_metrics(customer_id);

-- Initial singleton row for restaurant profile (idempotent)
insert into public.restaurant_profile (profile_key, display_name, timezone, opens_at, closes_at, service_notes)
values ('clay_pit', 'Clay Pit', 'America/Chicago', '10:30', '22:00', 'Prep focus on spice calibration and premium catering.')
on conflict (profile_key) do update
set display_name = excluded.display_name,
    timezone = excluded.timezone,
    opens_at = excluded.opens_at,
    closes_at = excluded.closes_at,
    service_notes = excluded.service_notes,
    updated_at = now();

