---
title: Data Privacy
aliases:
  - Data Privacy
  - Personal Data Protection
  - Information Privacy
tags:
  - pm2
  - india-context
  - privacy
  - compliance
  - data-governance
category: Privacy and Compliance
---

## Definition

Data Privacy refers to the principles, practices, and legal frameworks that govern how personal data is collected, processed, stored, shared, and deleted, ensuring that individuals retain control over their personal information. It encompasses concepts like consent, purpose limitation, data minimization, storage limitation, and the right to erasure. In the Indian context, data privacy is governed by the [[DPDP-Act]] (Digital Personal Data Protection Act, 2023), while globally, [[GDPR]] (EU), CCPA (US-California), and PDPA (Singapore) set the standards. For PMs, data privacy is not a compliance checkbox but a core product design principle that shapes features, user trust, and business models. #definition

## How It Works

- **Core Principles:** Data privacy rests on several foundational principles: (1) **Lawfulness and consent** -- data must be processed with a lawful basis, typically user consent; (2) **Purpose limitation** -- data collected for one purpose cannot be used for another without fresh consent; (3) **Data minimization** -- collect only what is strictly necessary; (4) **Storage limitation** -- retain data only as long as needed, governed by [[Data-Retention]] policies; (5) **Accuracy** -- keep data accurate and up-to-date; (6) **Security** -- protect data using [[Encryption]] and access controls.

- **Data Subject Rights:** Under modern privacy laws including [[GDPR]] and [[DPDP-Act]], individuals have rights including: right to access their data, right to correction, right to erasure (right to be forgotten), right to data portability, and right to withdraw consent. PMs must build features that enable users to exercise these rights, typically through account settings and data export tools.

- **Privacy Impact Assessments (PIAs):** Before launching features that process new categories of personal data, organizations conduct PIAs to evaluate risks to user privacy. This involves identifying data flows, assessing necessity and proportionality, evaluating security measures, and documenting mitigations. PMs initiate PIAs during the product design phase.

- **Technical Implementation:** Privacy is implemented through a combination of [[Encryption]] (at rest and in transit), access controls (role-based access per [[Data-Classification]]), anonymization and pseudonymization techniques, secure deletion procedures, and audit logging. [[Privacy-by-Design]] ensures these are built into the architecture from the start, not bolted on later.

- **Cross-Border Data Flows:** When personal data moves across national borders, additional restrictions apply. [[Data-Localization]] mandates (like [[RBI-Guidelines]] for payment data) may prohibit certain data from leaving the country. [[Data-Residency]] requirements dictate where data must physically reside. PMs must map data flows to ensure compliance with each jurisdiction's requirements.

- **Privacy Notices and Transparency:** Organizations must provide clear, accessible privacy notices explaining what data they collect, why, how long they retain it ([[Data-Retention]]), who they share it with, and how users can exercise their rights. Under [[DPDP-Act]], the privacy notice must be in English and all 22 scheduled languages of India when serving Indian users, making localization a PM concern.

## PM Implications

- **Privacy as a Product Feature:** Users increasingly choose products based on privacy practices. PMs should treat privacy controls (granular consent, data export, deletion requests) as first-class product features, not hidden settings. Transparent privacy practices build trust and can be a competitive differentiator. #pm-implication

- **Data Collection Audit:** PMs should regularly audit what data their product collects, why it is collected, and whether it is still needed. Every data field in a registration form, every analytics event, and every cookie should have a documented purpose. [[Data-Classification]] helps prioritize protection efforts based on sensitivity. #pm-implication

- **Consent Flow Design:** Under [[DPDP-Act]] and [[GDPR]], consent must be freely given, specific, informed, and unambiguous. PMs must design [[Consent-Management]] flows that clearly explain what data is collected and why, allow granular opt-in/opt-out, and make withdrawal as easy as granting consent. Pre-checked boxes and bundled consent are not compliant. #pm-implication

- **Incident Response Planning:** Data breaches require notification to regulators and affected users within specified timeframes (72 hours under [[GDPR]], "without delay" under [[DPDP-Act]]). PMs must ensure incident response processes are documented and tested, including user-facing breach notification templates and remediation flows. #pm-implication

## Example

**Zomato's Data Privacy Overhaul Post-DPDP Act** #india-context #case-study

Following the passage of the [[DPDP-Act]] in August 2023, Zomato undertook a comprehensive data privacy overhaul of its food delivery platform. The PM team mapped all personal data flows: user profiles, order history, location data, payment information (processed via [[Razorpay]]), delivery partner data, and restaurant partner data. They implemented a layered [[Consent-Management]] system where users could separately consent to: order data for personalization, location tracking for delivery, marketing communications, and data sharing with restaurant partners. A new "Privacy Dashboard" in the app allowed users to download their data (right to portability), request deletion (right to erasure), and view which third parties had accessed their data. The [[Data-Classification]] exercise revealed that delivery location history was classified as "sensitive" because it could reveal home addresses and daily routines. This data was subjected to stricter [[Encryption]] and shorter [[Data-Retention]] periods (auto-deleted after 90 days unless the user opted to keep it for reorder convenience).

This exercise aligned Zomato's product practices with both [[GDPR]] international best practices and the emerging [[DPDP-Act]] requirements ahead of enforcement.

See also: [[Session-12-Security-Privacy]]

## Related Concepts

- [[GDPR]]
- [[DPDP-Act]]
- [[Privacy-by-Design]]
- [[Consent-Management]]
- [[Data-Classification]]
- [[Data-Retention]]
