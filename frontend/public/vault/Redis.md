---
title: Redis
aliases:
  - Redis Cache
  - Redis Server
tags:
  - pm2
  - database
  - caching
  - infrastructure
  - performance
category: Databases
---

## Definition
#definition

**Redis** (Remote Dictionary Server) is an open-source, in-memory key-value data store used primarily for caching, session management, real-time leaderboards, rate limiting, and message queuing. Unlike [[PostgreSQL]] which stores data on disk, Redis keeps everything in RAM, making reads and writes extremely fast (sub-millisecond latency). For PMs, Redis is the invisible performance layer that makes your product feel fast -- it sits between your application and your primary database, serving frequently accessed data at speeds 10-100x faster than a disk-based query.

## How It Works

- **In-Memory Storage**: Redis stores all data in RAM. A key-value lookup in Redis takes ~0.1ms compared to ~5-50ms for a [[PostgreSQL]] query. This speed comes with a trade-off: RAM is expensive, so Redis stores only hot data (frequently accessed), not your entire dataset. Typical Redis instances range from 1GB to 64GB. At current cloud prices, a 16GB Redis instance on [[AWS]] ElastiCache costs roughly $300-400/month.

- **Data Structures**: Redis is more than a simple cache. It supports strings, hashes (objects), lists (queues), sets (unique collections), sorted sets (leaderboards), streams (event logs), and HyperLogLog (cardinality estimation). These structures enable patterns beyond caching -- real-time leaderboards, rate limiters, pub/sub messaging, and session stores. PMs should know these exist because they unlock features that would be complex to build with [[PostgreSQL]] alone.

- **Cache Patterns**: The most common pattern is **cache-aside**: the application checks Redis first; if the data exists (cache hit), return it instantly. If not (cache miss), query [[PostgreSQL]], store the result in Redis with an expiration time (TTL), and return it. Cache hit rates of 90-99% are typical, meaning 90-99% of reads never touch the database. Other patterns include write-through (write to cache and DB simultaneously) and write-behind (write to cache first, async to DB).

- **Persistence Options**: Redis can optionally persist data to disk via RDB snapshots (periodic full dumps) or AOF (append-only log of every write). This provides durability for use cases like session storage where data loss is unacceptable, though at the cost of some write performance. For pure caching, persistence is often disabled since the source of truth is the primary database.

- **Managed Offerings**: [[AWS]] ElastiCache for Redis, [[Azure]] Cache for Redis, and [[GCP]] Memorystore for Redis handle clustering, replication, and failover. These managed services cost $15-500+/month depending on instance size and configuration. See [[Cloud-Billing]]. Redis Cluster mode enables horizontal scaling by sharding data across multiple nodes for datasets exceeding a single node's RAM.

## PM Implications
#pm-implication

- **Performance Requirements Drive Adoption**: When the PM sets a target like "product listing page must load in under 200ms," Redis often becomes necessary. Without caching, each page load might require 5 database queries at 20ms each = 100ms just in DB time. With Redis caching catalog data, those 5 queries become 5 cache lookups at 0.1ms each = 0.5ms. PMs should understand that aggressive latency targets imply caching infrastructure and its associated [[Cloud-Billing|costs]] and complexity.

- **Cache Invalidation Complexity**: "There are only two hard things in computer science: cache invalidation and naming things." When a product's price changes in [[PostgreSQL]], the cached price in Redis must be updated or expired. If it is not, users see stale data. PMs must define staleness tolerance: "product prices can be up to 5 minutes stale" or "inventory counts must be real-time." This directly affects engineering complexity and should be documented in the feature spec.

- **Session & [[State-Management]]**: Redis is the standard solution for user session storage in [[Auto-Scaling|auto-scaled]] environments. When you have 10 application servers, a user's session (cart contents, login state) must be accessible from any server. Redis serves as the shared session store, enabling horizontal scaling. Without it, scaling out breaks user sessions.

- **Feature Enablement**: Redis's data structures enable features that would be complex to build with a relational database alone. Real-time leaderboards (sorted sets), rate limiting (counters with expiry), real-time activity feeds (sorted sets + lists), and pub/sub notifications all use Redis natively. When a PM asks "can we add a live leaderboard?", the engineering answer is almost always "yes, with Redis."

## Common Redis Use Cases for PMs

| Use Case | Redis Data Structure | PM Decision |
|----------|---------------------|-------------|
| Page/API caching | String (key-value) | Define TTL (staleness tolerance) |
| User sessions | Hash | Required for [[Auto-Scaling]] |
| Rate limiting | String + EXPIRE | Define limits per user/API key |
| Real-time leaderboard | Sorted Set | Define ranking criteria and update frequency |
| Job queue | List or Stream | Define retry policy and priority |
| Feature flags | String | Define rollout percentage |
| Pub/sub notifications | Pub/Sub channels | Define message delivery guarantees |

## Example

**Swiggy's Menu & Restaurant Caching**: Swiggy, India's food delivery platform, uses Redis extensively to deliver fast restaurant listing and menu experiences.

When a user opens Swiggy, the app needs to show nearby restaurants with ratings, delivery times, and cuisine tags. Querying [[PostgreSQL]] for 50 restaurants with their menus, ratings, and real-time delivery estimates on every app open would be prohibitively slow.

Instead, Swiggy caches restaurant metadata in Redis with a 10-minute TTL -- restaurant name, cuisine, rating, and average delivery time. Menu items are cached with a 30-minute TTL since they change less frequently.

The PM defined these TTL values based on user impact analysis: a restaurant changing its name (rare) being stale for 10 minutes is acceptable, but delivery time estimates refresh from the real-time logistics engine every minute (not cached in Redis).

This caching strategy gives Swiggy sub-100ms listing load times while keeping critical data fresh. Redis sorted sets also power Swiggy's "popular dishes near you" ranking, updated every 15 minutes based on order frequency. The Redis cluster costs approximately Rs 8 lakh/month across [[AWS]] ElastiCache but saves an estimated Rs 25 lakh/month in [[Database-Scaling|database compute]] that would otherwise be needed.

## Related Concepts

- [[NoSQL-Databases]] -- Redis as a NoSQL data store
- [[State-Management]] -- Redis for session and state storage
- [[Database-Scaling]] -- caching as a scaling strategy
- [[PostgreSQL]] -- the primary database Redis typically caches for
- [[Auto-Scaling]] -- Redis enables stateless application scaling
- [[Cloud-Billing]] -- Redis infrastructure costs
- [[Monitoring]] -- cache hit rate as a key performance metric
