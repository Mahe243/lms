---
title: Cloud Billing
aliases:
  - Cloud Costs
  - Cloud Pricing
  - Cloud Cost Optimization
  - FinOps
tags:
  - pm2
  - cloud
  - billing
  - infrastructure
  - cost-optimization
category: Cloud Infrastructure
---

## Definition
#definition

**Cloud Billing** refers to the pricing models, cost tracking, and optimization strategies for [[Cloud-Computing]] services. Unlike traditional IT where you buy servers upfront (CapEx), cloud follows a pay-as-you-go model (OpEx) where you pay for what you consume -- compute hours, storage gigabytes, API calls, and data transfer. For PMs, understanding cloud billing is essential because infrastructure costs directly impact unit economics, product margins, and pricing decisions.

## How It Works

- **Pricing Models**: Cloud providers offer multiple pricing tiers. On-demand (pay-per-hour/second) is flexible but expensive. Reserved Instances ([[AWS]]) or Committed Use Discounts ([[GCP]]) offer 30-72% savings for 1-3 year commitments. Spot/Preemptible instances offer up to 90% discounts but can be terminated with short notice -- suitable only for fault-tolerant batch jobs like [[ETL]] pipelines or batch image processing.

- **Cost Dimensions**: A typical cloud bill includes compute (VMs, containers, [[Serverless-Computing|functions]]), storage (block, object, database), networking (data transfer out, load balancers, CDN), and managed services (databases, queues, AI APIs). Data transfer between regions or out to the internet is often the most surprising cost -- a "data transfer tax" that catches teams off-guard when they first review bills.

- **Billing Tools**: [[AWS]] Cost Explorer, [[Azure]] Cost Management, and [[GCP]] Billing Reports provide dashboards. Third-party tools like CloudHealth, Spot.io, and Infracost offer cross-cloud visibility. Engineering teams set budgets and alerts to catch runaway costs before they spiral. A common practice is setting alerts at 50%, 80%, and 100% of monthly budget to provide early warning.

- **Right-Sizing**: [[Monitoring]] data reveals over-provisioned resources -- a VM running at 10% CPU average is wasting 90% of its cost. Right-sizing means matching instance types and sizes to actual workload needs, often saving 30-40% without performance impact. [[AWS]] Compute Optimizer and [[GCP]] Recommender provide automated right-sizing suggestions.

- **Cost Allocation**: Tags and labels on cloud resources let teams attribute costs to specific products, features, or teams. This enables PMs to understand the infrastructure cost per feature and make informed build-vs-buy decisions. Without tagging discipline, cloud bills become an opaque shared cost that nobody owns.

## PM Implications
#pm-implication

- **Unit Economics**: Cloud costs are a variable cost in your product's unit economics. A PM must understand the infrastructure cost per user or per transaction. If each API call costs $0.001 in compute and you charge $0.01, your gross margin on that call is 90%. If a new feature doubles compute per call, margin drops to 80% -- the PM needs to know this before launch. At scale, even small per-unit costs compound significantly.

- **Build vs. Buy Decisions**: Managed services (e.g., [[AWS]] RDS vs. self-managed [[PostgreSQL]]) cost more in cloud billing but less in engineering time. PMs should evaluate total cost of ownership: a $500/month managed database that saves 20 hours/month of DevOps time at $100/hour is a net savings of $1,500/month. This calculation shifts as scale increases -- at very large scale, self-managed can become cheaper.

- **Budget Ownership**: Many organizations expect PMs to co-own infrastructure budgets for their product area. This means reviewing monthly cloud spend, justifying increases during roadmap planning, and working with engineering on cost optimization sprints when margins are under pressure. The emerging "FinOps" discipline formalizes this cross-functional cost governance.

- **Pricing Strategy Input**: If your product's pricing is usage-based (common in API products and developer tools), cloud costs directly constrain your pricing floor. PMs must model cloud cost curves at different usage levels to set profitable pricing tiers. See [[Session-10-Cloud-Going-Live]] for production cost planning. A common pitfall: pricing that looks profitable at 1,000 users but loses money at 100,000 users because cloud costs don't scale linearly.

## Cost Optimization Checklist for PMs

PMs should review these with engineering quarterly:

1. **Right-size instances** -- Are VMs over-provisioned? Check average CPU/memory via [[Monitoring]]
2. **Reserved capacity** -- Stable workloads should use Reserved Instances or Committed Use
3. **Spot/Preemptible for batch** -- [[ETL]] pipelines, test suites, and batch jobs can use cheap spot instances
4. **Storage tiering** -- Old data should move to cheaper tiers (S3 Glacier, Archive storage)
5. **Idle resources** -- Shut down dev/staging environments outside business hours
6. **Data transfer** -- Use CDNs and same-region deployment to minimize egress charges

## Example

**Razorpay's Cloud Cost Governance**: Razorpay, India's payment gateway, processes millions of transactions daily across [[AWS]] infrastructure. Their PM and engineering teams implemented a FinOps practice where each product squad (payments, banking, lending) has tagged cloud resources.

The payments PM can see that their service costs Rs 12 lakh/month, with 40% on compute ([[Auto-Scaling]] groups), 25% on [[PostgreSQL]] RDS databases, 20% on data transfer, and 15% on [[Redis]] ElastiCache.

When the PM proposed adding real-time fraud scoring (a compute-intensive feature), they modeled the incremental cloud cost at Rs 3 lakh/month and justified it against the Rs 50 lakh/month in fraud losses it would prevent -- a clear ROI case for the CFO.

The FinOps review also revealed that switching development environments from on-demand to spot instances saved Rs 2 lakh/month with zero impact on developer productivity, a quick win the PM championed.

## Related Concepts

- [[Cloud-Computing]] -- the platform whose costs are being managed
- [[AWS]] -- AWS-specific pricing and Cost Explorer
- [[Azure]] -- Azure pricing and Cost Management
- [[GCP]] -- GCP pricing and sustained-use discounts
- [[Auto-Scaling]] -- scaling decisions directly affect costs
- [[Serverless-Computing]] -- pay-per-invocation pricing model
- [[Monitoring]] -- resource utilization data for right-sizing
- [[Session-10-Cloud-Going-Live]] -- production cost planning
