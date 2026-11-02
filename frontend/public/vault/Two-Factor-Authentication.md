---
title: Two-Factor Authentication
aliases: [2FA, MFA, Multi-Factor Authentication, Two-Step Verification]
tags: [security, pm2, authentication, identity, privacy]
category: Security
---

## Definition
#definition

Two-Factor Authentication (2FA), or more broadly Multi-Factor Authentication (MFA), is a security mechanism that requires users to provide two or more independent verification factors before granting access: something you know (password), something you have (phone, hardware key), or something you are (biometrics).
It dramatically reduces the risk of account compromise from stolen passwords because an attacker would need to compromise multiple independent factors simultaneously.
For PMs, 2FA is both a security requirement and a UX challenge -- balancing protection with friction.

## How It Works

- **SMS-Based OTP**: The system sends a one-time password via text message to the user's registered phone number.
  It is the most widely adopted method due to simplicity but is the weakest form of 2FA -- vulnerable to SIM-swapping attacks (where an attacker convinces the carrier to transfer the victim's number), SS7 protocol exploits, and interception.
  India's banking system relies heavily on SMS OTPs for transaction verification per RBI guidelines.

- **Time-Based One-Time Password (TOTP)**: Apps like Google Authenticator, Authy, or Microsoft Authenticator generate a 6-digit code that changes every 30 seconds, derived from a shared secret and the current time.
  TOTP is more secure than SMS because it does not traverse the telecom network.
  The shared secret is established via QR code during setup and stored locally on the device.

- **Biometric Authentication**: Fingerprint scanners, facial recognition (Face ID), iris scans, and voice recognition use physical characteristics as a factor.
  India's Aadhaar system uses fingerprint and iris biometrics for [[Authentication]] at scale.
  Biometrics are convenient but raise [[Privacy-by-Design|privacy concerns]] -- unlike passwords, you cannot change your fingerprint if it is compromised.

- **Hardware Security Keys (FIDO2/WebAuthn)**: Physical devices like YubiKey use public-key cryptography to authenticate.
  The private key never leaves the device, making phishing virtually impossible since the key only responds to the legitimate domain.
  Google reported zero successful phishing attacks on employees after mandating hardware keys in 2017.

- **Push Notifications**: Services like Duo or Microsoft Authenticator send a push notification to the user's phone asking them to approve or deny the login attempt.
  This is user-friendly but vulnerable to "MFA fatigue" attacks where attackers repeatedly trigger prompts until the user accidentally approves.
  The 2022 Uber breach exploited exactly this tactic.

## PM Implications
#pm-implication

- **2FA adoption is a funnel problem**: Mandatory 2FA improves security but adds friction that can hurt activation and retention.
  PMs must analyze the drop-off rate at 2FA setup and optimize the flow.
  Offering multiple methods (SMS as default, TOTP for power users, biometrics on mobile) lets users choose their comfort level.
  Progressive enforcement -- making 2FA optional initially, then mandatory after the user stores sensitive data -- is a proven pattern.

- **Recovery flows are as critical as setup flows**: What happens when a user loses their phone?
  PMs must design recovery mechanisms -- backup codes, secondary email verification, identity verification via support -- that are secure enough to prevent social engineering but accessible enough to prevent permanent lockout.
  Recovery flow design is a top [[OWASP-Top-10]] concern.

- **Regulatory mandates are accelerating 2FA adoption**: RBI mandates OTP for online transactions above a threshold.
  [[GDPR]] and [[DPDP-Act]] require "appropriate technical measures" for data protection, which increasingly means MFA for accounts holding personal data.
  PMs in regulated industries do not get to choose whether to implement 2FA -- only how.

- **2FA is a trust signal for enterprise buyers**: B2B SaaS products without MFA support are increasingly disqualified from enterprise procurement.
  [[SOC-2]] and [[ISO-27001]] audits check for MFA enforcement on admin and privileged accounts.
  PMs should ensure MFA is available at launch for enterprise tiers, not added as a post-launch afterthought.

## Example

India's Aadhaar-based eKYC system is one of the world's largest deployments of multi-factor authentication.
When a customer opens a bank account using Aadhaar eKYC, the flow combines something you know (Aadhaar number), something you have (the registered mobile number for OTP), and something you are (fingerprint or iris scan verified against the UIDAI biometric database).
This three-factor approach processed over 2 billion authentications annually as of 2023.
However, the system also highlighted 2FA challenges at scale: rural areas with poor connectivity face OTP delivery failures, elderly users struggle with biometric readers (worn fingerprints), and the centralized biometric database itself became a [[Security-Threats|security concern]] after data exposure incidents.
For PMs building on India Stack, designing graceful fallback flows (e.g., offline Aadhaar XML-based verification when OTP fails) is as important as the primary [[Authentication]] path.

## Related Concepts

- [[Authentication]]
- [[OAuth]]
- [[OWASP-Top-10]]
- [[RBAC]]
- [[Security-Threats]]
- [[Session-12-Security-Privacy]]
