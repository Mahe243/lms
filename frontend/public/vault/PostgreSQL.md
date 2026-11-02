---
title: PostgreSQL
aliases:
  - Postgres
  - PG
tags:
  - pm2
  - database
  - sql
  - infrastructure
  - backend
category: Databases
---

## Definition
#definition

**PostgreSQL** (often called "Postgres") is a powerful, open-source relational database management system known for its reliability, feature richness, and standards compliance. It supports advanced data types (JSON, arrays, geospatial), full-text search, and complex queries beyond what simpler databases like MySQL or [[SQLite]] offer. For PMs, PostgreSQL is the "default choice" for most web applications because it balances performance, flexibility, and zero licensing costs -- making it the database you will most frequently encounter on engineering teams.

## How It Works

- **Relational Model**: Data is organized into tables with rows and columns, linked by foreign keys. A users table relates to an orders table, which relates to a products table. [[SQL-Basics|SQL]] is used to query, insert, update, and delete data. PostgreSQL's SQL implementation is one of the most complete and standards-compliant available, supporting window functions, CTEs (Common Table Expressions), and recursive queries.

- **ACID Compliance**: PostgreSQL guarantees Atomicity, Consistency, Isolation, and Durability for transactions. This means if a payment deduction and order creation happen in a single transaction, either both succeed or both fail -- never a state where money is deducted but the order isn't created. This is non-negotiable for financial and e-commerce products where data consistency directly affects user trust and regulatory compliance.

- **Advanced Features**: JSONB columns let you store semi-structured data alongside relational data, reducing the need for [[NoSQL-Databases]] in many cases. PostGIS extension enables geospatial queries ("find all restaurants within 3km"). Full-text search reduces dependency on external search engines for simpler use cases. Row-Level Security (RLS) enables fine-grained access control that maps to product permission models.

- **Managed Offerings**: [[AWS]] RDS for PostgreSQL, [[Azure]] Database for PostgreSQL, and [[GCP]] Cloud SQL for PostgreSQL handle backups, patching, replication, and failover. Supabase and Neon offer PostgreSQL-as-a-service with additional developer tools like auto-generated REST APIs and real-time subscriptions. PMs should understand the cost trade-offs per [[Cloud-Billing]] -- managed services cost 2-3x self-hosted but eliminate DevOps overhead.

- **Scaling Patterns**: PostgreSQL scales vertically well (bigger machines handle more load) and supports read replicas for read-heavy workloads. For write-heavy scaling, techniques like table partitioning, connection pooling (PgBouncer), and eventually [[Database-Scaling|sharding]] are used. These decisions affect product architecture and [[Schema-Migration]] complexity. Most products won't need sharding until millions of daily active users.

## PM Implications
#pm-implication

- **Default Database Choice**: Unless there is a specific reason not to (extreme scale, document-oriented data, real-time requirements), PostgreSQL is the right starting choice. PMs should resist engineering proposals for exotic databases unless the use case genuinely demands it -- PostgreSQL's versatility covers 80% of product data needs. "Start with Postgres, migrate later only if you must" is sound product engineering wisdom.

- **Data Modeling Collaboration**: PMs should participate in data modeling discussions because the database schema reflects the product's domain model. If the PM thinks of "orders" and "subscriptions" as separate concepts but engineering models them as one table, future features will be constrained. See [[SQL-Basics]] and [[Schema-Migration]]. Good data models make features easy to build; bad ones create permanent friction.

- **Migration Complexity**: Changing databases later is extremely expensive. A PM who lets the team start with MongoDB "for speed" may face a 3-6 month migration project when the product needs relational features like complex reporting, joins across entities, or transactional consistency. Starting with PostgreSQL avoids this costly [[Database-Migration]].

- **Performance as a Feature**: Query performance directly affects user experience. A product listing page backed by a slow PostgreSQL query feels slow to users regardless of frontend optimization. PMs should track database query latency in [[Monitoring]] dashboards alongside API response times. When a PM reports "the search page is slow," engineering needs to know whether the bottleneck is the database, the API, or the frontend -- [[Monitoring-Observability|observability]] data answers this.

## PostgreSQL vs. Alternatives (PM Cheat Sheet)

| Factor | [[PostgreSQL]] | MySQL | MongoDB ([[NoSQL-Databases\|NoSQL]]) |
|--------|-----------|-------|---------|
| Data model | Relational + JSONB | Relational | Document (JSON) |
| ACID transactions | Full | Full | Multi-doc since 4.0 |
| Geospatial | PostGIS (excellent) | Basic | GeoJSON (good) |
| Full-text search | Built-in | Basic | Atlas Search |
| Licensing cost | Free | Free / paid | Free / paid |
| Best for | General purpose | Web apps, WordPress | Rapid prototyping, flexible schemas |
| PM should pick when | Default choice | Legacy requirement | Schema changes weekly in early stage |

## Example

**Zerodha's Core Trading Database**: Zerodha, India's largest stock broker by active users, uses PostgreSQL as the backbone of its trading platform.

User portfolios, order history, holdings, and watchlists are stored in PostgreSQL tables with strict ACID transactions -- when a user places an order, the order record, margin deduction, and position update happen atomically.

Their PM team benefits from PostgreSQL's rich querying capability: product analytics queries like "average holding period for mutual fund SIPs by age cohort" run directly on the database using SQL window functions, giving PMs answers in minutes rather than waiting for a data engineering pipeline.

When Zerodha needed to add support for GTT (Good Till Triggered) orders, the [[Schema-Migration]] involved adding new tables and columns to their PostgreSQL schema -- a change the PM scoped into a 2-sprint migration plan with zero downtime using incremental migration techniques. The PM also leveraged PostgreSQL's JSONB columns to store flexible trigger conditions (price > X, price < Y, time-based) without requiring a rigid column-per-condition schema, future-proofing the feature for new trigger types.

## Related Concepts

- [[SQL-Basics]] -- the query language used with PostgreSQL
- [[Database-Scaling]] -- scaling PostgreSQL for growth
- [[NoSQL-Databases]] -- alternative paradigm for non-relational data
- [[Redis]] -- often used alongside PostgreSQL for caching
- [[SQLite]] -- lightweight alternative for prototyping
- [[Schema-Migration]] -- managing PostgreSQL schema changes over time
- [[Database-Migration]] -- moving between database systems
- [[Cloud-Billing]] -- managed PostgreSQL pricing
