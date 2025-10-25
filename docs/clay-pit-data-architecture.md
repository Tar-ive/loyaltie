# Clay Pit Data Architecture Overview

## Operational Context
- **Restaurant**: Clay Pit, modern Indian restaurant delivering elevated dine-in, take-out, and virtual cloud-kitchen experiences
- **Operating Model**: Single-brand deployment, avoiding synthetic restaurant IDs; global configuration captured in `restaurant_profile`
- **Agentic Goal**: Hyper-personalized voice agent drives higher lifetime value through contextual offers, sentiment-aware service, and VIP journeys

## Core Tables
### restaurant_profile (singleton row)
| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| profile_key | text | primary key, default `'clay_pit'` | Canonical identifier used by configuration services |
| display_name | text | not null | Public-facing restaurant name |
| timezone | text | not null | Olson timezone identifier |
| opens_at | time | nullable | Scheduled open time (local) |
| closes_at | time | nullable | Scheduled close time (local) |
| service_notes | text | nullable | Operational notes surfaced to agents |
| updated_at | timestamptz | default now() | Audit trail for orchestration layer |

### customers
| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| customer_id | uuid | primary key | Core customer identifier |
| full_name | text | not null | Preferred salutation or full name |
| email | citext | unique | Optional email for digital outreach |
| phone | text | unique | SMS/voice contact; normalize to E.164 |
| gender | text | check (in `('female','male','non_binary','prefer_not_to_say')`) | Self-reported |
| date_of_birth | date | nullable | Enables birthday offers |
| primary_address_id | uuid | fk → `customer_addresses.address_id` | Default delivery/billing location |
| preferred_contact_channel | text | check (in `('phone','sms','email','whatsapp','none')`) | Agent routing preference |
| created_at | timestamptz | default now() | Record creation |
| updated_at | timestamptz | default now() | Update timestamp |

### customer_addresses
| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| address_id | uuid | primary key | Address identifier |
| customer_id | uuid | fk → `customers.customer_id` on delete cascade | Owner of the address |
| label | text | not null | e.g. "Home", "Office", "Cloud Kitchen Pickup" |
| street | text | not null | Street line |
| city | text | not null | |
| state | text | nullable | |
| postal_code | text | not null | |
| country | text | default 'US' | ISO country code |
| latitude | numeric(9,6) | nullable | Geo for delivery range |
| longitude | numeric(9,6) | nullable | |
| is_default | boolean | default false | Marks primary delivery point |
| created_at | timestamptz | default now() | |

### customer_profiles (1:1 with customers)
| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| customer_id | uuid | primary key, fk → `customers.customer_id` on delete cascade | Mirrors base customer |
| dietary_restriction | text | nullable | Vegan, vegetarian, halal, etc. |
| spice_tolerance | text | check (in `('none','mild','medium','hot','chef_special')`) | Preferred spice intensity |
| allergies | text[] | nullable | Standardized allergen list |
| favorite_cuisine_notes | text | nullable | Free-form notes from agent |
| language_preference | text | nullable | Spoken language for voice agent |
| crm_tags | text[] | nullable | Campaign or loyalty labels |
| last_updated_by | text | nullable | Agent or system that performed update |
| updated_at | timestamptz | default now() | |

### premium_customers
| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| customer_id | uuid | primary key, fk → `customers.customer_id` | VIP member |
| qualifying_date | date | not null | When customer reached premium status |
| qualification_reason | text | not null | e.g. "Top 5% LTV", "Sentiment Champion" |
| ltv_percentile | numeric(5,2) | nullable | Percentile rank across customer base |
| sentiment_avg | numeric(4,2) | nullable | Rolling sentiment score (-1 to 1) |
| concierge_notes | text | nullable | Manual white-glove instructions |

## Menu & Offer Tables
### menu_categories
| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| category_id | uuid | primary key | Menu grouping |
| name | text | unique not null | "Small Plates", "Chef Specials" |
| description | text | nullable | Category blurb |
| display_order | integer | default 0 | Ordering for channels |
| is_active | boolean | default true | Visibility toggle |
| created_at | timestamptz | default now() | |

### menu_items
| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| menu_item_id | uuid | primary key | Dish identifier |
| category_id | uuid | fk → `menu_categories.category_id` | Parent category |
| name | text | not null | Menu item name |
| description | text | nullable | Guest-facing copy |
| is_vegetarian | boolean | default false | Dietary flag |
| is_vegan | boolean | default false | |
| is_gluten_free | boolean | default false | |
| spice_level | text | check (in `('none','mild','medium','hot','chef_special')`) | Default spice intensity |
| base_price | numeric(8,2) | not null | Base price before mods |
| is_active | boolean | default true | Availability |
| image_url | text | nullable | Media asset |
| prep_time_minutes | integer | nullable | SLA guidance |
| created_at | timestamptz | default now() | |

