---
title: Error Tracking
aliases:
  - Error Monitoring
  - Crash Reporting
  - Sentry
  - Bug Tracking Tools
tags:
  - pm2
  - devops
  - monitoring
  - web-fundamentals
  - quality
category: DevOps & Monitoring
---

## Definition
#definition

Error Tracking refers to the practice and tooling used to detect, aggregate, and diagnose software errors in production environments in real time. Tools like Sentry, Bugsnag, Rollbar, and Crashlytics capture unhandled exceptions, stack traces, user context, and breadcrumbs (sequence of events leading to the error) and present them in a dashboard for engineering teams to triage and fix. Error tracking is a specialized subset of [[Monitoring]] that focuses specifically on application-level failures rather than infrastructure metrics.

## How It Works

- **SDK integration**: Error tracking tools provide lightweight SDKs for every major platform ([[Frontend-Frameworks]], [[Backend-Languages]], mobile apps). The SDK is initialized with a project key and automatically captures unhandled exceptions, promise rejections (in JavaScript/[[TypeScript]]), and crashes. It sends error data (stack trace, environment, user info, device info) to the tracking service.

- **Error aggregation and deduplication**: When the same error occurs thousands of times (e.g., a null pointer exception on a product page), the tool groups them into a single "issue" with a count, affected user count, and first/last occurrence. This prevents the team from being overwhelmed by duplicate reports and helps PMs understand the blast radius of a bug.

- **Breadcrumbs and context**: Modern error trackers capture a trail of user actions (clicks, page navigations, [[REST-API]] calls, console logs) leading up to the error. This context is invaluable for reproducing bugs that are environment-specific. For example, Sentry might show: user searched for "biryani" -> clicked restaurant -> API call to /menu returned 500 -> crash.

- **Release tracking**: Error tracking tools integrate with [[CI-CD]] pipelines to associate errors with specific code releases. When a new deployment introduces a spike in errors, the tool can automatically flag the release as problematic and even link to the specific commit in [[GitHub]] that caused the regression.

- **Alerting and workflow integration**: Tools like Sentry integrate with Slack, PagerDuty, Jira, and Linear to route error alerts to the right team. Alert rules can be configured by error volume, affected user count, or error type (e.g., payment failures trigger immediate alerts, UI rendering issues are batched into daily digests).

## PM Implications
#pm-implication

- **Error rates are a product quality metric**: PMs should track crash-free session rates (target: 99.5%+ for mobile apps, 99.9%+ for web) and error rates per release. A new feature that increases the crash rate is not ready for full rollout, regardless of how well it performs in A/B tests. Error tracking data should feed into [[Feature-Flags]] rollout decisions.

- **Prioritize errors by user impact, not frequency**: An error that affects 100 users at checkout (revenue impact) is more important than one affecting 10,000 users on a rarely-used settings page. PMs should work with engineering to set up error tracking dashboards that weight errors by business impact -- connecting error data to [[Monitoring]] of business metrics.

- **Error tracking enables data-driven bug triage**: Instead of relying on user-reported bugs (which skew toward vocal users and edge cases), error tracking provides an objective, comprehensive view of production issues. PMs can use this data in sprint planning to balance new features against reliability improvements ([[Technical-Debt]]).

- **Post-incident reviews depend on error data**: When a production incident occurs (e.g., checkout failures during a sale), the error tracking timeline is the primary forensic tool. PMs leading post-incident reviews should be able to read Sentry dashboards to understand what broke, when, how many users were affected, and which release introduced the regression.

## Example

**Swiggy's error tracking during peak hours (India context)**: Swiggy processes millions of orders during peak dinner hours (7-10 PM IST), and their error tracking setup is critical to maintaining reliability at scale. Their engineering team uses Sentry integrated with their React Native mobile app and Node.js [[Backend-Languages]] services. During a Big Sale event, when traffic spikes 5-10x, Sentry dashboards become the war-room screen. In one notable incident, a [[REST-API]] endpoint for restaurant menu fetching started returning 500 errors due to a database connection pool exhaustion ([[Database-Scaling]] issue). Sentry captured the stack trace, showed the error started exactly 3 minutes after a new deployment (identified via release tracking integrated with their [[CI-CD]] pipeline), and the breadcrumbs showed it only affected users in Bangalore (region-specific routing issue). The PM and engineering lead used this data to make a rapid decision: roll back the deployment via their [[Deployment-Pipeline]] rather than attempt a hotfix under pressure. The entire detection-to-rollback cycle took 8 minutes, compared to 45+ minutes in the pre-Sentry era when they relied on user complaints reaching customer support.

## Error Tracking Tools Comparison

| Tool | Best For | Key Differentiator |
|---|---|---|
| **Sentry** | Full-stack web and mobile | Open-source option, deep [[Frontend-Frameworks]] integration |
| **Bugsnag** | Mobile-first products | Stability scores, release health dashboards |
| **Crashlytics** (Firebase) | Android/iOS apps | Free, deep Google/Firebase integration |
| **Rollbar** | [[CI-CD]] pipeline integration | Auto-deploy tracking, real-time code fixes |
| **Datadog APM** | Infrastructure + application errors | Unified [[Monitoring]] platform (metrics + traces + errors) |

PMs should select error tracking tools based on their [[Tech-Stacks]] (mobile vs. web vs. backend), team size (free tiers matter for startups), and integration needs (Slack alerts, Jira ticket creation, [[GitHub]] issue linking).

## Related Concepts

- [[Monitoring]]
- [[CI-CD]]
- [[Deployment-Pipeline]]
- [[Feature-Flags]]
- [[Technical-Debt]]
- [[Session-04-APIs-Integrations]]
