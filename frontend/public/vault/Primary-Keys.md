---
title: Primary Keys
aliases: [PK, Primary Key, Unique Identifier, Record ID]
tags: [database, pm2, sql, data-modeling, data-integrity]
category: Database
---

## Definition
#definition

A primary key is a column (or combination of columns) in a relational database table that uniquely identifies each row, ensuring that no two records have the same identifier and that the identifier is never NULL.
It is the most fundamental constraint in relational database design -- without primary keys, the database cannot distinguish between records, joins between tables via [[Foreign-Keys]] break down, and data integrity collapses.
For PMs, the choice of primary key strategy (auto-increment integers vs. UUIDs vs. natural keys) has downstream implications for API design, URL structure, scalability, and even [[Privacy-by-Design|privacy]].

## How It Works

- **Auto-Increment Integer IDs**: The database automatically assigns sequential integers (1, 2, 3, ...) as each new record is created.
  This is the simplest and most storage-efficient approach.
  MySQL's `AUTO_INCREMENT` and PostgreSQL's `SERIAL` / `IDENTITY` columns implement this.
  However, sequential IDs expose information -- a competitor can estimate your user count by creating an account and observing their user ID.

- **UUIDs (Universally Unique Identifiers)**: 128-bit identifiers generated algorithmically (e.g., `550e8400-e29b-41d4-a716-446655440000`) that are statistically guaranteed to be unique across systems without coordination.
  UUIDs are ideal for distributed systems where multiple servers create records simultaneously (no central counter needed).
  The trade-off is larger storage size (16 bytes vs. 4 bytes for an integer) and less human-readable values.
  UUID v7 (time-ordered) improves database indexing performance over random UUID v4.

- **Composite Primary Keys**: Two or more columns together form the primary key.
  For example, in an `enrollments` table, the composite key `(student_id, course_id)` uniquely identifies each enrollment and inherently prevents duplicate enrollments.
  Composite keys are common in junction tables that model many-to-many relationships in [[ER-Diagrams]].

- **Natural Keys vs. Surrogate Keys**: A natural key uses real-world data as the identifier (email address, Aadhaar number, PAN number).
  A surrogate key is an artificial identifier with no business meaning (auto-increment ID, UUID).
  Natural keys are tempting because they are meaningful, but they can change (a user changes their email) and may carry [[Privacy-by-Design|privacy]] implications (exposing PII in URLs).
  Most modern systems use surrogate keys for primary identification and enforce uniqueness on natural keys separately.

- **Primary Key Indexing**: The database automatically creates a clustered index (in most RDBMS) on the primary key, making lookups by ID extremely fast -- O(log n) with B-tree indexes.
  This is why API calls like `GET /users/12345` are efficient.
  PMs should understand that queries filtering by primary key are inherently fast, while queries on non-indexed columns may not be.

## PM Implications
#pm-implication

- **ID format affects security and privacy**: If user profiles are accessible at `/user/1234`, an attacker can enumerate all users by incrementing the ID.
  This is an [[OWASP-Top-10]] vulnerability (Insecure Direct Object Reference / IDOR).
  UUIDs or opaque tokens in URLs prevent this enumeration.
  PMs should specify non-sequential public-facing identifiers in API design requirements, especially for resources containing personal data.

- **ID strategy affects system scalability**: Auto-increment IDs require a central counter, which becomes a bottleneck in distributed systems.
  If the product roadmap includes multi-region deployment or microservices architecture, PMs should advocate for UUIDs or distributed ID generation (Twitter's Snowflake, Instagram's approach) early -- migrating primary key strategies post-launch is one of the most painful database changes.

- **Primary keys shape the API contract**: Once you expose a primary key format in your API (integer IDs in URLs, UUID in response payloads), changing it is a breaking change for all API consumers.
  PMs should be deliberate about ID format decisions during API design, treating them as part of the public contract.
  Stripe uses prefixed IDs (`cus_`, `pi_`, `sub_`) that are both opaque and self-documenting -- a UX-conscious approach to primary keys.

- **Composite keys complicate APIs but enforce business rules**: Using a composite key like `(tenant_id, resource_id)` in a multi-tenant [[SQL-Basics|database]] inherently prevents cross-tenant data access at the database level.
  PMs at B2B SaaS companies should understand how composite keys can enforce data isolation without relying solely on application logic.

## Example

When IRCTC (Indian Railway Catering and Tourism Corporation) redesigned its ticket booking system to handle peak loads of over 25 lakh (2.5 million) bookings per day during Tatkal season, primary key strategy was a critical architecture decision.
The original system used auto-increment integer IDs for PNR (Passenger Name Record) numbers -- a 10-digit number that remains the booking's primary identifier.
However, as IRCTC scaled to handle concurrent bookings from millions of users, the sequential ID generation became a contention point.
For the booking transaction system, they moved to a composite approach: the PNR itself remained the user-facing identifier (a natural key that passengers recognize), while internal systems used time-ordered surrogate keys for transaction processing across distributed database shards.
This allowed multiple booking servers to process transactions in parallel without waiting for a central ID counter.
For PMs at high-throughput platforms, IRCTC's architecture illustrates a key lesson: you can decouple the user-facing identifier (PNR displayed on tickets) from the internal primary key (used for database operations), giving you both meaningful user experience and scalable infrastructure.

## Related Concepts

- [[Foreign-Keys]]
- [[ER-Diagrams]]
- [[SQL-Basics]]
- [[Normalization]]
- [[OWASP-Top-10]]
- [[Session-11-Security-Compliance]]
