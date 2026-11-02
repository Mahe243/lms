---
title: Data Residency
aliases:
  - Data Residency
  - Data Residence
  - Data Location
tags:
  - pm2
  - india-context
  - privacy
  - compliance
  - cloud-infrastructure
category: Privacy and Compliance
---

## Definition

Data Residency refers to the physical or geographic location where an organization's data is stored, processed, and managed, typically specified by cloud region, data center, or country. Unlike [[Data-Localization]] which is a regulatory mandate, data residency is an operational and architectural decision about where data physically lives. PMs must make data residency decisions based on a combination of regulatory requirements ([[RBI-Guidelines]], [[DPDP-Act]]), latency optimization, disaster recovery needs, and cost considerations. Cloud providers like [[AWS]], [[Azure]], and [[GCP]] offer region-specific data residency guarantees that form the foundation of compliance strategies. #definition

## How It Works

- **Cloud Regions and Availability Zones:** Major cloud providers organize infrastructure into regions (geographic areas) and availability zones (isolated data centers within a region). For India, the key regions are: [[AWS]] Mumbai (ap-south-1) with 3 AZs and Hyderabad (ap-south-2) with 3 AZs; [[Azure]] Central India (Pune), South India (Chennai), West India (Mumbai); [[GCP]] Mumbai (asia-south1) with 3 zones and Delhi (asia-south2) with 3 zones. Each AZ has independent power, cooling, and networking.

- **Data Residency Configuration:** Cloud platforms offer tools to enforce data residency: [[AWS]] uses Resource Control Policies and S3 Bucket Region restrictions; [[Azure]] uses Azure Policy to restrict resource deployment to specific regions; [[GCP]] uses Organization Policy Constraints with `gcp.resourceLocations`. These prevent accidental data replication outside permitted regions.

- **Multi-Region vs Single-Region:** For high availability, organizations often replicate data across multiple regions. However, [[Data-Localization]] mandates may restrict replication to regions within the same country. In India, this means replication between Mumbai and Hyderabad ([[AWS]]) or Mumbai and Delhi ([[GCP]]), but not to Singapore or Ireland. PMs must balance availability requirements against regulatory constraints.

- **Edge Cases in Residency:** Data residency extends beyond primary databases. PMs must account for: CDN cache locations (are cached responses containing personal data served from non-Indian edge nodes?), log aggregation services (do application logs containing user data ship to global regions?), backup and snapshot storage (are database backups stored in the same region?), and temporary processing (does a serverless function in a non-Indian region process personal data during a brief computation?).

- **Residency Certificates and Audits:** Cloud providers issue data residency certifications and compliance reports. [[AWS]] provides the India Data Residency commitments document, [[Azure]] publishes regional compliance documentation, and [[GCP]] offers data residency and sovereignty tools. These artifacts are critical during [[RBI]] audits and [[DPDP-Act]] compliance assessments.

- **Sovereign Cloud Initiatives:** India is developing sovereign cloud capabilities. The government's MeghRaj Cloud Initiative provides cloud infrastructure for government applications with guaranteed Indian residency. Private providers like Jio Cloud and Yotta offer India-only cloud regions. PMs building government-facing (GovTech) products or handling particularly sensitive data may need to consider sovereign cloud options alongside global providers.

## PM Implications

- **Performance vs Compliance Tradeoffs:** Restricting data to Indian regions may increase latency for users outside India or limit the use of global services (e.g., a global ML model that processes data in US-West). PMs must quantify the latency impact and design regional routing that satisfies both performance SLAs and compliance requirements. #pm-implication

- **Vendor Due Diligence:** Every third-party SaaS or API vendor in the product stack that touches personal data must confirm data residency within India for regulated data. PMs should maintain a vendor data residency matrix documenting where each vendor stores and processes data, updated during quarterly compliance reviews. #pm-implication

- **Cost Optimization:** Indian cloud regions may be 10-25% more expensive than Southeast Asian or US regions for certain services. PMs must work with finance and engineering to optimize costs through reserved instances, committed use discounts, and tiered storage while maintaining residency compliance. Non-regulated data (analytics aggregates, public content) can be processed in cheaper regions. #pm-implication

- **Multi-Cloud and Hybrid Strategies:** Some organizations use multiple cloud providers or hybrid (cloud + on-premises) architectures for data residency. PMs must understand the complexity this adds to data management, including ensuring consistent [[Encryption]] standards, unified [[Data-Classification]] policies, and coordinated [[Data-Retention]] schedules across environments. #pm-implication

## Example

**Zerodha's Data Residency Architecture** #india-context #case-study

Zerodha, India's largest stock broker by active clients (12+ million), operates its entire infrastructure within Indian data centers to comply with SEBI (Securities and Exchange Board of India) and [[RBI]] data residency requirements. Rather than using public cloud providers, Zerodha runs on co-located bare-metal servers in Mumbai data centers close to NSE and BSE matching engines to minimize trading latency. Customer PII, KYC data (collected via [[Aadhaar-eKYC]]), trading history, and portfolio data all reside exclusively within these Indian facilities. When Zerodha adopted [[Cloud-Computing]] services for non-latency-critical workloads (analytics, backoffice), it chose [[AWS]] Mumbai (ap-south-1) and implemented VPC policies to prevent any data replication outside India. Database backups are encrypted using AES-256 ([[Encryption]]) and stored in the same Mumbai region. The product team classifies data per [[Data-Classification]] tiers: trading credentials and biometric data as Restricted, portfolio and transaction data as Confidential, and market data as Public. This architecture ensures compliance with [[Data-Localization]] mandates while achieving sub-millisecond latency for order execution.

This hybrid approach -- bare metal for latency-critical trading, [[Cloud-Computing]] for analytics -- demonstrates how PMs can optimize both performance and compliance in data residency planning.

See also: [[Session-12-Security-Privacy]]

## Related Concepts

- [[Data-Localization]]
- [[AWS]]
- [[Azure]]
- [[GCP]]
- [[Cloud-Computing]]
- [[RBI-Guidelines]]
