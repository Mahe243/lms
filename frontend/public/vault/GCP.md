---
title: GCP
aliases:
  - Google Cloud Platform
  - Google Cloud
tags:
  - pm2
  - cloud
  - infrastructure
  - google
  - data
category: Cloud Platforms
---

## Definition
#definition

**Google Cloud Platform (GCP)** is Google's [[Cloud-Computing]] offering, built on the same infrastructure that powers Google Search, YouTube, and Gmail. GCP is the third-largest cloud provider behind [[AWS]] and [[Azure]], but differentiates strongly in data analytics (BigQuery), machine learning (Vertex AI), and Kubernetes (which Google originally created). For PMs, GCP is particularly relevant when the product is data-intensive or ML-driven, as its data stack is often considered best-in-class.

## How It Works

- **Compute**: Google Compute Engine provides [[IaaS-PaaS-SaaS|IaaS]] VMs. Google App Engine offers [[IaaS-PaaS-SaaS|PaaS]] with automatic [[Auto-Scaling]]. Google Kubernetes Engine (GKE) is considered the gold standard for Kubernetes, given Google's authorship of K8s. Cloud Run offers a container-based [[Serverless-Computing]] option that sits between App Engine and GKE in complexity.

- **BigQuery**: A fully managed, serverless data warehouse that can scan terabytes in seconds using SQL. It separates storage and compute costs, making it cost-effective for analytics-heavy products. PMs working on [[Analytics-Instrumentation]] often push for BigQuery adoption. BigQuery ML even lets analysts train ML models using SQL, reducing the barrier for data-driven product decisions.

- **Vertex AI & ML**: GCP provides end-to-end ML tooling -- from AutoML (no-code model training) to custom model deployment. TensorFlow, created by Google, has first-class GCP integration. PMs building recommendation engines, search ranking, or fraud detection benefit from this ecosystem. Vertex AI's Model Garden provides pre-trained foundation models that PMs can evaluate for product features without ML engineering.

- **Data Stack Integration**: Cloud Pub/Sub (messaging), Dataflow (stream/batch processing), and Looker (BI) create a cohesive [[Data-Pipelines|data pipeline]] ecosystem. This tight integration reduces the "glue code" engineering teams must write. For [[ETL]] workloads, Dataflow's Apache Beam-based processing handles both batch and streaming with the same code.

- **India Regions**: GCP has two India regions -- Mumbai (asia-south1) and Delhi (asia-south2). Both support data residency requirements and provide low-latency access for Indian users. Google's private fiber network between regions provides faster cross-region replication compared to public internet connections. See [[Session-09-Cloud-Deployment]].

## PM Implications
#pm-implication

- **Data-First Product Decisions**: If your product's competitive advantage is in data analytics or ML (e.g., personalization, demand forecasting), GCP's BigQuery + Vertex AI stack can accelerate time-to-market. PMs should evaluate whether GCP's data tools justify choosing it over [[AWS]] or [[Azure]] for the entire stack. The answer is often yes for startups where data is the product moat.

- **Kubernetes Expertise**: GKE's maturity means faster container deployments and better [[Auto-Scaling]] defaults. PMs whose engineering teams already use Kubernetes will find GCP's implementation the smoothest, affecting sprint velocity and [[Deployment-Pipeline]] reliability. GKE Autopilot further reduces operational overhead by managing the nodes automatically.

- **Pricing Model**: GCP offers sustained-use discounts (automatic discounts for running instances over 25% of the month) and committed-use discounts. Its [[Cloud-Billing]] model can be more transparent than [[AWS]]'s for compute-heavy workloads. GCP's per-second billing (vs. per-hour on some AWS services) benefits workloads with variable runtimes.

- **Smaller Enterprise Footprint**: GCP has less enterprise market share than [[AWS]] or [[Azure]], which means fewer pre-built integrations with legacy enterprise tools. PMs in B2B should assess whether target customers' IT teams are comfortable with GCP. However, for startups and digital-native companies, GCP's developer experience often wins.

## Key GCP Services PMs Should Know

| Service | Purpose | PM Relevance |
|---------|---------|--------------|
| BigQuery | Serverless data warehouse | Analytics queries on massive datasets |
| Vertex AI | ML platform | Build and deploy prediction models |
| GKE | Kubernetes engine | Container orchestration for microservices |
| Cloud Run | [[Serverless-Computing\|Serverless]] containers | Deploy containers without managing clusters |
| Cloud Pub/Sub | Messaging | Event-driven architectures, real-time data |
| Looker | BI and dashboards | PM-facing analytics and reporting |

## Example

**Swiggy's Data Platform**: Swiggy, India's food delivery platform, leverages GCP extensively for its data-driven operations.

BigQuery powers their analytics warehouse where PMs track metrics like average delivery time, restaurant ratings, and order conversion funnels. Vertex AI helps build demand forecasting models that predict order volumes by area and time slot -- directly informing the PM's decisions about delivery fleet allocation and restaurant onboarding priorities.

The PM doesn't need to understand the ML model internals but must define the prediction targets (what to forecast) and success metrics (forecast accuracy vs. actual orders). Cloud Pub/Sub handles the real-time event stream from millions of app interactions, feeding into Dataflow for real-time [[ETL]] that powers the live "orders in progress" dashboard the PM reviews every morning.

The total GCP spend is a [[Cloud-Billing]] line item the PM co-owns, justifying it against the revenue lift from better demand prediction.

## Related Concepts

- [[AWS]] -- largest cloud provider, primary GCP competitor
- [[Azure]] -- Microsoft's cloud, strong in enterprise
- [[Cloud-Computing]] -- foundational cloud concepts
- [[IaaS-PaaS-SaaS]] -- GCP's service model layers
- [[Auto-Scaling]] -- GCP's autoscaler and managed instance groups
- [[Cloud-Billing]] -- GCP pricing and sustained-use discounts
- [[ETL]] -- data pipelines on GCP Dataflow
- [[Session-09-Cloud-Deployment]] -- deploying on GCP regions
