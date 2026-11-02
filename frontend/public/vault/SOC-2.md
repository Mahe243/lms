---
title: SOC 2
aliases: [SOC2, SOC 2 Compliance, Service Organization Control 2]
tags: [compliance, pm2, security, audit, saas]
category: Compliance
---

## Definition
#definition

SOC 2 (Service Organization Control 2) is a compliance framework developed by the American Institute of Certified Public Accountants (AICPA) that evaluates how a service organization manages customer data based on five Trust Service Criteria: Security, Availability, Processing Integrity, Confidentiality, and Privacy.
Unlike prescriptive standards like [[PCI-DSS]], SOC 2 is principles-based -- it defines what outcomes to achieve, not exactly how to achieve them.
For SaaS PMs, SOC 2 compliance is often the single biggest gate to closing enterprise deals.

## How It Works

- **Type I vs Type II**: A SOC 2 Type I audit evaluates whether the organization's controls are suitably designed at a specific point in time -- a snapshot.
  A SOC 2 Type II audit evaluates whether those controls are operating effectively over a period of time (typically 6-12 months).
  Type II is significantly more rigorous and more trusted by enterprise buyers.
  Most companies start with Type I and progress to Type II within a year.

- **Five Trust Service Criteria (TSC)**:
  Security (the common criteria, always required -- covers access controls, [[Encryption]], [[Incident-Response]]);
  Availability (the system is available for operation as agreed -- relates to [[Uptime]] SLAs);
  Processing Integrity (system processing is complete, valid, and timely);
  Confidentiality (information designated as confidential is protected);
  and Privacy (personal information is collected, used, retained, and disclosed in conformity with commitments).
  PMs choose which TSC to include based on the product's data handling.

- **The Audit Process**: An independent CPA firm examines the organization's controls.
  The auditor reviews policies, tests controls (e.g., verifying that [[RBAC]] is enforced, that [[Two-Factor-Authentication|MFA]] is required for admin access, that logs are retained), interviews staff, and inspects evidence.
  The output is a SOC 2 report that can be shared with customers under NDA.

- **Continuous Compliance**: Modern tools like Vanta, Drata, and Sprinto (an Indian SaaS startup) automate evidence collection -- continuously monitoring that AWS configurations match security policies, that employee laptops have disk encryption, and that access reviews happen quarterly.
  This shifts compliance from a painful annual scramble to an ongoing automated process.

- **Complementary User Entity Controls (CUECs)**: The SOC 2 report also lists controls that are the customer's responsibility -- for example, "the customer must enforce MFA for their end users."
  PMs must clearly communicate these shared responsibilities in the product's security documentation.

## PM Implications
#pm-implication

- **SOC 2 is a revenue enabler, not a cost center**: Enterprise prospects will ask for your SOC 2 report before signing.
  Without it, you are excluded from procurement shortlists at banks, insurance companies, large enterprises, and government agencies.
  PMs should frame SOC 2 investment as pipeline acceleration and track its impact on deal velocity and win rates.

- **SOC 2 requirements shape the product roadmap**: Achieving SOC 2 compliance often requires building features like audit logging, [[RBAC]], session timeout controls, data retention policies, and [[Encryption|encryption at rest]].
  PMs should map TSC requirements to product features early and integrate them into the roadmap rather than treating them as a separate compliance workstream.

- **The compliance journey starts 6-12 months before the audit**: PMs need to plan for Type II's observation period.
  If the product lacks audit logs today, those logs need to be implemented, deployed, and operational for at least 6 months before the auditor evaluates them.
  Starting late means delaying enterprise revenue by a full year.

- **SOC 2 creates a competitive moat for startups**: In the Indian SaaS ecosystem, early-stage companies that achieve SOC 2 Type II differentiate themselves from competitors.
  Freshworks, Zoho, and Postman all leveraged SOC 2 compliance to accelerate their US enterprise expansion.
  PMs at Indian SaaS startups targeting global markets should prioritize [[Compliance-Frameworks|compliance]] as a go-to-market strategy.

## Example

Postman, founded in Bangalore, recognized early that its API development platform would handle sensitive enterprise data -- API keys, authentication tokens, environment variables, and production endpoint configurations.
As Postman pursued enterprise customers like Salesforce, PayPal, and Shopify, SOC 2 Type II compliance became a prerequisite.
Their PM and engineering teams built features specifically to satisfy SOC 2 requirements: workspace-level [[RBAC]] (so API collections could be scoped to teams), audit logs tracking every collection share and environment variable change, [[Encryption]] of variables at rest using AES-256, and SSO/SAML integration for enterprise [[Authentication]].
The SOC 2 report became a downloadable asset on their security page, and they built a dedicated trust center.
This investment directly correlated with Postman's enterprise tier revenue growth, demonstrating that for Indian SaaS companies selling globally, SOC 2 is not overhead -- it is product-market fit for the enterprise segment.

## Related Concepts

- [[Compliance-Frameworks]]
- [[ISO-27001]]
- [[GDPR]]
- [[RBAC]]
- [[Incident-Response]]
- [[Session-11-Security-Compliance]]
