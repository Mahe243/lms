---
title: Aadhaar eKYC
aliases:
  - Aadhaar
  - eKYC
  - Aadhaar-based KYC
  - UIDAI eKYC
tags:
  - pm2
  - india-context
  - fintech
  - identity
  - privacy
  - compliance
category: India Digital Infrastructure
---

## Definition

Aadhaar eKYC (electronic Know Your Customer) is a digital identity verification system built on India's Aadhaar biometric identity platform managed by UIDAI (Unique Identification Authority of India). It enables businesses to verify a customer's identity in real time using Aadhaar number and biometric (fingerprint or iris) or OTP-based authentication, replacing paper-based KYC processes. With over 1.4 billion Aadhaar enrollments covering 99%+ of India's adult population, Aadhaar eKYC has become the foundational layer for onboarding users into banking, telecom, insurance, and fintech products. #definition

## How It Works

- **Authentication Modes:** Aadhaar eKYC supports three authentication modes: (1) Biometric authentication using fingerprint or iris scan via certified devices, (2) OTP-based authentication where a one-time password is sent to the Aadhaar-linked mobile number, and (3) Face authentication introduced more recently. Each mode hits UIDAI's [[Authentication]] servers via a [[REST-API]] call and returns a yes/no match plus demographic data if authorized.

- **API Flow:** A licensed Authentication User Agency (AUA) or KYC User Agency (KUA) sends an encrypted, digitally signed XML request to the Central Identities Data Repository (CIDR) via the Authentication Service Agency (ASA). The request contains the Aadhaar number and biometric/OTP data, encrypted using 2048-bit RSA keys. The response returns demographic details (name, address, date of birth, gender) and a photograph in an encrypted XML payload.

- **Consent and Privacy Architecture:** Post the 2018 Supreme Court judgment (Puttaswamy), Aadhaar eKYC requires explicit user consent. The flow mandates that businesses display a consent screen, record the consent timestamp, and retain audit logs. This aligns with [[Privacy-by-Design]] principles and anticipates the [[DPDP-Act]] requirements on purpose limitation and data minimization.

- **Offline Aadhaar and DigiLocker:** For scenarios where real-time API authentication is not feasible, UIDAI offers Offline Aadhaar (a digitally signed XML or PDF downloaded by the user from the Aadhaar portal) and DigiLocker integration. These methods reduce dependency on UIDAI servers and give users more control over their data, supporting [[Consent-Management]] principles.

- **Video KYC (V-KYC):** [[RBI]] permitted Video-based Customer Identification Process (V-CIP) as an alternative to in-person or Aadhaar eKYC. This involves a live video call with a bank official who verifies the customer's identity documents. Fintech platforms like Jupiter and Fi Money use V-KYC as a fallback when eKYC is unavailable, following [[RBI-Guidelines]].

- **India Stack Integration:** Aadhaar eKYC is part of the broader India Stack, which includes [[UPI]] for payments, DigiLocker for document storage, and eSign for digital signatures. Together, these APIs allow fully digital onboarding: verify identity (eKYC), open an account ([[UPI]]), sign documents (eSign), and store records (DigiLocker), all through [[REST-API]] calls without any physical paperwork.

## PM Implications

- **Onboarding Conversion Rates:** Aadhaar OTP-based eKYC can complete customer onboarding in under 3 minutes compared to 3-5 days for physical KYC. PMs building fintech or lending products must optimize the eKYC flow as it directly impacts conversion funnels. A 10-second delay in Aadhaar API response can drop completion rates by 15-20%. #pm-implication

- **Privacy and Compliance by Design:** PMs must implement [[Privacy-by-Design]] when using Aadhaar data. Only the minimum required demographic fields should be requested, data must be encrypted at rest using [[Encryption]] standards, and retention policies under [[Data-Retention]] must be followed. The [[DPDP-Act]] imposes additional obligations on data fiduciaries processing Aadhaar data. #pm-implication

- **Fallback and Redundancy Planning:** Aadhaar servers experience downtime and rate limiting. PMs must design fallback flows (Offline Aadhaar, DigiLocker, Video KYC) and communicate wait times clearly. The [[Authentication]] architecture should handle graceful degradation. #pm-implication

- **Regulatory Landscape Awareness:** UIDAI periodically updates API specifications, authentication charges (currently INR 20 per authentication for private entities), and compliance requirements. PMs must monitor UIDAI circulars alongside [[RBI-Guidelines]] to ensure continued compliance. #pm-implication

## Example

**PhonePe Account Opening via Aadhaar eKYC** #india-context #case-study

PhonePe, India's largest [[UPI]] app by transaction volume, uses Aadhaar OTP-based eKYC to open full-KYC wallets and enable higher transaction limits. The user enters their Aadhaar number in the app, receives an OTP on their registered mobile, and upon verification, PhonePe pulls the demographic data (name, address, DOB) from UIDAI servers. This data is encrypted and stored in compliance with [[RBI-Guidelines]] on [[Data-Localization]] within Indian data centers. The entire process takes approximately 90 seconds. Before Aadhaar eKYC, wallet KYC required a physical agent visit costing INR 150-200 per customer; eKYC reduced this to under INR 25. PhonePe processes over 5 million eKYC verifications monthly, storing consent records as mandated by [[DPDP-Act]] provisions on [[Consent-Management]].

See also: [[Session-12-Security-Privacy]]

## Related Concepts

- [[Authentication]]
- [[REST-API]]
- [[DPDP-Act]]
- [[Privacy-by-Design]]
- [[Consent-Management]]
- [[RBI-Guidelines]]
