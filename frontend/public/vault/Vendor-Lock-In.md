---
title: Vendor Lock-In
aliases:
  - Platform Lock-In
  - Cloud Lock-In
  - Technology Lock-In
tags:
  - pm2
  - cloud
  - strategy
  - risk-management
  - architecture
category: Strategy & Risk
---

## Definition
#definition

Vendor Lock-In is the situation where a product or organization becomes so dependent on a specific vendor's technology, platform, or services that switching to an alternative becomes prohibitively expensive, time-consuming, or technically complex. In [[Cloud-Computing]], this commonly manifests as deep reliance on proprietary services from AWS, GCP, or Azure. For PMs, vendor lock-in is a strategic risk that affects long-term flexibility, negotiating leverage, cost control, and the [[Build-vs-Buy]] calculus.

## How It Works

- **Proprietary services create dependency**: When a team builds on AWS Lambda (serverless), DynamoDB (database), SQS (messaging), and S3 (storage) using AWS-specific SDKs and configurations, migrating to GCP or Azure requires rewriting significant portions of the application. Each proprietary service used deepens the lock-in. The equivalent is true for any cloud provider's exclusive services.

- **Data gravity**: Once large volumes of data accumulate in a vendor's ecosystem (e.g., petabytes in BigQuery or Snowflake), the cost and time to migrate that data becomes a major barrier. Data gravity also affects [[Database-Scaling]] decisions -- moving a sharded database across clouds is one of the hardest migrations.

- **Contractual and pricing lock-in**: Multi-year committed-use discounts (AWS Reserved Instances, GCP Committed Use Contracts) offer 30-60% savings but lock the organization into that vendor financially. If the PM's product pivots and needs different infrastructure, the commitment becomes sunk cost.

- **API and integration lock-in**: Building a product on a vendor's [[REST-API]] (e.g., Twilio for SMS, Stripe for payments, Google Maps for geolocation) creates functional dependency. If that vendor changes pricing, deprecates features (see [[API-Lifecycle]]), or degrades quality, the switching cost is the engineering effort to re-integrate with a competitor.

- **Mitigation strategies**: Teams reduce lock-in by using open standards (Kubernetes for container orchestration instead of ECS), abstraction layers (Terraform for multi-cloud infrastructure as code), portable databases (PostgreSQL instead of Aurora-specific features), and maintaining [[Design-Patterns]] like the Repository and Strategy patterns that isolate vendor-specific code.

## PM Implications
#pm-implication

- **Lock-in is a spectrum, not a binary**: Some lock-in is acceptable and even beneficial (managed services save engineering time). PMs must evaluate lock-in on a case-by-case basis: using S3 for object storage is low-risk (easy to migrate), while building core business logic on AWS Step Functions is high-risk. The framework is: how hard would it be to switch, and what triggers would force a switch?

- **Negotiating leverage diminishes with lock-in**: When renewal time comes for an enterprise cloud contract, deeply locked-in customers have limited bargaining power. PMs involved in vendor negotiations should maintain credible alternatives (even proof-of-concept deployments on a second cloud) to strengthen negotiating position. This connects to [[IaaS-PaaS-SaaS]] tier decisions.

- **Lock-in affects M&A and partnerships**: If a potential acquirer uses GCP and the target company is deeply locked into AWS, the post-merger integration cost is significant. PMs at startups should consider how their cloud choices affect exit strategy.

- **Multi-cloud is expensive but sometimes necessary**: Running on multiple clouds simultaneously avoids lock-in but dramatically increases operational complexity, [[DevOps]] overhead, and cost. PMs must balance the insurance value of multi-cloud against the productivity cost. Most startups should accept single-cloud lock-in and invest mitigation effort only in the highest-risk dependencies.

## Example

**IRCTC and vendor dependency (India context)**: India's IRCTC (Indian Railway Catering and Tourism Corporation) historically operated its ticket booking platform on infrastructure provided by a single vendor, CRIS (Centre for Railway Information Systems). When the platform struggled under massive load during Tatkal booking hours (10 AM rush for last-minute tickets), IRCTC had limited ability to rapidly scale or switch providers because of deep integration lock-in with CRIS's proprietary systems. IRCTC eventually partnered with [[Cloud-Computing]] providers (moving parts of the system to AWS) and introduced CDN-based ([[CDN]]) static content delivery to reduce load. A more recent India example: many Indian SaaS startups that built exclusively on AWS Mumbai region faced a strategic question when Jio launched its own cloud platform (JioCloud) with competitive pricing for Indian enterprises. Startups deeply locked into AWS-specific services (Lambda, Aurora, Kinesis) could not credibly evaluate JioCloud, while those using portable technologies like Kubernetes and PostgreSQL could pilot a migration. This illustrates how lock-in narrows strategic optionality for PMs.

## Lock-In Risk Assessment Framework

PMs can use this simple matrix to evaluate vendor dependency for any technology decision:

| Factor | Low Risk | High Risk |
|---|---|---|
| **Data portability** | Standard formats (CSV, SQL dump) | Proprietary formats, no export API |
| **API standards** | Open standards ([[REST-API]], OpenAPI) | Vendor-specific SDKs only |
| **Infrastructure** | Containers (Kubernetes) | Proprietary serverless (Lambda, Cloud Functions) |
| **Contracts** | Month-to-month, pay-as-you-go | Multi-year committed use, minimum spend |
| **Alternatives** | Multiple viable competitors | Sole supplier or monopoly position |
| **Migration effort** | Weeks (abstraction layers in place) | Months-to-years (deep integration) |

When the assessment shows high risk across multiple factors, PMs should negotiate contractual protections (data export SLAs, price caps) and invest in abstraction layers in the [[Tech-Stacks]].

## Related Concepts

- [[Cloud-Computing]]
- [[Build-vs-Buy]]
- [[IaaS-PaaS-SaaS]]
- [[DevOps]]
- [[Design-Patterns]]
- [[Session-04-APIs-Integrations]]
