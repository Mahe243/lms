---
title: Uptime
aliases:
  - Availability
  - SLA
  - Service Level Agreement
  - Nines of Availability
tags:
  - pm2
  - reliability
  - monitoring
  - cloud
  - infrastructure
category: DevOps & Operations
---

## Definition
#definition

**Uptime** is the percentage of time a system is operational and accessible to users. It is typically expressed as "nines of availability" -- 99.9% ("three nines") means 8.7 hours of allowable downtime per year, while 99.99% ("four nines") allows only 52 minutes. Uptime commitments are formalized in **Service Level Agreements (SLAs)** that define penalties (usually service credits) when the provider fails to meet the target. For PMs, uptime is a product requirement that directly affects user trust, contractual obligations, and the engineering investment required to maintain it.

## How It Works

- **The Nines Table**: Each additional nine dramatically reduces allowable downtime. 99% = 3.65 days/year. 99.9% = 8.76 hours/year. 99.99% = 52.6 minutes/year. 99.999% = 5.26 minutes/year. Each additional nine roughly requires 10x more engineering investment in redundancy, [[Monitoring]], and [[Incident-Response]]. Most consumer products target 99.9%; payment systems and healthcare target 99.99% or higher.

- **SLA vs. SLO vs. SLI**: An **SLI** (Service Level Indicator) is the measured metric (e.g., "successful requests / total requests"). An **SLO** (Service Level Objective) is the internal target (e.g., "99.95% success rate"). An **SLA** is the external contractual commitment (e.g., "99.9% or we credit your account"). Smart teams set SLOs stricter than SLAs to create a buffer -- the SLO acts as an early warning before the SLA is breached.

- **Error Budgets**: If your SLO is 99.9%, you have a 0.1% error budget -- roughly 43 minutes of downtime per month. Teams can "spend" this budget on risky deployments or experiments. When the budget is exhausted, the team freezes feature releases and focuses on reliability. This framework, popularized by Google's SRE practices, helps PMs balance velocity and stability with a concrete, quantitative mechanism rather than gut feel.

- **Downtime Categories**: Planned downtime (maintenance windows, [[Schema-Migration|migrations]]) vs. unplanned downtime ([[Incident-Response|incidents]]). Some SLAs exclude planned maintenance; others include everything. PMs must clarify which definition the SLA uses during contract negotiation. Modern architectures aim for zero-downtime deployments so that planned maintenance is invisible to users.

- **Redundancy & Failover**: Achieving high uptime requires redundant components: multiple availability zones, database replicas, load balancers, and automated failover. [[Cloud-Computing]] providers like [[AWS]], [[Azure]], and [[GCP]] offer multi-AZ and multi-region architectures that make high availability achievable but increase [[Cloud-Billing|costs]]. A multi-AZ deployment might cost 2x a single-AZ setup; multi-region can cost 3-5x.

## PM Implications
#pm-implication

- **Revenue Impact**: For transactional products, downtime has a direct revenue cost. If your e-commerce platform processes Rs 10 crore/day and goes down for 1 hour, you lose roughly Rs 42 lakh in potential revenue -- plus brand damage and customer churn that compound over time. PMs must quantify this to justify reliability investments to leadership with concrete ROI calculations.

- **Competitive Differentiation**: In B2B SaaS, uptime SLAs are a sales tool. Offering 99.99% when competitors offer 99.9% can win enterprise deals -- but only if your engineering team can actually deliver it. PMs must ensure the SLA offered matches actual capability, not aspirational targets. Over-promising uptime and under-delivering destroys customer trust faster than almost any other failure.

- **Error Budget Governance**: PMs play a crucial role in error budget decisions. If the team has used 80% of the month's error budget by day 15, the PM might pause a risky feature launch. Conversely, if the budget is barely touched, the PM can push for more aggressive feature experiments. This quantifies the reliability-vs-velocity trade-off that teams otherwise argue about subjectively.

- **Uptime Reporting & Communication**: Enterprise customers expect monthly uptime reports. PMs should ensure [[Monitoring]] tools generate these automatically and that the team has a clear process for communicating downtime incidents to customers -- both real-time (status pages like Statuspage.io) and post-incident (blameless postmortems). Transparency during outages builds trust even when SLAs are missed.

## The Nines Table (Quick Reference)

| Availability | Downtime/Year | Downtime/Month | Typical Use Case |
|-------------|---------------|----------------|------------------|
| 99% ("two nines") | 3.65 days | 7.3 hours | Internal tools |
| 99.9% ("three nines") | 8.76 hours | 43.8 minutes | Most SaaS products |
| 99.99% ("four nines") | 52.6 minutes | 4.38 minutes | Payments, healthcare |
| 99.999% ("five nines") | 5.26 minutes | 26.3 seconds | Telecom, critical infra |

Each additional nine roughly costs 10x more in engineering effort, redundancy, and [[Cloud-Billing|infrastructure spend]].

## Example

**Freshworks' SaaS Uptime Strategy**: Freshworks, the Chennai-based SaaS company (Freshdesk, Freshsales), commits to 99.9% uptime in their enterprise SLAs across their product suite.

Their PM team co-owns the error budget framework: each product squad gets a monthly error budget based on their SLO (internal target is 99.95%, stricter than the external SLA of 99.9%).

When Freshdesk's customer-facing support portal consumed 70% of its error budget in the first week of a month due to a bad deployment, the PM halted all feature releases for that sprint and redirected the team to build better [[Deployment-Pipeline|canary deployments]] and automated rollback.

The PM presented the math to stakeholders: the 0.05% buffer between SLO and SLA had saved them from paying SLA credits to 200+ enterprise customers, which would have cost approximately $50,000 in service credits. This incident led to a company-wide policy: every squad must keep at least 30% of their error budget in reserve at all times, a rule the PM team now enforces through [[Monitoring-Observability|observability]] dashboards.

## Related Concepts

- [[Monitoring]] -- the tooling that measures and enforces uptime
- [[Cloud-Computing]] -- cloud architecture enabling high availability
- [[Incident-Response]] -- processes triggered when uptime is threatened
- [[Monitoring-Observability]] -- diagnosing the root cause of downtime
- [[Auto-Scaling]] -- maintaining uptime during traffic spikes
- [[Deployment-Pipeline]] -- deployment strategies that protect uptime
- [[Session-10-Cloud-Going-Live]] -- uptime targets for production launch
