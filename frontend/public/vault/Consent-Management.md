---
title: Consent Management
aliases:
  - Consent Management
  - Consent Management Platform
  - CMP
  - User Consent
tags:
  - pm2
  - india-context
  - privacy
  - compliance
  - data-governance
  - ux
category: Privacy and Compliance
---

## Definition

Consent Management refers to the systems, processes, and user interfaces that organizations use to obtain, record, manage, and honor user consent for the collection and processing of personal data. Under regulations like [[GDPR]] and India's [[DPDP-Act]], consent must be freely given, specific, informed, and unambiguous, and users must be able to withdraw consent as easily as they granted it. Consent Management Platforms (CMPs) are specialized tools that implement consent collection (cookie banners, preference centers), storage (consent records with timestamps and versions), and enforcement (blocking data collection until consent is obtained). For PMs, consent management is a core UX challenge that directly impacts conversion rates, data quality, and regulatory compliance. #definition

## How It Works

- **Consent Collection Mechanisms:** Consent is collected through multiple touchpoints: (1) **Cookie/tracking consent banners** displayed on first website visit, with options to accept all, reject all, or customize by category (necessary, analytics, marketing, personalization); (2) **Registration consent checkboxes** during account creation, where each processing purpose has a separate checkbox (no pre-ticked boxes under [[GDPR]] and [[DPDP-Act]]); (3) **In-app consent prompts** triggered when a new feature requires additional data (e.g., enabling location access for nearby store recommendations); (4) **Preference centers** where users can review and modify their consent choices at any time.

- **Consent Records and Audit Trails:** Every consent action must be logged with: the identity of the data subject, the specific purposes consented to, the timestamp of consent, the version of the privacy notice shown, the method of consent (click, checkbox, verbal), and any subsequent modifications or withdrawals. These records serve as proof of compliance during [[RBI]] audits or [[DPDP-Act]] enforcement actions. Consent records are typically stored in a dedicated database with immutable append-only logs.

- **Granular vs Bundled Consent:** [[GDPR]] and [[DPDP-Act]] require granular consent -- users must be able to consent to specific processing purposes independently. Bundled consent (a single "I agree to everything" checkbox) is not compliant. PMs must design consent flows that present each purpose clearly without overwhelming users. Common consent categories include: service delivery (necessary), analytics, personalization, marketing communications, and third-party data sharing.

- **Consent Enforcement:** Consent decisions must be enforced across the tech stack. When a user declines analytics consent, all analytics tags (Google Analytics, Mixpanel, Amplitude) must be blocked. This is typically implemented via tag management systems (Google Tag Manager consent mode) or CMP-integrated SDKs that conditionally load scripts based on consent status. API calls that process personal data should check consent status before processing.

- **Withdrawal and Right to Object:** Under [[DPDP-Act]], withdrawing consent must be as easy as granting it. PMs must design withdrawal flows that: (1) are accessible from the app settings (not buried in legal pages); (2) take effect immediately or within a defined short period; (3) trigger downstream data processing stops and, if applicable, data deletion per [[Data-Retention]] policies; (4) do not result in punitive degradation of service beyond what is technically necessary.

- **India's Account Aggregator and Consent Artefacts:** India's Account Aggregator framework, regulated by [[RBI]], introduces a formal digital consent artefact for financial data sharing. Users grant time-bound, purpose-specific, revocable consent through a licensed Account Aggregator (like Setu AA or Finvu). The consent artefact is a signed digital document specifying data type, date range, frequency of access, and purpose. This model represents the gold standard for consent architecture and may be adopted beyond financial services as [[DPDP-Act]] evolves.

## PM Implications

- **Conversion Impact of Consent Flows:** Cookie consent banners and registration consent flows directly impact conversion rates. Studies show that poorly designed consent flows can reduce sign-up rates by 10-30%. PMs must A/B test consent UX (banner placement, wording, number of choices) while maintaining compliance. The goal is informed consent, not consent fatigue. #pm-implication

- **Data Quality and Analytics Gaps:** When users decline analytics consent, product analytics coverage drops. In EU markets post-[[GDPR]], consent rates for analytics cookies average 40-60%, meaning PMs lose visibility into 40-60% of user behavior. PMs must plan for this data gap by using privacy-friendly analytics approaches (server-side analytics, aggregated metrics, first-party data strategies) alongside consent-dependent tools. #pm-implication

- **Consent as a Feature, Not a Blocker:** Forward-thinking PMs treat consent management as a trust-building feature. Transparent consent flows, clear privacy dashboards, and easy preference management demonstrate respect for user privacy, which can increase long-term user engagement and reduce churn. Products like Apple's App Tracking Transparency show that privacy controls can be a competitive differentiator. #pm-implication

- **Cross-Platform Consent Synchronization:** Users interact with products across web, mobile app, email, and physical touchpoints. Consent preferences must be synchronized across all channels. A user who declines marketing emails via the app should not receive marketing emails. PMs must design a unified consent state that propagates across systems, which requires careful API design and [[Webhooks]] integration with marketing and analytics platforms. #pm-implication

## Example

**Flipkart's Consent Management Under DPDP Act** #india-context #case-study

Flipkart, India's largest e-commerce platform, redesigned its consent management system in preparation for [[DPDP-Act]] enforcement. The PM team identified 14 distinct data processing purposes across the platform: order fulfillment, delivery tracking, payment processing (via [[Razorpay]] and other gateways), product recommendations, search personalization, marketing notifications (push, SMS, email, WhatsApp), seller data sharing, loyalty program, ad targeting, customer support, fraud detection, credit/EMI offers, location-based services, and analytics. Each purpose was mapped to specific data elements using [[Data-Classification]]: order data (Confidential), payment tokens (Restricted), browsing behavior (Internal), and product reviews (Public). The consent flow was implemented as a layered system: Layer 1 (initial banner) presented 4 broad categories; Layer 2 (preference center in account settings) allowed granular control over all 14 purposes; Layer 3 (contextual prompts) appeared when a specific feature needed consent not yet granted. Consent records were stored in a dedicated microservice with an immutable event log, queryable via internal [[REST-API]] endpoints for compliance audits. When users withdrew consent for marketing, an event was published via [[Webhooks]] to CleverTap (push notifications), Netcore (emails), and Gupshup (WhatsApp), disabling marketing within 24 hours. The [[Data-Privacy]] team reported that 78% of users completed the granular consent flow without dropping off, exceeding the team's 65% target.

See also: [[Session-12-Security-Privacy]]

## Related Concepts

- [[GDPR]]
- [[DPDP-Act]]
- [[Data-Privacy]]
- [[Privacy-by-Design]]
- [[Data-Retention]]
- [[Data-Classification]]
