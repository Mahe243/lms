---
title: Compliance Frameworks
aliases: [Compliance Standards, Regulatory Frameworks, Security Compliance]
tags: [compliance, pm2, security, privacy, governance]
category: Compliance
---

## Definition
#definition

Compliance frameworks are structured sets of guidelines, controls, and best practices that organizations must follow to meet regulatory, legal, or industry-specific requirements for data protection, security, and privacy.
They provide a standardized way to demonstrate that an organization handles sensitive information responsibly.
For PMs, compliance frameworks are not abstract legal constructs -- they are concrete sets of product requirements that determine which features must exist, how data must flow, and which markets the product can serve.

## How It Works

- **[[SOC-2|SOC 2]]**: Developed by AICPA, SOC 2 is the de facto standard for SaaS companies selling to US enterprises.
  It evaluates five Trust Service Criteria (Security, Availability, Processing Integrity, Confidentiality, Privacy) through independent audit.
  Type I is a point-in-time assessment; Type II covers 6-12 months of operational evidence.
  Most relevant for: B2B SaaS, cloud infrastructure, data processors.

- **[[ISO-27001]]**: An international standard for Information Security Management Systems (ISMS).
  It is recognized globally, making it essential for companies selling across borders.
  The certification is valid for three years with annual surveillance audits.
  Most relevant for: companies selling to enterprises in Europe, Middle East, Asia, and Indian government/BFSI sectors.

- **[[PCI-DSS]]**: Mandated for any organization handling payment card data.
  Compliance levels depend on transaction volume.
  The most effective PM strategy is to minimize PCI scope by using tokenized payment gateways like Razorpay or Stripe.
  Most relevant for: e-commerce, fintech, subscription businesses, any product with a checkout flow.

- **HIPAA (Health Insurance Portability and Accountability Act)**: US regulation governing the protection of Protected Health Information (PHI).
  Requires safeguards for data at rest and in transit, access controls, audit trails, and Business Associate Agreements (BAAs) with vendors.
  Most relevant for: healthtech, telemedicine, health insurance products targeting the US market.
  India does not have a direct HIPAA equivalent, but the [[DPDP-Act]] covers health data as sensitive personal data.

- **[[GDPR]] (General Data Protection Regulation)**: The EU's comprehensive data protection regulation.
  Mandates lawful basis for processing, data subject rights (access, erasure, portability), Data Protection Impact Assessments, 72-hour breach notification, and data protection by design.
  Fines up to 4% of global annual revenue.
  Most relevant for: any product with EU users or customers.

- **[[DPDP-Act]] (Digital Personal Data Protection Act, 2023)**: India's data protection law.
  Establishes data fiduciary obligations, [[Consent-Management|consent requirements]], data principal rights, and the Data Protection Board.
  While less prescriptive than [[GDPR]], it signals India's move toward formal data protection regulation.
  Most relevant for: any product processing personal data of Indian residents.

## PM Implications
#pm-implication

- **Compliance determines market access**: Without [[SOC-2]], you cannot sell to US enterprises.
  Without [[ISO-27001]], you lose Indian government and banking RFPs.
  Without [[PCI-DSS]], you cannot process payments.
  Without [[GDPR]] compliance, you face EU market exclusion and fines.
  PMs must map which frameworks are required for each target market segment and build compliance into the GTM strategy, not as an afterthought.

- **Frameworks overlap significantly**: [[SOC-2]], [[ISO-27001]], and [[GDPR]] share many common controls -- [[Encryption]], access control ([[RBAC]]), [[Incident-Response]], logging and [[Monitoring]], vendor management.
  PMs should advocate for a unified control framework that satisfies multiple standards simultaneously rather than building separate compliance workstreams for each.
  Tools like Sprinto and Vanta map controls across frameworks.

- **Compliance is a continuous process, not a one-time project**: Every framework requires ongoing evidence collection, periodic audits, and continuous improvement.
  PMs must budget for compliance as a recurring operational cost, not a one-time capital expense.
  Building automated compliance monitoring into the product (audit logs, access reviews, configuration checks) reduces the ongoing burden.

- **The PM owns the compliance-feature intersection**: Legal teams understand regulations, security teams understand controls, but the PM is uniquely positioned to translate compliance requirements into product features that serve both regulatory and user needs.
  [[Consent-Management]] is both a [[GDPR]] requirement and a user trust feature.
  [[Two-Factor-Authentication|MFA]] is both a [[SOC-2]] control and a security differentiator.
  PMs who frame compliance features as user value propositions build better products.

## Example

Freshworks, the Chennai-headquartered SaaS company (NYSE: FRSH), provides a compelling case study in compliance-driven product evolution.
As Freshworks expanded from serving Indian SMBs to global enterprises, their compliance journey directly shaped the product roadmap.
For [[SOC-2]] Type II, they built granular [[RBAC]] and audit logging across Freshdesk, Freshsales, and Freshservice.
For [[GDPR]], they built consent management, data export (portability), and right-to-erasure workflows into every product.
For [[ISO-27001]], they formalized their ISMS and extended security controls to their development processes.
For HIPAA, they created a dedicated healthcare offering with BAA support, [[Encryption|data encryption]], and access controls meeting PHI requirements.
Each compliance milestone unlocked new revenue segments: SOC 2 opened US mid-market, ISO 27001 opened Indian BFSI and Middle Eastern government, GDPR enabled EU enterprise sales, and HIPAA created the healthcare vertical.
Their trust center became a sales enablement tool.
For PMs at Indian SaaS companies with global ambitions, Freshworks demonstrates that compliance is not a tax -- it is a systematic expansion strategy where each framework unlocks a definable market segment.

## Related Concepts

- [[SOC-2]]
- [[ISO-27001]]
- [[PCI-DSS]]
- [[GDPR]]
- [[DPDP-Act]]
- [[Privacy-by-Design]]
- [[Session-11-Security-Compliance]]
- [[Session-12-Security-Privacy]]
