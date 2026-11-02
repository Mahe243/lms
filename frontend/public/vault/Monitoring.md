---
title: Monitoring
aliases:
  - System Monitoring
  - Infrastructure Monitoring
  - Application Monitoring
tags:
  - pm2
  - monitoring
  - devops
  - infrastructure
  - reliability
category: DevOps & Operations
---

## Definition
#definition

**Monitoring** is the practice of collecting, analyzing, and alerting on system health data -- metrics like CPU usage, memory, response time, error rates, and throughput -- to ensure a product is running correctly. Monitoring tools provide dashboards and alerting systems that notify teams when something breaks or degrades before users notice. For PMs, monitoring is the bridge between "we shipped it" and "it actually works for users," and understanding monitoring data helps PMs prioritize reliability investments versus new feature development.

## How It Works

- **Metrics Collection**: Agents or exporters installed on servers, containers, and application code collect time-series data: CPU %, memory usage, request latency (p50, p95, p99), HTTP error rates (4xx, 5xx), and custom business metrics (orders/minute, signups/hour). These flow into a central monitoring platform. The distinction between p50 (median) and p99 (worst 1%) latency is critical -- a product can feel fast for most users (p50 = 100ms) while being painfully slow for 1% (p99 = 5s).

- **Popular Tools**: **Datadog** is the market leader for full-stack monitoring (infrastructure + APM + logs). **New Relic** excels at application performance monitoring (APM). **Grafana** + **Prometheus** is the dominant open-source stack -- Prometheus scrapes metrics, Grafana visualizes them. [[AWS]] CloudWatch, [[Azure]] Monitor, and [[GCP]] Cloud Monitoring are native cloud options. Most teams use a combination: cloud-native for infrastructure basics and a dedicated tool for application-level insights.

- **Dashboards**: Teams build dashboards showing real-time system state. A typical PM-facing dashboard might show: active users, API response time (p95), error rate, successful transactions/minute, and [[Uptime]] percentage. Engineering dashboards go deeper into CPU, memory, disk I/O, and network. Good teams maintain separate dashboards for different audiences -- the PM does not need to see JVM garbage collection stats.

- **Alerting**: Rules trigger notifications when metrics breach thresholds. "Alert the on-call engineer via PagerDuty when p95 latency exceeds 2 seconds for 5 minutes." Alerts should be actionable -- each alert should have a runbook explaining what to check and how to resolve it. Alert fatigue (too many low-priority alerts) is a real problem that PMs can help prioritize by defining which degradations genuinely impact users.

- **Synthetic Monitoring**: Automated scripts simulate user actions (login, search, checkout) from multiple geographic locations every few minutes. If synthetic tests fail, the team knows about issues before real users report them. Tools like Pingdom, UptimeRobot, or Datadog Synthetics handle this. This is especially valuable for catching region-specific issues -- e.g., a CDN problem affecting only Chennai users.

## PM Implications
#pm-implication

- **Feature Health Ownership**: After launching a feature, PMs should monitor its adoption and reliability metrics for the first 1-2 weeks. A feature with high error rates or slow performance will see low adoption regardless of how well-designed it is. Monitoring data helps PMs decide whether to invest in bug fixes or feature iteration. See [[Session-10-Cloud-Going-Live]]. A PM who never looks at monitoring data after launch is flying blind.

- **SLA Definition**: PMs define [[Uptime]] SLAs (e.g., 99.9% availability) that drive monitoring thresholds and [[Incident-Response]] processes. The monitoring system is what enforces these SLAs by catching violations before they compound. Without monitoring, an SLA is just a promise with no mechanism for keeping it.

- **Data-Driven Prioritization**: Monitoring data reveals which parts of the system are fragile. If the payments service triggers 5 alerts/week but the search service triggers 0, the PM can prioritize payments reliability in the next sprint -- using hard data instead of anecdotes. This evidence-based approach transforms reliability from a vague "tech debt" bucket into prioritized, impact-ranked work items.

- **Cost of Monitoring**: Enterprise monitoring tools (Datadog, New Relic) can cost $15-30 per host per month. At scale (500+ servers), this becomes a significant line item in [[Cloud-Billing]]. PMs should understand monitoring costs and help engineering choose the right tier -- full APM on critical services, basic metrics on development environments.

## Key Metrics Every PM Should Track

These metrics should be on every PM's monitoring dashboard:

- **Availability / [[Uptime]]** -- Is the product up? (target: 99.9%+)
- **p95 Latency** -- How fast for 95% of users? (target depends on product)
- **Error Rate** -- What percentage of requests fail? (target: <0.1%)
- **Throughput** -- How many requests/transactions per minute?
- **Apdex Score** -- User satisfaction score combining latency + errors (0.0-1.0)
- **Business Metrics** -- Orders/minute, signups/hour, conversion rate (custom per product)

See [[Monitoring-Observability]] for deeper diagnostic capabilities beyond these surface-level metrics.

## Example

**PhonePe's Transaction Monitoring**: PhonePe, India's leading UPI payments app, processes over 5 billion transactions monthly. Their monitoring stack uses a combination of Prometheus + Grafana for infrastructure metrics and custom-built dashboards for business metrics.

The PM dashboard shows real-time transaction success rate (target: >99.5%), average payment completion time (target: <3 seconds), and bank-wise failure rates. When a specific bank's API starts returning errors above 5%, an alert fires and the [[Incident-Response]] process kicks in -- the PM is notified alongside engineering because bank relationship escalation is a PM responsibility.

The PM uses weekly monitoring reports to identify which bank integrations need engineering attention and feeds this into quarterly planning -- directly tying [[Monitoring-Observability|observability]] data to roadmap decisions. A single percentage point improvement in transaction success rate translates to millions of additional successful payments per month.

## Related Concepts

- [[DevOps]] -- monitoring as a core DevOps practice
- [[Deployment-Pipeline]] -- monitoring validates deployments
- [[Uptime]] -- SLAs and availability that monitoring enforces
- [[Monitoring-Observability]] -- the deeper practice beyond basic monitoring
- [[Incident-Response]] -- what happens when monitoring detects issues
- [[Cloud-Billing]] -- monitoring tool costs at scale
- [[Auto-Scaling]] -- monitoring metrics trigger scaling decisions
- [[Session-10-Cloud-Going-Live]] -- monitoring strategies for production systems
