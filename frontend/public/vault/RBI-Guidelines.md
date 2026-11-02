---
title: RBI Guidelines
aliases:
  - RBI Guidelines
  - RBI Regulations
  - RBI Circulars
tags:
  - pm2
  - india-context
  - fintech
  - compliance
  - regulation
  - privacy
category: Regulatory Frameworks
---

## Definition

RBI Guidelines refer to the comprehensive set of regulatory circulars, directions, and frameworks issued by the [[RBI]] that govern the operations of banks, payment systems, NBFCs, and fintech companies in India. These guidelines cover critical areas including [[Data-Localization]], card tokenization, digital lending, video KYC, payment aggregator licensing, and cybersecurity standards. For PMs building financial products, RBI Guidelines are not optional best practices but legally binding requirements that must be embedded into product design, data architecture, and operational processes. #definition

## How It Works

- **Data Localization Circular (April 2018):** RBI mandated that all payment system operators store the complete end-to-end transaction data exclusively within India. "Data" includes full transaction details, customer information, payment credentials, and OTP data. International payment networks (Visa, Mastercard) were given six months to comply. This directly impacts [[Data-Residency]] decisions for any product processing payments, requiring Indian [[Cloud-Computing]] regions and affecting cross-border data flows.

- **Card Tokenization (September 2021, enforced October 2022):** RBI prohibited merchants, payment aggregators, and acquiring banks from storing actual card credentials (card number, CVV, expiry). Only the card issuer and the card network may retain full card data. All other entities must replace card details with unique tokens via [[Encryption]]. This meant [[Razorpay]] and similar gateways had to implement Token Service Provider (TSP) integrations with Visa, Mastercard, and RuPay, fundamentally changing how saved cards work.

- **Digital Lending Guidelines (August 2022):** Key mandates include: (1) loan disbursements must go directly to the borrower's bank account, not through intermediary wallets; (2) Lending Service Providers must disclose all fees upfront on a standardized Key Fact Statement; (3) borrower data collected by apps must be need-based with explicit consent under [[Consent-Management]] principles; (4) data collected cannot be shared with third parties without explicit borrower consent, aligning with [[DPDP-Act]] principles.

- **Video KYC / V-CIP (January 2020):** RBI allowed Video-based Customer Identification Process as a compliant method for customer verification, alongside in-person and [[Aadhaar-eKYC]] methods. The guidelines specify technical requirements: minimum video resolution, geotagging, live photograph capture, OVD (Officially Valid Document) verification during the call, and encrypted storage of video recordings per [[Data-Retention]] policies.

- **Payment Aggregator Guidelines (March 2020):** Entities facilitating online payments between merchants and customers must obtain PA (Payment Aggregator) authorization from [[RBI]]. Requirements include a minimum net worth of INR 25 crore, mandatory escrow accounts with scheduled banks, [[PCI-DSS]] certification, and annual cybersecurity audits. This professionalized the payment gateway industry and raised the barrier to entry.

- **Account Aggregator Framework (2021):** RBI's Account Aggregator (AA) framework enables consent-based sharing of financial data between Financial Information Providers (banks, insurers, mutual funds) and Financial Information Users (lenders, wealth managers) through licensed Account Aggregators. The AA framework is built on [[REST-API]] standards with encrypted data flows and explicit [[Consent-Management]], forming a key part of India's open finance ecosystem alongside [[UPI]] and [[Aadhaar-eKYC]].

## PM Implications

- **Product Roadmap Dependencies:** Major RBI guideline changes (like card tokenization) create non-negotiable product milestones. PMs must build regulatory compliance sprints into their roadmaps and maintain buffer timelines, because RBI deadlines are rarely extended. Missing a compliance deadline can mean feature shutdowns. #pm-implication

- **Architecture-Level Compliance:** Guidelines like [[Data-Localization]] and card tokenization require architectural changes, not just UI updates. PMs must work closely with engineering leads to ensure that data storage ([[Data-Residency]]), [[Encryption]], and [[API-Authentication]] patterns comply at the infrastructure level. #pm-implication

- **Consent and Transparency Requirements:** Digital lending guidelines mandate clear disclosure and explicit consent. PMs must design consent flows that are both legally compliant and user-friendly, integrating [[Consent-Management]] platforms and maintaining audit-ready consent logs as required by [[Data-Privacy]] regulations. #pm-implication

- **Competitive Landscape Shifts:** RBI guidelines level the playing field or reshape competitive dynamics. When card-on-file storage was banned, it disadvantaged merchants with large saved-card bases and benefited tokenization providers. PMs must analyze how each new guideline affects their competitive position. #pm-implication

## Example

**Card Tokenization Rollout by Razorpay (2022)** #india-context #case-study

When [[RBI]] enforced the card tokenization mandate in October 2022, [[Razorpay]] had to ensure that none of its 8+ million merchants stored raw card data. Razorpay implemented a Token Service Provider (TSP) integration with Visa, Mastercard, and RuPay networks. For each saved card, the original PAN (Primary Account Number) was replaced with a network-generated token scoped to the merchant-device combination. The migration involved: (1) batch tokenization of millions of existing saved cards via [[REST-API]] calls to card networks, (2) updating the checkout SDK to request consent before tokenizing new cards per [[Consent-Management]] requirements, (3) implementing token lifecycle management (suspend, resume, delete) via [[Webhooks]], and (4) ensuring all token data met [[Data-Localization]] storage requirements. Post-tokenization, Razorpay reported that repeat purchase conversion rates dropped initially by 5-8% as customers needed to re-save cards, but recovered within 3 months as users adapted to the new flow.

See also: [[Session-12-Security-Privacy]]

## Related Concepts

- [[RBI]]
- [[UPI]]
- [[Data-Localization]]
- [[Encryption]]
- [[PCI-DSS]]
- [[Consent-Management]]
