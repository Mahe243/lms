---
title: SQLite
aliases:
  - SQLite3
  - SQLite Database
tags:
  - pm2
  - database
  - sql
  - prototyping
  - mobile
category: Databases
---

## Definition
#definition

**SQLite** is a lightweight, serverless, self-contained relational database engine that stores the entire database in a single file on disk. Unlike [[PostgreSQL]] or MySQL which run as separate server processes, SQLite is embedded directly into the application -- no installation, no configuration, no database server to manage. For PMs, SQLite is the ideal database for prototyping, mobile applications, and small-to-medium products where simplicity trumps scale. It is the most deployed database engine in the world, running on every smartphone (iOS and Android use it internally), every web browser, and most IoT devices.

## How It Works

- **Serverless Architecture**: SQLite requires no separate database process. The application reads and writes directly to a file (e.g., `app.db`). This makes setup trivial -- `pip install flask` and you have a web app with a database, no Docker, no database installation, no connection strings to configure. Development velocity is maximized, which is why nearly every web framework (Django, Rails, Flask) uses SQLite as the default development database.

- **Single-File Storage**: The entire database -- tables, indexes, data -- lives in one portable file. You can copy `app.db` to another machine and it works immediately. This makes backups trivial (copy the file), sharing easy (email it), and version control possible (though not recommended for large databases). A 1GB SQLite file can hold millions of rows comfortably.

- **SQL Compatibility**: SQLite supports most of [[SQL-Basics|standard SQL]]: SELECT, JOIN, subqueries, window functions, CTEs, triggers, and views. Code written for SQLite often migrates to [[PostgreSQL]] with minimal changes, making it an excellent prototyping database before committing to a production setup. The few incompatibilities (e.g., ALTER TABLE limitations, no right outer join until recently) are well-documented and rarely affect application code.

- **Concurrency Limitations**: SQLite uses file-level locking -- only one writer at a time. This is fine for applications with low-to-moderate write concurrency (personal tools, mobile apps, development servers) but becomes a bottleneck for high-concurrency web applications serving hundreds of simultaneous users. WAL (Write-Ahead Logging) mode improves this significantly, allowing concurrent reads during writes, and is now the recommended default.

- **Modern Revival**: Tools like Litestream (continuous SQLite replication to S3), LiteFS (distributed SQLite for fly.io), and Turso (SQLite at the edge) are pushing SQLite into production server use cases. The "SQLite in production" movement is growing, especially for read-heavy applications deployed at the edge. Companies like Expensify run their production systems on SQLite, demonstrating it can work beyond prototyping when architected correctly.

## PM Implications
#pm-implication

- **Prototype Speed**: When a PM needs an MVP in 2 weeks, insisting on a full [[PostgreSQL]] + [[Redis]] + Docker setup adds unnecessary complexity. SQLite lets a solo developer or small team build and deploy a working product in days. The PM can validate the idea with real users before investing in production infrastructure. This aligns with the lean startup principle: validate first, scale later.

- **Mobile & Offline-First Products**: Every major mobile app uses SQLite for local data storage. If your product needs offline capabilities (reading cached content, queuing actions for later sync), SQLite on the device is the standard approach. PMs building mobile products should understand that SQLite on-device and [[PostgreSQL]] on-server is a common architecture, and the sync logic between them is a feature to be explicitly scoped.

- **Migration Planning**: A product that starts on SQLite will likely need to migrate to [[PostgreSQL]] as it scales beyond a few hundred concurrent users or needs features like JSONB, advanced full-text search, or geospatial queries. PMs should plan for this [[Database-Migration]] in the roadmap -- typically a 2-4 week effort if the team used standard SQL from the start. The key decision point: when write contention causes user-visible errors.

- **Edge & Embedded Use Cases**: IoT products, desktop applications, and browser extensions all use SQLite. If the PM is building a product that runs on user devices rather than in the [[Cloud-Computing|cloud]], SQLite is likely the database, and understanding its constraints (single-writer, file size limits of ~281 TB theoretical) shapes feature design. Products like 1Password and Obsidian itself use SQLite for local data storage.

## SQLite vs. PostgreSQL: When to Use Which

| Factor | [[SQLite]] | [[PostgreSQL]] |
|--------|--------|------------|
| Setup time | Zero (embedded) | Hours (server, config, Docker) |
| Concurrent users | 1-50 | Thousands+ |
| Concurrent writers | 1 (file lock) | Many (row-level locking) |
| Hosting cost | $0 (file on disk) | $15-500+/month managed |
| Best for | Prototypes, mobile, embedded | Production web apps |
| Full-text search | Basic | Advanced (tsvector) |
| JSON support | Basic | JSONB (indexed, queryable) |
| Geospatial | None | PostGIS |

**Rule of thumb**: Start with SQLite for validation, plan [[Database-Migration]] to PostgreSQL when write concurrency or advanced features become necessary.

## Example

**Dunzo's Driver App Offline Mode**: Dunzo, the Indian hyperlocal delivery app, uses SQLite on their delivery partner (driver) mobile app for offline resilience.

When a driver enters an area with poor network connectivity (common in Indian tier-2 cities), the app continues to function using SQLite-stored data: current delivery details, route information, customer contact info, and a queue of status updates.

When connectivity returns, the app syncs the queued updates to Dunzo's backend [[PostgreSQL]] database. The PM designed this offline-first architecture after analyzing delivery failure data showing that 8% of deliveries in tier-2 cities experienced connectivity gaps of 5+ minutes.

Without SQLite offline storage, drivers would see blank screens and call support -- degrading both delivery speed and support costs. The [[Database-Migration|data sync]] logic between local SQLite and server-side PostgreSQL was scoped as a 3-sprint engineering investment that reduced connectivity-related delivery failures by 60%.

The SQLite database on each driver's phone is typically under 5MB, containing only active delivery data -- completed deliveries are purged after successful sync.

## Related Concepts

- [[SQL-Basics]] -- the query language SQLite implements
- [[PostgreSQL]] -- the production database SQLite prototypes often migrate to
- [[Database-Migration]] -- migrating from SQLite to production databases
- [[NoSQL-Databases]] -- alternative paradigm for unstructured data
- [[Schema-Migration]] -- managing schema changes in SQLite
- [[State-Management]] -- SQLite for local state in mobile apps
- [[Redis]] -- complements SQLite/PostgreSQL for caching needs
