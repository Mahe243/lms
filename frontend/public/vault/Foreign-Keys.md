---
title: Foreign Keys
aliases: [FK, Foreign Key Constraint, Referential Integrity]
tags: [database, pm2, sql, data-modeling, data-integrity]
category: Database
---

## Definition
#definition

A foreign key is a column (or set of columns) in a relational database table that creates a link to the [[Primary-Keys|primary key]] of another table, enforcing referential integrity -- ensuring that relationships between tables remain consistent and that no record references a non-existent parent.
Foreign keys are the mechanism by which relational databases model real-world relationships (a customer has many orders, an order belongs to a customer).
For PMs, understanding foreign keys is essential for designing data models that correctly represent business logic and prevent data corruption.

## How It Works

- **Referential Integrity Enforcement**: When a foreign key constraint is defined, the database engine ensures that every value in the foreign key column matches an existing value in the referenced primary key column.
  Attempting to insert an order with a `customer_id` of 999 when no customer with ID 999 exists will be rejected by the database.
  This prevents "orphan records" -- data that references entities that do not exist.

- **CASCADE, SET NULL, and RESTRICT**: Foreign key constraints define what happens when the referenced parent record is deleted or updated.
  CASCADE automatically deletes or updates child records (delete a customer and all their orders are deleted).
  SET NULL sets the foreign key to NULL (the order remains but loses its customer reference).
  RESTRICT prevents the parent deletion entirely if child records exist.
  PMs must understand these behaviors because they directly affect product behavior -- should deleting a user delete all their content?

- **One-to-Many and Many-to-Many**: A foreign key in a child table pointing to a parent table models a one-to-many relationship (one customer, many orders).
  Many-to-many relationships (students enrolled in courses) require a junction table with two foreign keys -- one to each parent table.
  These patterns map directly to [[ER-Diagrams]] that PMs review during design.

- **Indexing Foreign Keys**: Foreign key columns should typically be indexed for performance.
  Without an index, JOIN queries and CASCADE operations require full table scans.
  PMs should be aware that as data volume grows, unindexed foreign keys can cause significant performance degradation in queries that power key product features like dashboards and reports.

- **Foreign Keys and [[Normalization]]**: Foreign keys enable normalized database design by allowing related data to live in separate tables rather than being duplicated.
  A customer's address is stored once in the customers table rather than repeated in every order.
  When the address changes, it is updated in one place.
  This is the foundation of data consistency in relational databases.

## PM Implications
#pm-implication

- **Deletion behavior is a product decision, not just a database decision**: When a user deletes their account, should their reviews, comments, and posts also be deleted (CASCADE)?
  Or should those remain as anonymous content (SET NULL)?
  Under [[GDPR]] and [[DPDP-Act]], users have a right to erasure, which may require CASCADE deletion of all personal data.
  PMs must specify deletion behavior in PRDs because the foreign key constraint configuration implements that business logic.

- **Data model reviews prevent costly migrations**: Incorrect foreign key relationships discovered after launch require database migrations, which can involve downtime, data transformation scripts, and regression testing.
  PMs who participate in [[ER-Diagrams|ER diagram]] reviews and understand foreign key cardinality (one-to-many vs. many-to-many) catch design mistakes before they become migration nightmares.

- **Foreign keys affect API and feature design**: If orders reference customers via a foreign key, the API must handle the case where a customer is deleted before their orders are displayed.
  PMs should work with engineers to define the expected behavior at each relationship boundary and ensure the UI handles edge cases gracefully -- showing "Deleted User" instead of crashing on a null reference.

- **Performance at scale requires foreign key awareness**: In high-volume transactional systems (payment platforms, e-commerce), cascading deletes or updates across deeply nested foreign key chains can lock tables and degrade performance.
  PMs must balance referential integrity with performance requirements, sometimes opting for application-level integrity checks (soft deletes) instead of database-enforced cascades.

## Example

Consider Swiggy's data model for their food delivery platform.
The `orders` table has a foreign key `restaurant_id` referencing the `restaurants` table, and another foreign key `customer_id` referencing the `customers` table.
Each order also has related records in `order_items` (linked by `order_id` foreign key) and `delivery_assignments` (linked by `order_id`).
When Swiggy decided to allow restaurant partners to "pause" their listing rather than delete it, the foreign key relationship made this straightforward -- historical orders still reference the restaurant for order history and accounting, even when the restaurant is not accepting new orders.
If they had allowed CASCADE delete on the restaurant, all historical order data would vanish when a restaurant deactivated.
Conversely, when implementing [[GDPR]]-style data deletion for customer accounts, Swiggy needed to handle the foreign key chain carefully: delete the customer's personal data (name, phone, address) while preserving anonymized order records for financial reporting and restaurant analytics.
This required a combination of SET NULL on the customer foreign key and a separate data anonymization script -- a product decision that PMs had to specify explicitly in the requirements.

## Related Concepts

- [[Primary-Keys]]
- [[ER-Diagrams]]
- [[SQL-Basics]]
- [[Normalization]]
- [[GDPR]]
- [[Session-11-Security-Compliance]]
