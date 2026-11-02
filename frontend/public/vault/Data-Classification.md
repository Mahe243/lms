---
title: Data Classification
aliases:
  - Data Classification
  - Information Classification
  - Data Sensitivity Levels
tags:
  - pm2
  - india-context
  - privacy
  - compliance
  - data-governance
  - security
category: Privacy and Compliance
---

## Definition

Data Classification is the process of categorizing data assets based on their sensitivity, business value, and regulatory requirements, and assigning appropriate security controls to each category. A typical classification scheme uses tiers such as Public, Internal, Confidential, and Restricted (or Highly Confidential). For PMs, data classification determines how features handle, store, display, and transmit data -- it directly shapes product architecture decisions, access control models, [[Encryption]] requirements, and [[Data-Retention]] policies. #definition

## How It Works

- **Classification Tiers:** Most organizations use a four-tier model: (1) **Public** -- data intended for public access (marketing content, published API docs), requiring no special protection; (2) **Internal** -- data for internal use only (internal dashboards, employee directories), requiring basic access controls; (3) **Confidential** -- sensitive business data (customer PII, financial records, transaction data), requiring [[Encryption]], access logging, and restricted sharing; (4) **Restricted** -- highest sensitivity data (Aadhaar numbers, card PANs, health records, biometric data), requiring the strongest controls including [[Encryption]] at rest and in transit, strict access controls, and compliance with specific regulations like [[PCI-DSS]] and [[DPDP-Act]].

- **Classification Process:** Data classification involves: (1) creating a data inventory listing all data assets, databases, files, and data flows; (2) identifying data owners and custodians for each asset; (3) applying classification labels based on sensitivity and regulatory requirements; (4) mapping applicable regulations (e.g., [[RBI-Guidelines]] for payment data, [[DPDP-Act]] for personal data); (5) defining handling procedures for each classification level.

- **Technical Controls by Classification:** Each tier maps to specific technical controls. Restricted data requires AES-256 [[Encryption]] at rest, TLS 1.2+ in transit, multi-factor [[Authentication]], data masking in non-production environments, and real-time access monitoring. Confidential data requires encryption and access controls but may allow broader internal access. Internal data requires standard access controls. Public data needs integrity protection (to prevent tampering) but not confidentiality controls.

- **Data Classification in APIs:** When building [[REST-API]] endpoints, classification determines which fields are included in responses, whether fields are masked or tokenized, what [[API-Authentication]] level is required, and whether responses can be cached. For example, a user profile API might return the full name (Confidential) but mask the Aadhaar number (Restricted) to show only the last 4 digits.

- **Automated Classification:** Modern data platforms use automated classification tools that scan databases, file systems, and data lakes to identify PII, financial data, and health records using pattern matching and ML. These tools tag data assets with classification labels, helping PMs and data teams maintain an up-to-date data inventory without manual effort.

- **Regulatory Mapping:** Each classification tier maps to specific regulatory obligations. Restricted data containing Aadhaar numbers falls under UIDAI regulations; payment card data falls under [[PCI-DSS]]; personal data broadly falls under [[DPDP-Act]]; and payment system data falls under [[RBI-Guidelines]] [[Data-Localization]] mandates. PMs must ensure their classification policy explicitly references the applicable regulation for each data category.

## PM Implications

- **Feature Design Constraints:** Data classification directly constrains how features can display and manipulate data. A PM designing a customer support dashboard must ensure that Restricted data (Aadhaar, card numbers) is masked by default and visible only to authorized roles after additional [[Authentication]]. This affects wireframes, user stories, and acceptance criteria. #pm-implication

- **Environment Management:** Classified data cannot be freely copied into development, staging, or analytics environments. PMs must plan for data masking, synthetic data generation, or anonymization in non-production environments. Using real Restricted data in test environments violates [[Data-Privacy]] regulations and creates breach risk. #pm-implication

- **Third-Party Data Sharing:** When integrating with partners or vendors, PMs must ensure that data sharing agreements match the classification level. Sharing Confidential or Restricted data with third parties requires DPAs (Data Processing Agreements), security assessments, and often [[Consent-Management]] from the data subject. [[DPDP-Act]] imposes specific obligations on "data processors." #pm-implication

- **Audit and Compliance Readiness:** Regulators and auditors expect documented data classification policies with evidence of implementation. PMs should ensure their products generate audit logs for all access to Confidential and Restricted data, supporting compliance with [[RBI-Guidelines]], [[PCI-DSS]], and [[DPDP-Act]]. #pm-implication

## Example

**HDFC Bank's Data Classification for Mobile Banking** #india-context #case-study

HDFC Bank, India's largest private sector bank, implemented a four-tier data classification framework for its mobile banking application as mandated by [[RBI]] cybersecurity guidelines. Customer data was classified as follows: (1) **Restricted** -- Aadhaar numbers (used in [[Aadhaar-eKYC]]), card PANs, CVVs, UPI PINs, biometric data, and net banking passwords; (2) **Confidential** -- account numbers, transaction history, loan details, customer PII (name, address, phone, email); (3) **Internal** -- branch codes, product catalog, internal user IDs, API keys; (4) **Public** -- interest rates, branch locator data, FAQs. The classification drove product decisions: the mobile app masks account numbers (showing only last 4 digits) on the home screen, requires biometric re-authentication to view full account details, and encrypts all Restricted data using AES-256 with keys stored in an HSM (Hardware Security Module). Transaction data in analytics pipelines is pseudonymized before being processed, satisfying [[Data-Privacy]] requirements while enabling business intelligence.

See also: [[Session-12-Security-Privacy]]

## Related Concepts

- [[Data-Privacy]]
- [[DPDP-Act]]
- [[Encryption]]
- [[Data-Retention]]
- [[PCI-DSS]]
- [[RBI-Guidelines]]
