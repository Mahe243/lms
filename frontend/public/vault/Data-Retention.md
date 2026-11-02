---
title: Data Retention
aliases:
  - Data Retention
  - Data Retention Policy
  - Retention Schedule
tags:
  - pm2
  - india-context
  - privacy
  - compliance
  - data-governance
category: Privacy and Compliance
---

## Definition

Data Retention refers to the policies, practices, and legal requirements governing how long an organization keeps data before it must be deleted, anonymized, or archived. Retention policies balance competing needs: legal obligations to preserve records (tax laws, regulatory audits), business needs for historical data (analytics, customer service), and privacy requirements to minimize data storage ([[GDPR]]'s storage limitation principle, [[DPDP-Act]]'s purpose limitation). For PMs, data retention is not just a backend concern -- it directly affects product features like order history, account recovery, analytics accuracy, and user trust. #definition

## How It Works

- **Regulatory Retention Requirements:** Different regulations mandate different retention periods for different data types. In India: [[RBI-Guidelines]] require payment transaction records to be retained for 10 years; Companies Act requires financial records for 8 years; IT Act requires ISP logs for 90 days minimum; SEBI requires trading records for 5 years; and the [[DPDP-Act]] mandates deletion of personal data once the purpose for which it was collected is fulfilled, unless retention is required by law. PMs must map each data category to its applicable retention period.

- **Retention Schedule Design:** A retention schedule is a document that lists each data category (mapped from [[Data-Classification]]), its retention period, the legal basis for retention, the deletion/anonymization method, and the responsible data owner. For example: customer KYC data (retain 5 years after account closure per [[RBI-Guidelines]]), transaction logs (retain 10 years per RBI), marketing consent records (retain for duration of consent plus 1 year per [[DPDP-Act]]), and application logs (retain 90 days for debugging, then delete).

- **Deletion vs Anonymization:** When retention periods expire, data can be either deleted (removed from all storage including backups) or anonymized (irreversibly stripped of identifying elements so it no longer constitutes personal data). Anonymized data can be retained indefinitely for analytics. However, true anonymization is technically challenging -- [[GDPR]] and [[DPDP-Act]] set high standards for what qualifies as anonymous vs pseudonymous data.

- **Technical Implementation:** Implementing retention requires: (1) automated data lifecycle management pipelines that flag and process data reaching its retention limit; (2) retention-aware database design where records have `created_at` and `retention_expires_at` timestamps; (3) backup management ensuring that deleted data is also purged from backups within a reasonable period; (4) audit trails proving that deletion occurred as scheduled.

- **Right to Erasure Interactions:** Retention policies interact with individual erasure rights under [[GDPR]] (Article 17) and [[DPDP-Act]]. A user may request deletion of their data before the retention period expires. PMs must design flows that process erasure requests while preserving data required by law (e.g., tax records). This requires careful [[Data-Classification]] to determine which data can be deleted immediately and which must be retained.

- **Retention in Distributed Systems:** In a [[Microservices-Architecture]], the same user data may exist across multiple services (payments, user profiles, analytics, customer support). Retention policies must apply consistently across all services. PMs must ensure that a "delete user" event propagates to every service holding that user's data, which requires careful event-driven design using [[Webhooks]] or message queues.

## PM Implications

- **Feature Design for Data Lifecycle:** PMs must consider data retention when designing features. An "order history" feature that shows all past orders may conflict with a 2-year retention policy for order data. The PM must decide: show all orders during retention period, then archive? Anonymize old orders but keep them visible? These are product decisions with privacy implications. #pm-implication

- **Storage Cost Optimization:** Retaining data indefinitely increases storage costs and compliance burden. PMs should work with engineering to implement tiered storage strategies: hot storage for active data, warm storage for data in its retention period, and scheduled deletion for expired data. Cloud providers offer lifecycle policies (e.g., [[AWS]] S3 Lifecycle, [[Azure]] Blob Lifecycle) that automate tier transitions. #pm-implication

- **Analytics and ML Impact:** Deleting historical data affects analytics accuracy and ML model training. PMs must coordinate with data science teams to ensure that anonymized datasets or aggregate statistics are preserved for legitimate analytical purposes before source data is deleted. The [[Data-Privacy]] team must verify that anonymization methods meet regulatory standards. #pm-implication

- **User Communication:** Users should be informed about retention periods through privacy policies and in-product notices. When data is about to be deleted, some products (like email services) notify users and offer export options. PMs should design retention-related user communications that are clear, timely, and actionable, aligning with [[Consent-Management]] transparency principles. #pm-implication

## Example

**CRED's Data Retention Strategy for Credit Card Data** #india-context #case-study

CRED, the Indian fintech platform for credit card bill payments and rewards, processes sensitive financial data for over 35 million users. Following [[RBI-Guidelines]] on card tokenization and [[Data-Privacy]] principles, CRED implemented a tiered data retention strategy. Credit card numbers are tokenized immediately upon entry (only tokens are stored, per [[RBI-Guidelines]] on card-on-file), and the original card data is never retained. Bill payment transaction records are retained for 10 years as required by [[RBI]] for payment system operators. User behavior data (app usage, reward redemption patterns) used for personalization is retained for 3 years with user consent under [[Consent-Management]] frameworks, then anonymized into aggregate cohort statistics for product analytics. When users delete their CRED account, the system triggers a cascading deletion: personal profile data is deleted within 30 days, tokenized card references are invalidated with the issuing bank, consent records are archived (retained for audit purposes per [[DPDP-Act]]), and transaction records transition to a "pseudonymized archive" where they remain for the legally mandated 10-year period but are no longer linkable to the individual without a court order. This approach demonstrates how PMs can satisfy competing requirements from [[RBI-Guidelines]], [[DPDP-Act]], and user expectations using [[Data-Classification]] as the organizing framework.

This multi-layered approach to retention -- immediate deletion, pseudonymized archiving, and legally mandated long-term retention -- is a model that PMs across Indian fintech can adapt to their own regulatory context.

See also: [[Session-12-Security-Privacy]]

## Related Concepts

- [[GDPR]]
- [[DPDP-Act]]
- [[Data-Privacy]]
- [[Data-Classification]]
- [[Encryption]]
- [[Consent-Management]]
