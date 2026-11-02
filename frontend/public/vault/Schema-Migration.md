---
title: Schema Migration
aliases:
  - Database Schema Migration
  - DB Migration
  - Migration Scripts
tags:
  - pm2
  - database
  - deployment
  - infrastructure
  - backend
category: Databases
---

## Definition
#definition

**Schema Migration** is the process of managing incremental, version-controlled changes to a database's structure (tables, columns, indexes, constraints) over time. Just as application code evolves through Git commits, database schemas evolve through migration scripts -- each one a numbered, reversible change like "add `phone_number` column to users table" or "create `subscriptions` table." For PMs, schema migrations matter because every feature that touches data storage requires one, and poorly planned migrations can cause downtime, data loss, or multi-sprint delays.

## How It Works

- **Migration Files**: Each schema change is written as a migration file with an "up" (apply the change) and "down" (revert it) function. Files are numbered sequentially or timestamped: `001_create_users.sql`, `002_add_email_to_users.sql`, `003_create_orders.sql`. Frameworks like Rails ActiveRecord, Django, Alembic (Python), Flyway (Java), and Prisma manage these files. A mature product might have hundreds or thousands of migration files representing its entire schema history.

- **Version Tracking**: The migration tool maintains a table in the database (often called `schema_migrations`) recording which migrations have been applied. When you deploy new code, the tool checks which migrations are pending and runs them in order. This ensures every environment (dev, staging, production) has the same schema -- eliminating "works on my machine" database discrepancies.

- **Forward-Only in Production**: While migrations can theoretically be rolled back ("down"), production rollbacks are risky because data may have been written using the new schema. Teams generally prefer forward-fixing: if migration 005 introduced a bug, migration 006 fixes it rather than rolling back 005. PMs should understand that "just undo it" isn't always simple when users have already written data to the new structure.

- **Zero-Downtime Migrations**: Adding a column, creating an index, or adding a table can usually happen without downtime. But renaming a column, changing a column type, or dropping a table requires a multi-step migration across multiple deployments to avoid breaking running application code. The sequence: (1) add new column, (2) deploy code that writes to both old and new, (3) backfill data, (4) deploy code that reads from new, (5) drop old column. See [[Deployment-Pipeline]]. This expand-and-contract pattern can span 2-3 deployment cycles.

- **Data Migrations vs. Schema Migrations**: Schema migrations change structure (add column). Data migrations change content (populate the new column with values from another table or external source). Data migrations are often slower and riskier because they touch every row -- backfilling 100 million rows at 10,000 rows/second takes nearly 3 hours, during which database performance may degrade. PMs should distinguish between "add a field" (quick) and "backfill a field for 50 million users" (requires planning and [[Monitoring]]).

## PM Implications
#pm-implication

- **Feature Scoping Impact**: Every feature that needs new data fields requires a schema migration. A PM adding "user preferences" to a profile page needs a `preferences` table or a `preferences` JSONB column on the users table. Understanding this helps PMs scope features accurately -- the migration itself might take 1 day, but a complex migration with data backfill across 100 million rows could take a full sprint. PMs who ignore migration effort in their estimates consistently miss deadlines.

- **Deployment Coupling**: Schema migrations often need to be deployed in coordination with application code changes. If the migration runs before the code is deployed, the old code might break on the new schema. If the code deploys before the migration, the new code breaks on the old schema. PMs should know that some features require a "migration sprint" separate from the "feature sprint." See [[Session-09-Cloud-Deployment]] for strategies to manage this coordination.

- **Breaking Changes & Backward Compatibility**: Dropping a column, changing a column type, or renaming a table are breaking changes that require careful coordination. PMs planning to deprecate a feature should give engineering lead time for the migration plan -- typically one sprint to write and test the migration, another to execute it in production. Rushing a breaking migration is one of the most common causes of production outages affecting [[Uptime]].

- **Data Integrity Risks**: A migration that adds a NOT NULL constraint to an existing column will fail if any rows have NULL values. A migration that creates a unique index will fail if duplicates exist. PMs should discuss data quality assumptions with engineering before migration work begins -- the answer may surface product decisions ("what should happen to the 5,000 users with duplicate email addresses?"). These are product questions, not engineering questions.

## Migration Complexity Guide for PMs

| Change Type | Risk Level | Typical Effort | Downtime? |
|------------|-----------|----------------|-----------|
| Add new table | Low | 1 day | No |
| Add nullable column | Low | 1 day | No |
| Add NOT NULL column | Medium | 2-3 days | No (with default value) |
| Create index on large table | Medium | Hours to days | No (CONCURRENTLY) |
| Rename column | High | 1-2 sprints | No (expand-contract) |
| Change column type | High | 1-2 sprints | No (expand-contract) |
| Drop column/table | High | 1 sprint | No (if done last) |
| Backfill 100M+ rows | High | 1-2 sprints | No (batched) |

PMs should use this table when estimating feature timelines that require [[SQL-Basics|database changes]].

## Example

**Flipkart's Address System Migration**: When Flipkart's PM team decided to add "landmark" as a separate field in the delivery address (previously embedded in the address line), it required a carefully planned schema migration across their [[PostgreSQL]] user database of 200+ million addresses.

The migration plan spanned 3 sprints:
- **Sprint 1** -- Add the `landmark` column (nullable) to the addresses table and deploy code that reads from both the old address line and the new landmark field.
- **Sprint 2** -- Run a data migration script that uses NLP to extract landmark phrases ("near," "opposite," "behind") from existing address lines and populate the new column, processing 10 million addresses per day to avoid [[Monitoring|database load issues]].
- **Sprint 3** -- Deploy the updated address form in the app that prompts users for landmark separately, and update delivery partner APIs to send landmark as a discrete field.

The PM defined the landmark extraction rules with the ML team and set the success metric: "90% of addresses should have a parseable landmark within 60 days of launch." The zero-downtime approach meant Flipkart's 10 million daily orders were unaffected throughout the migration.

## Related Concepts

- [[Database-Migration]] -- the broader concept of migrating between database systems
- [[SQL-Basics]] -- the language used to write migration scripts
- [[Deployment-Pipeline]] -- migrations as part of the deployment process
- [[PostgreSQL]] -- the database most commonly migrated in web applications
- [[SQLite]] -- lightweight database with simpler migration needs
- [[Uptime]] -- migration failures can cause downtime
- [[Session-09-Cloud-Deployment]] -- deploying migrations in cloud environments
