---
title: Serverless Computing
aliases:
  - Serverless
  - FaaS
  - Functions-as-a-Service
  - Lambda Functions
tags:
  - pm2
  - cloud
  - serverless
  - infrastructure
  - scaling
category: Cloud Infrastructure
---

## Definition
#definition

**Serverless Computing** is a [[Cloud-Computing]] execution model where the cloud provider dynamically manages server allocation and scaling. Despite the name, servers still exist -- you just never provision, patch, or manage them. The dominant pattern is **Functions-as-a-Service (FaaS)**: you deploy individual functions that execute in response to events (HTTP requests, database changes, file uploads, scheduled timers). For PMs, serverless means faster feature shipping, zero idle costs, and automatic [[Auto-Scaling]] -- but with trade-offs in control and cold-start latency.

## How It Works

- **Event-Driven Execution**: A serverless function runs only when triggered. Triggers include API Gateway requests (user hits an endpoint), queue messages, database change streams, file uploads to storage, or cron schedules. The function executes, returns a result, and the environment is recycled. This model naturally decomposes backends into small, focused units of work.

- **Provider Implementations**: [[AWS]] Lambda (the pioneer, launched 2014), [[Azure]] Functions, and [[GCP]] Cloud Functions are the big three. Each supports multiple languages (Node.js, Python, Java, Go) and integrates with its provider's ecosystem -- Lambda with API Gateway and DynamoDB, Azure Functions with Event Grid, Cloud Functions with Pub/Sub. Container-based serverless (AWS Fargate, GCP Cloud Run) extends the model to any container image.

- **Cold Starts**: When a function hasn't been invoked recently, the provider must spin up a new execution environment (load code, initialize runtime). This "cold start" adds 100ms to 3 seconds of latency depending on language and package size. Java and .NET have the worst cold starts; Python and Node.js are faster. Provisioned concurrency (pre-warming) eliminates this at extra cost.

- **Pricing**: You pay per invocation (e.g., $0.20 per million requests on Lambda) plus compute duration (measured in GB-seconds). A function that runs 128MB for 200ms costs fractions of a cent. Zero invocations = zero cost, unlike VMs that run 24/7. This maps to [[Cloud-Billing]] models elegantly for variable-traffic workloads. The free tier on Lambda (1 million requests/month) is enough for many MVP-stage products.

- **Limitations**: Function execution time is capped (15 minutes on Lambda, 10 minutes on Cloud Functions). Functions are stateless -- any persistent data must go to external stores like [[Redis]], [[PostgreSQL]], or S3. Payload size limits (6MB synchronous on Lambda) and concurrency limits (1,000 default) shape what workloads fit the serverless model. Long-running tasks like video transcoding need a queue + function pattern or containers.

## PM Implications
#pm-implication

- **Speed to Market**: Serverless removes infrastructure setup from the development cycle. An engineer can deploy a new API endpoint in hours, not days. PMs building MVPs or testing new features benefit from this velocity -- you can ship a webhook handler, a notification service, or an image resizer without a DevOps sprint. This is particularly valuable for internal tools and experiments where speed matters more than optimization.

- **Cost Efficiency for Variable Traffic**: Products with unpredictable or spiky traffic patterns benefit most. A serverless notification service that handles 1,000 pushes during a sale and 10 pushes at 3 AM costs almost nothing at 3 AM. Compare this to a VM running 24/7 at the same cost regardless of load. See [[Cloud-Billing]]. PMs should model break-even points: at sustained high traffic, serverless can become more expensive than dedicated servers.

- **Architectural Complexity Trade-off**: Serverless fragments your backend into many small functions, making the system harder to reason about as a whole. PMs should be aware that while individual features ship faster, the overall system's [[Monitoring-Observability|observability]] and debugging become more complex. Distributed tracing becomes essential. A product with 200 Lambda functions has 200 deployment units to version, monitor, and secure.

- **Vendor Lock-in Risk**: Lambda functions deeply integrated with API Gateway, SQS, and DynamoDB are hard to migrate to [[Azure]] or [[GCP]]. PMs should discuss with engineering whether the speed advantage justifies the lock-in, especially for core business logic vs. peripheral services. A practical heuristic: use serverless for "plumbing" (notifications, image processing, webhooks) and containers for core domain logic.

## When to Use Serverless (PM Decision Guide)

| Use Case | Serverless Fit | Why |
|----------|---------------|-----|
| Webhook handlers | Excellent | Spiky, event-driven, low latency needs |
| Image/file processing | Excellent | Triggered by uploads, parallelizable |
| Scheduled tasks (cron) | Good | Runs periodically, no idle cost |
| Notification dispatch | Excellent | Highly variable volume |
| API for MVP | Good | Fast to deploy, scales automatically |
| Real-time chat backend | Poor | Persistent connections needed |
| Long-running ML inference | Poor | Execution time limits |
| Core payment processing | Moderate | Cold starts may affect UX |

## Example

**CRED's Reward Notification System**: CRED, the Indian fintech app, uses [[AWS]] Lambda for its reward notification pipeline.

When a user pays a credit card bill, a Lambda function is triggered that calculates cashback/reward points, another function generates the personalized push notification content, and a third function dispatches it via Firebase Cloud Messaging.

During month-end bill payment surges, this pipeline [[Auto-Scaling|auto-scales]] from handling 100 notifications/minute to 50,000/minute without any capacity planning. The PM chose serverless here because notification volume is inherently spiky (90% of volume in the last 5 days of the month), making always-on servers wasteful.

The total Lambda cost for notifications runs under Rs 15,000/month -- a fraction of what dedicated servers would cost. Cold starts are acceptable here because a 200ms delay in a push notification is imperceptible to users, unlike a checkout flow where the same delay would hurt conversion.

## Related Concepts

- [[Cloud-Computing]] -- the platform enabling serverless
- [[IaaS-PaaS-SaaS]] -- serverless as a layer beyond PaaS
- [[Auto-Scaling]] -- serverless provides automatic, granular scaling
- [[AWS]] -- AWS Lambda, the dominant FaaS platform
- [[Azure]] -- Azure Functions
- [[GCP]] -- Google Cloud Functions and Cloud Run
- [[Cloud-Billing]] -- pay-per-invocation pricing model
- [[Monitoring-Observability]] -- tracing across serverless functions
- [[Session-09-Cloud-Deployment]] -- deploying serverless architectures
