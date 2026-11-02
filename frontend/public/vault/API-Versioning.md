---
title: API Versioning
aliases:
  - API Version Management
  - API Version Strategies
tags:
  - pm2
  - api
  - web-fundamentals
  - backward-compatibility
category: APIs & Integrations
---

## Definition
#definition

API Versioning is the practice of managing changes to an [[REST-API]] so that existing consumers are not broken when the API evolves. It involves assigning version identifiers to API releases and choosing a strategy (URL path, HTTP headers, or query parameters) to let clients specify which version they want. Versioning is a core part of the [[API-Lifecycle]] and one of the most consequential technical decisions a PM will influence.

## How It Works

- **URL path versioning** (e.g., `/api/v1/users`, `/api/v2/users`): The version is embedded directly in the URL. This is the most common and most visible approach. It is easy to understand, easy to route at the API gateway level, and easy to document in [[API-Documentation]]. Downside: URLs change between versions, which can break bookmarks and cached references.

- **Header versioning** (e.g., `Accept: application/vnd.myapi.v2+json`): The version is specified in the HTTP request header via [[HTTP-Protocol]]. The URL stays the same across versions. This is more "RESTfully correct" but harder to test (you cannot just paste a URL into a browser) and harder for non-technical stakeholders to understand.

- **Query parameter versioning** (e.g., `/api/users?version=2`): The version is passed as a query parameter. This is simple to implement but considered less clean because query params are typically for filtering data, not controlling API behavior.

- **Semantic versioning in APIs**: Many teams follow SemVer (MAJOR.MINOR.PATCH) internally but only expose the MAJOR version externally (v1, v2). Minor and patch changes are expected to be backward-compatible. Breaking changes trigger a major version bump and a deprecation timeline for the old version.

- **When to version**: Not every change needs a new version. Additive changes (new optional fields, new endpoints) are generally backward-compatible. Removing fields, renaming fields, or changing data types are breaking changes that require a new version or a careful migration strategy.

## PM Implications
#pm-implication

- **Version proliferation creates maintenance burden**: Every active API version must be maintained, monitored, and supported. PMs must resist the temptation to create new versions for every change and instead design APIs that can evolve within a version. This directly impacts [[Technical-Debt]].

- **Partner communication is critical**: When a new version is released, PMs must coordinate communication to all API consumers -- internal teams, external partners, and third-party developers. This includes migration guides, deprecation timelines, and sometimes direct outreach to high-value integrators.

- **Versioning strategy affects DX**: URL versioning is PM-friendly because it is visible, testable, and easy to explain in product docs and sales conversations. Header versioning may be technically superior but creates friction in demos and partner onboarding. PMs should advocate for the strategy that best serves their developer audience.

- **Backward compatibility is a product commitment**: Choosing to support v1 while shipping v2 is a resource allocation decision. PMs must track what percentage of traffic still hits old versions and set data-driven sunset timelines within the [[API-Lifecycle]].

## Example

**Stripe's API versioning (global, used heavily in India)**: Stripe uses a date-based versioning approach (e.g., `2023-10-16`) instead of v1/v2. Each API key is pinned to the version active when the account was created, and developers can override the version per-request via a `Stripe-Version` header. When Stripe makes a breaking change, it creates a new dated version but keeps all previous versions working. Indian fintech companies like Razorpay have adopted a similar philosophy. This approach reduces the "big bang migration" problem -- developers upgrade at their own pace, and Stripe's [[API-Documentation]] shows a changelog with diffs between versions. For a PM, this is a masterclass in balancing innovation velocity with backward compatibility.

## Strategy Comparison

| Strategy | Visibility | Cacheability | Ease of Testing | RESTful Purity |
|---|---|---|---|---|
| **URL path** (`/v2/users`) | High | Excellent (distinct URLs) | Easy (browser/curl) | Moderate |
| **Header** (`Accept: vnd.v2`) | Low | Requires Vary header | Hard (needs tools) | High |
| **Query param** (`?v=2`) | Medium | Cache key includes param | Easy | Low |
| **Date-based** (`Stripe-Version`) | Medium | Per-request header | Moderate | Custom |

When choosing a strategy, PMs should consider who the primary API consumers are. External third-party developers generally prefer URL path versioning for its simplicity, while internal [[Microservices-Architecture]] communication may use header versioning for cleaner service-to-service contracts.

## Related Concepts

- [[REST-API]]
- [[API-Lifecycle]]
- [[API-Documentation]]
- [[Technical-Debt]]
- [[HTTP-Protocol]]
- [[Session-04-APIs-Integrations]]
