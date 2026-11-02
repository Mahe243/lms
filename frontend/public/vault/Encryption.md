---
title: Encryption
aliases: [Cryptography, Data Encryption, TLS, SSL]
tags: [security, pm2, encryption, privacy, compliance]
category: Security
---

## Definition
#definition

Encryption is the process of converting plaintext data into an unreadable format (ciphertext) using a mathematical algorithm and a key, ensuring that only authorized parties with the correct decryption key can access the original information.
It is the foundational building block of all modern [[Security-Threats|security]] mechanisms, protecting data both while stored and while moving across networks.
Every PM building a product that handles user data must understand encryption basics to make informed [[Privacy-by-Design]] decisions.

## How It Works

- **Symmetric Encryption**: Uses a single shared key for both encryption and decryption (e.g., AES-256).
  It is fast and efficient for encrypting large volumes of data at rest, such as database contents or file storage.
  The challenge is securely distributing the shared key to all parties.

- **Asymmetric Encryption**: Uses a key pair -- a public key for encryption and a private key for decryption (e.g., RSA, ECC).
  This solves the key distribution problem since the public key can be shared openly.
  It is computationally heavier, so it is typically used for initial key exchange and digital signatures rather than bulk data encryption.

- **Encryption At Rest**: Protects stored data on disks, databases, and backups.
  If a server is physically stolen or a database dump is leaked, encrypted-at-rest data remains unreadable without the decryption key.
  AWS S3 server-side encryption and Azure Disk Encryption are common implementations.

- **Encryption In Transit**: Protects data as it moves between client and server, or between microservices.
  [[HTTP-Protocol|HTTPS]] uses TLS (Transport Layer Security, the successor to SSL) to create an encrypted tunnel.
  TLS uses asymmetric encryption for the handshake and then switches to symmetric encryption for the session data.

- **TLS/SSL Handshake**: The client and server negotiate a cipher suite, the server presents its digital certificate (verified against a Certificate Authority), and both sides agree on a symmetric session key.
  This hybrid approach combines the security of asymmetric key exchange with the speed of symmetric data transfer.

## PM Implications
#pm-implication

- **Regulatory compliance demands it**: [[GDPR]], [[DPDP-Act]], [[PCI-DSS]], and [[ISO-27001]] all mandate encryption for sensitive data.
  A PM shipping without encryption is shipping a compliance liability.
  During PRDs, specify whether data needs encryption at rest, in transit, or both.

- **Performance trade-offs matter**: Encryption adds CPU overhead and latency.
  PMs must work with engineering to choose the right cipher strength -- AES-128 may suffice for low-sensitivity data, while financial or health data warrants AES-256.
  Over-encrypting everything can degrade user experience.

- **Key management is the hard part**: The encryption algorithm is rarely the weak link; poor key management is.
  PMs should ensure the product roadmap includes a key management service (KMS) integration and key rotation policies, not just "encrypt everything."

- **End-to-end encryption (E2EE) is a product differentiator**: WhatsApp's adoption of E2EE became a marketing advantage.
  PMs in messaging, healthtech, or fintech should evaluate whether E2EE is a feature that drives user trust and adoption, or whether it conflicts with content moderation obligations per [[Compliance-Frameworks]].

## Example

During the 2018 Aadhaar data breach, researchers found that the Aadhaar database -- containing biometric and demographic data of over 1.1 billion Indian citizens -- was accessible through improperly secured API endpoints.
While UIDAI maintained that the core biometric data was encrypted with 2048-bit RSA keys, the demographic data transmitted through partner systems lacked consistent encryption in transit.
This incident led to the Indian Supreme Court mandating stronger encryption requirements and directly influenced provisions in the [[DPDP-Act|Digital Personal Data Protection Act]].
For PMs at identity platforms, the lesson is clear: encrypting the crown jewels is not enough -- every data pathway and every partner integration must enforce encryption standards.

## Related Concepts

- [[HTTP-Protocol]]
- [[OWASP-Top-10]]
- [[Authentication]]
- [[Security-Threats]]
- [[PCI-DSS]]
- [[Privacy-by-Design]]
- [[Session-11-Security-Compliance]]
