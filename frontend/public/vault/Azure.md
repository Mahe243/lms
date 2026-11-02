---
title: Azure
aliases:
  - Microsoft Azure
  - Azure Cloud
tags:
  - pm2
  - cloud
  - infrastructure
  - azure
  - microsoft
category: Cloud Platforms
---

## Definition
#definition

**Microsoft Azure** is Microsoft's [[Cloud-Computing]] platform, offering 200+ services spanning compute, storage, databases, AI, DevOps, and IoT. It is the second-largest cloud provider globally behind [[AWS]], and holds a distinct advantage in enterprises already embedded in the Microsoft ecosystem (Office 365, Active Directory, Teams). For PMs, Azure matters because many large Indian enterprises and government projects default to Microsoft stacks, making Azure fluency essential when building B2B or government-facing products.

## How It Works

- **Compute & Hosting**: Azure Virtual Machines provide [[IaaS-PaaS-SaaS|IaaS]], while Azure App Service offers [[IaaS-PaaS-SaaS|PaaS]] for web applications. Azure Kubernetes Service (AKS) handles container orchestration similar to [[AWS]] EKS. For lightweight workloads, Azure Container Instances let you run containers without managing a cluster.

- **Serverless**: [[Serverless-Computing|Azure Functions]] lets you run event-driven code without managing servers. It integrates tightly with other Azure services like Event Grid and Service Bus. Azure Logic Apps provide no-code workflow automation that PMs can use to prototype integration flows before committing engineering resources.

- **Azure DevOps**: A complete CI/CD and project management suite (Boards, Repos, Pipelines, Artifacts, Test Plans). Many teams use Azure DevOps even when hosting on [[AWS]] or [[GCP]] because of its strong work-item tracking and sprint planning features. PMs often interact directly with Azure Boards for backlog management and sprint velocity tracking.

- **Data & AI**: Azure SQL Database, Cosmos DB (multi-model NoSQL), and Azure Synapse Analytics cover data needs. Azure Cognitive Services and Azure OpenAI Service provide pre-built AI capabilities that PMs can integrate without ML expertise. Cosmos DB's multi-region write capability is especially useful for products serving users across India and Southeast Asia simultaneously.

- **India Regions**: Azure operates three India regions -- Central India (Pune), South India (Chennai), and West India (Mumbai). This is critical for products requiring data residency compliance under India's data protection regulations. Azure was the first major cloud to open India data centers, giving it an early-mover advantage with Indian government contracts. See [[Session-09-Cloud-Deployment]] for deployment region considerations.

## PM Implications
#pm-implication

- **Enterprise Sales Advantage**: If your target customers run on Microsoft 365 or Active Directory, Azure integration becomes a selling point. PMs building B2B SaaS should understand Azure AD SSO and compliance certifications (ISO 27001, SOC 2) that enterprise procurement teams demand. Many Indian banks, insurance companies, and large manufacturers are Microsoft shops -- Azure fluency helps PMs speak their language.

- **Cost Management**: Azure's pricing model includes Pay-As-You-Go, Reserved Instances (1-3 year commitments for up to 72% savings), and Azure Hybrid Benefit (reuse existing Windows Server licenses). PMs must work with engineering to model [[Cloud-Billing]] scenarios during capacity planning. The Azure Pricing Calculator helps PMs estimate costs during feature scoping.

- **Vendor Lock-in Awareness**: Services like Cosmos DB and Azure Functions have proprietary APIs. PMs should weigh the speed of native integration against future portability -- a decision that affects long-term product architecture. Compare with [[AWS]] DynamoDB and [[GCP]] Firestore. A useful rule: use Azure-native for commodity services (VMs, storage) and evaluate portability for core business logic.

- **Government & Regulated Industries**: Azure Government and Azure's compliance portfolio make it the default choice for Indian government projects (e.g., DigiLocker, some Aadhaar integrations). PMs in govtech should understand Azure's sovereign cloud offerings. The Digital India initiative has several components running on Azure infrastructure, making it a familiar platform for government procurement officers.

## Key Azure Services PMs Should Know

| Service | Purpose | PM Relevance |
|---------|---------|--------------|
| Azure App Service | Web app hosting ([[IaaS-PaaS-SaaS\|PaaS]]) | Default for web product deployments |
| Azure Functions | [[Serverless-Computing]] | Event-driven features without infra overhead |
| Cosmos DB | Global NoSQL database | Multi-region products needing low latency |
| Azure DevOps | CI/CD + project management | PMs often use Boards directly for sprint tracking |
| Azure AD (Entra ID) | Identity & SSO | Enterprise SSO integration for B2B products |
| Azure Cognitive Services | Pre-built AI APIs | Vision, speech, language features without ML team |

## Example

**Infosys & Enterprise Azure Adoption**: Infosys, one of India's largest IT services companies, uses Azure extensively for both internal operations and client projects. Their internal collaboration runs on Microsoft 365 + Azure AD for 300,000+ employees.

For client projects, Infosys PMs routinely architect solutions on Azure when the client is a Microsoft-ecosystem enterprise. A recent example: an Indian insurance company's claims processing system was built on Azure App Service (web frontend), Azure Functions (document processing pipeline for claim images), Cosmos DB (claim records needing multi-region read), and Azure Cognitive Services (OCR for extracting data from uploaded medical bills).

The PM chose Azure because the insurance company's IT team already managed Azure AD for 5,000 employees, and adding new Azure services to their existing subscription was faster than setting up an [[AWS]] or [[GCP]] account from scratch.

## Related Concepts

- [[AWS]] -- largest cloud provider, primary Azure competitor
- [[GCP]] -- Google's cloud platform, strong in data/AI
- [[Cloud-Computing]] -- foundational concept for all cloud platforms
- [[IaaS-PaaS-SaaS]] -- Azure's service model taxonomy
- [[Serverless-Computing]] -- Azure Functions and event-driven architecture
- [[Cloud-Billing]] -- Azure pricing and cost optimization
- [[Session-09-Cloud-Deployment]] -- deployment strategies across cloud providers
- [[Session-10-Cloud-Going-Live]] -- going live on Azure infrastructure