### discounts
| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| discount_id | uuid | primary key | Offer identifier |
| name | text | not null | Promo label |
| discount_type | text | check (in `('percent','fixed','bogo')`) | Reward mechanic |
| value | numeric(6,2) | not null | Percentage or currency |
| starts_at | timestamptz | not null | Start timestamp |
| ends_at | timestamptz | nullable | Optional end |
| min_order_total | numeric(8,2) | default 0 | Threshold for eligibility |
| segment_id | uuid | fk → `customer_segments.segment_id` nullable | Targeted audience |
| is_stackable | boolean | default false | Can be used with other offers |
| notes | text | nullable | Redemption details |
| created_at | timestamptz | default now() | |

### menu_item_discounts
| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| menu_item_id | uuid | fk → `menu_items.menu_item_id` on delete cascade | Associated dish |
| discount_id | uuid | fk → `discounts.discount_id` on delete cascade | Associated offer |
| channel_scope | text | check (in `('voice','in_store','delivery_app','all')`) | Valid channels |
| primary key | (menu_item_id, discount_id) | | Composite key ensures uniqueness |

## Order & Metric Tables
### orders
| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| order_id | uuid | primary key | Order identifier |
| customer_id | uuid | fk → `customers.customer_id` | Ordering customer |
| placed_at | timestamptz | default now() | When order submitted |
| status | text | check (in `('draft','confirmed','in_kitchen','out_for_delivery','completed','cancelled')`) | Fulfillment state |
| subtotal | numeric(10,2) | not null | Sum of items |
| tax | numeric(10,2) | default 0 | Tax |
| discount_total | numeric(10,2) | default 0 | Applied discounts |
| tip | numeric(10,2) | default 0 | Gratuity |
| total | numeric(10,2) | not null | Final total |
| average_order_value_snapshot | numeric(10,2) | not null | Customer AOV prior to this order |
| fulfillment_type | text | check (in `('dine_in','takeout','delivery','catering','marketplace')`) | Service modality |
| delivery_address_id | uuid | fk → `customer_addresses.address_id` nullable | Address used for this order |
| delivery_instructions | text | nullable | Door codes, etc. |
| origin_channel | text | check (in `('voice_agent','web','mobile','marketplace','walk_in')`) | Source channel |
| agent_persona_id | uuid | fk → `agent_personas.agent_persona_id` nullable | Persona that handled order |
| created_at | timestamptz | default now() | |

### order_items
| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| order_item_id | uuid | primary key | Line identifier |
| order_id | uuid | fk → `orders.order_id` on delete cascade | Parent order |
| menu_item_id | uuid | fk → `menu_items.menu_item_id` | Ordered dish |
| quantity | integer | default 1 | Qty |
| unit_price | numeric(8,2) | not null | Price at time of order |
| discount_applied | numeric(8,2) | default 0 | Discount on line |
| special_requests | text | nullable | Modifiers taken from voice agent |

### customer_order_metrics (materialized view)
| Column | Type | Description |
| --- | --- | --- |
| customer_id | uuid | Reference to customer |
| lifetime_value | numeric(12,2) | Total net spend |
| order_count | integer | Completed orders |
| avg_order_value | numeric(10,2) | Average ticket size |
| last_order_at | timestamptz | Most recent purchase |
| favorite_items | uuid[] | Top dishes (by frequency) |
| last_sentiment | numeric(4,2) | Recent sentiment from interactions |
| churn_risk_score | numeric(4,2) | Optional ML output |

## Segmentation & Personalization
### customer_segments
| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| segment_id | uuid | primary key | Segment identifier |
| name | text | unique not null | Human-readable label |
| definition | jsonb | not null | Declarative filter rules (formerly `criteria_json`), e.g. `{"field":"avg_order_value", "operator":">", "value":60}` |
| is_dynamic | boolean | default true | Distinguishes algorithmic vs. manual lists |
| created_at | timestamptz | default now() | |
| refreshed_at | timestamptz | nullable | Last evaluation timestamp |

### customer_segment_members
| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| segment_id | uuid | fk → `customer_segments.segment_id` on delete cascade | |
| customer_id | uuid | fk → `customers.customer_id` on delete cascade | |
| primary key | (segment_id, customer_id) | | Prevents duplicates |
| joined_at | timestamptz | default now() | When customer entered segment |
| exit_at | timestamptz | nullable | When customer left segment |

### agent_personas
| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| agent_persona_id | uuid | primary key | Persona identifier |
| name | text | unique not null | e.g. "Concierge", "Spice Maestro" |
| description | text | nullable | Persona overview |
| tone_guidelines | jsonb | not null | Structured prompt hints, channel voice tone |
| suggestion_rules | jsonb | nullable | Offer ranking preferences |
| default_channel | text | check (in `('voice','sms','email')`) | Primary medium |
| created_at | timestamptz | default now() | |

### customer_persona_overrides
| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| customer_id | uuid | primary key, fk → `customers.customer_id` on delete cascade | Target customer |
| agent_persona_id | uuid | fk → `agent_personas.agent_persona_id` | Persona override |
| tone_overrides | jsonb | nullable | Custom voice register |
| playbook_overrides | jsonb | nullable | Offer/objection handling tweaks |
| valid_from | timestamptz | default now() | |
| valid_to | timestamptz | nullable | Expiration |
| last_reviewed_at | timestamptz | nullable | QA checkpoint |

