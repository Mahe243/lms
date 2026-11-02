---
title: Rate Limiting
aliases:
  - API Throttling
  - Request Throttling
  - Rate Limiter
tags:
  - pm2
  - api
  - web-fundamentals
  - security
  - scalability
category: APIs & Integrations
---

## Definition
#definition

Rate Limiting is the practice of controlling how many [[REST-API]] requests a client can make within a given time window. When a client exceeds the allowed limit, the server responds with an [[HTTP-Protocol]] `429 Too Many Requests` status code. Rate limiting protects backend systems from overload, ensures fair usage across consumers, and is a fundamental mechanism for API monetization and [[API-Authentication]] tiers.

## How It Works

- **Token bucket algorithm**: The most common rate-limiting algorithm. Each client gets a "bucket" with a fixed number of tokens. Every request consumes one token. Tokens are replenished at a fixed rate (e.g., 10 tokens per second). If the bucket is empty, requests are rejected with a 429. This allows short bursts of traffic while enforcing an average rate.

- **Sliding window counters**: Instead of fixed time windows (e.g., "100 requests per minute starting at :00"), sliding windows track requests over a rolling period. This prevents the "boundary burst" problem where a client sends 100 requests at :59 and another 100 at :01, effectively doubling the intended limit.

- **Response headers**: Well-designed APIs include rate-limit information in response headers: `X-RateLimit-Limit` (max requests), `X-RateLimit-Remaining` (requests left), and `X-RateLimit-Reset` (when the window resets). This lets clients self-regulate before hitting 429s, which is a key concern for [[API-Documentation]].

- **Tiered limits by plan**: Rate limits are often tied to pricing tiers. A free tier might allow 100 requests/hour, while an enterprise tier allows 10,000 requests/second. This creates a natural upsell path that PMs can leverage in the [[API-Lifecycle]] monetization strategy.

- **Implementation layers**: Rate limiting can be enforced at multiple points -- the API gateway (e.g., Kong, AWS API Gateway), a reverse proxy (Nginx), application middleware, or a distributed cache like [[Redis]]. Each layer serves a different purpose, from DDoS protection to per-user fairness.

## PM Implications
#pm-implication

- **Rate limits define product tiers**: For API-first products, rate limits are often the primary differentiator between free and paid plans. PMs must set limits that are generous enough for developers to build meaningful integrations but restrictive enough to drive upgrades. Analyzing usage patterns from [[Monitoring]] tools helps calibrate these thresholds.

- **429 errors are a UX problem**: When legitimate users hit rate limits, the experience must be graceful. PMs should ensure the API returns clear error messages with retry-after headers, and that [[API-Documentation]] prominently explains limits. A poor rate-limiting experience drives developers to competitors.

- **Abuse prevention vs. growth**: Too-aggressive rate limiting can throttle legitimate growth (e.g., a partner's viral campaign driving unexpected traffic). PMs must design escalation paths -- temporary limit increases, burst allowances, or dedicated support channels for high-growth integrators.

- **Cost management**: Rate limiting is also a cost control mechanism. Every API call consumes compute, bandwidth, and potentially third-party costs (e.g., calls to a maps or payments provider). PMs must model the unit economics of API calls when setting limits.

## Example

**Zomato/Swiggy API rate limiting (India context)**: Zomato's public API (before it was restricted) allowed 1,000 calls per day for free-tier developers building restaurant discovery apps. Restaurant aggregator startups that exceeded this limit had to either optimize their caching strategy (reducing redundant calls via [[CDN]] patterns) or upgrade to a commercial agreement. When Zomato deprecated its public API, many third-party apps broke overnight -- illustrating how rate limits and API availability are existential dependencies for downstream products. Internally, Swiggy rate-limits its delivery partner APIs to prevent runaway polling from driver apps -- each driver app checks for new orders at a controlled interval rather than hammering the server, saving significant [[Cloud-Computing]] costs during peak dinner hours.

## Key Response Headers

When an API implements rate limiting properly, the response includes headers that help developers build resilient integrations:

- `X-RateLimit-Limit`: Maximum requests allowed in the current window
- `X-RateLimit-Remaining`: How many requests the client can still make
- `X-RateLimit-Reset`: Unix timestamp when the window resets
- `Retry-After`: Seconds to wait before retrying (included with 429 responses)

PMs should verify that their team's [[API-Documentation]] explains these headers clearly, as they are the difference between a developer who self-regulates gracefully and one who brute-force retries until blocked.

## Related Concepts

- [[REST-API]]
- [[HTTP-Protocol]]
- [[API-Authentication]]
- [[API-Lifecycle]]
- [[Monitoring]]
- [[Session-04-APIs-Integrations]]