## Conversation Intelligence
### agent_interactions
| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| interaction_id | uuid | primary key | Session identifier |
| customer_id | uuid | fk → `customers.customer_id` | Participant |
| order_id | uuid | fk → `orders.order_id` nullable | Related order |
| agent_persona_id | uuid | fk → `agent_personas.agent_persona_id` | Persona employed |
| channel | text | check (in `('voice','chat','sms','in_app')`) | Interaction medium |
| started_at | timestamptz | default now() | Start time |
| ended_at | timestamptz | nullable | End time |
| intent | text | nullable | Detected primary intent |
| sentiment_score | numeric(4,2) | nullable | Range -1 to 1 |
| resolution_status | text | check (in `('resolved','pending_followup','escalated')`) | Outcome |
| summary | text | nullable | Auto-generated recap |
| audio_reference | text | nullable | Storage pointer to audio asset |

### interaction_transcripts
| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| transcript_id | uuid | primary key | Transcript line |
| interaction_id | uuid | fk → `agent_interactions.interaction_id` on delete cascade | Parent interaction |
| turn_index | integer | not null | Conversational order |
| speaker | text | check (in `('customer','agent','system')`) | Speaker role |
| content | text | not null | Transcribed utterance |
| embedding_vector | vector(1536) | nullable | pgvector embedding for retrieval |
| confidence | numeric(4,2) | nullable | ASR confidence score |
| created_at | timestamptz | default now() | |

### transcript_media (optional)
| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| media_id | uuid | primary key | Asset identifier |
| interaction_id | uuid | fk → `agent_interactions.interaction_id` on delete cascade | |
| storage_path | text | not null | Object storage reference |
| media_type | text | check (in `('audio/mp3','audio/wav','video/mp4')`) | Format |
| duration_seconds | integer | nullable | Length |
| is_transcoded | boolean | default false | Ready for playback |
| created_at | timestamptz | default now() | |

## Relationship Summary
- `customers` ↔ `customer_addresses`: one-to-many with cascaded deletes; customers reference a default address through `primary_address_id`
- `customers` ↔ `customer_profiles`/`premium_customers`/`customer_persona_overrides`: one-to-one extensions for preference, VIP status, and persona overrides
- `customer_segments` ↔ `customer_segment_members`: many-to-many bridging customers into dynamic segments defined by JSON rules in `definition`
- `menu_categories` ↔ `menu_items`: one-to-many describing menu hierarchy
- `menu_items` ↔ `menu_item_discounts` ↔ `discounts`: many-to-many mapping targeted promos, optionally constrained by `segment_id`
- `customers` ↔ `orders` ↔ `order_items`: standard commerce flow; `orders.average_order_value_snapshot` captures trailing AOV before the current order posts
- `agent_personas` influence `orders` (optional), `agent_interactions`, and `customer_persona_overrides`
- `agent_interactions` aggregate voice sessions, linking to `interaction_transcripts` and optional `transcript_media` assets
- `customer_order_metrics` materialized view stitches transactional and interaction data to power personalization (lifecycle values, favorites, sentiment)

## Platform Architecture
### Operational Layer (Supabase PostgreSQL)
- Central transactional store leveraging row-level security for customer privacy
- pgvector extension enabled for semantic transcript and menu embeddings
- Supabase Realtime change data capture streams events to agent orchestration services

### Analytical Layer (Snowflake)
- **Major Architectural Choice**: Snowflake locked as the enterprise warehouse (see `major_decisions.json`)
- Nightly and micro-batch pipelines land Supabase replicas into Snowflake for analytics, ML feature engineering, and regulatory reporting
- dbt orchestrates ELT, schema contracts, and testing; derived marts feed BI and marketing automation

### Agent Orchestration
- Voice agent fetches `customer_profiles`, `customer_order_metrics`, current `menu_items`, and relevant `discounts` before engagement
- Persona selection logic reads `agent_personas` and optional `customer_persona_overrides` to assemble prompts and guardrails
- Post-call, transcripts and sentiment are written back to PostgreSQL; enrichment workers refresh metrics and segment memberships

## Next-Phase Enhancements
- Expand pgvector usage for similarity search across transcripts, menu descriptors, and customer cohorts
- Integrate ASR/diarization pipeline that stores raw media in `transcript_media`, text in `interaction_transcripts`, and sentiment/intents in `agent_interactions`
- Automate preference enrichment by parsing transcripts into structured updates for `customer_profiles`
- Maintain rolling VIP tiers in `premium_customers` using Snowflake analytics jobs with outputs synced to Supabase
- Version agent behavior by storing model metadata and runtime configs alongside `agent_personas`
- Strengthen compliance with encryption, consent tracking, and deletion workflows across operational and analytical layers
