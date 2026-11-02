---
title: Security Threats
aliases: [Cyber Threats, Attack Vectors, Cybersecurity Threats]
tags: [security, pm2, threats, risk-management]
category: Security
---

## Definition
#definition

Security threats are potential events or actions that exploit vulnerabilities in a system to compromise the confidentiality, integrity, or availability of data and services.
They range from automated technical attacks like [[SQL-Injection]] to human-targeted tactics like phishing and social engineering.
PMs must understand the threat landscape to prioritize security features in the product backlog and make informed risk trade-off decisions during [[Threat-Modeling]].

## How It Works

- **Phishing and Social Engineering**: Attackers impersonate trusted entities via email, SMS (smishing), or phone (vishing) to trick users into revealing credentials or clicking malicious links.
  Spear phishing targets specific individuals with personalized messages.
  This is the most common initial attack vector -- over 80% of breaches involve a human element.
  PMs must design UX that helps users identify legitimate communications from the product.

- **Distributed Denial of Service (DDoS)**: Attackers overwhelm a service with traffic from thousands of compromised machines (botnets), making it unavailable to legitimate users.
  Volumetric attacks can exceed hundreds of Gbps.
  PMs need to plan for DDoS mitigation (Cloudflare, AWS Shield) in infrastructure budgets and ensure [[Incident-Response]] playbooks exist for availability events.

- **Man-in-the-Middle (MITM)**: An attacker intercepts communication between two parties, reading or altering data in transit.
  This is why [[Encryption|TLS/HTTPS]] is non-negotiable.
  On unsecured Wi-Fi networks, MITM attacks are trivially easy without proper certificate pinning in mobile apps.

- **Ransomware**: Malicious software encrypts a victim's data and demands payment (usually in cryptocurrency) for the decryption key.
  The 2017 WannaCry attack affected 200,000+ computers across 150 countries.
  PMs should ensure backup and recovery features are part of the product architecture, not afterthoughts.

- **Insider Threats**: Not all threats come from outside.
  Disgruntled employees, careless contractors, or compromised internal accounts can cause massive damage.
  [[RBAC]] and the principle of least privilege are key defenses.
  PMs should design admin panels and internal tools with audit logging and access controls from day one.

## PM Implications
#pm-implication

- **Security is a product requirement, not a feature**: Threats are not hypothetical -- they are constant.
  PMs must treat security stories as first-class backlog items alongside feature development, not as tech debt to be addressed "later."
  The [[OWASP-Top-10]] provides a prioritized checklist.

- **User education is part of the product**: Phishing defenses are not purely technical.
  PMs should build in-app security prompts, suspicious login notifications, and [[Two-Factor-Authentication]] nudges.
  Slack's "this message is from outside your organization" banner is a simple but effective anti-phishing UX pattern.

- **Threat landscape shapes the roadmap**: Understanding which threats are most relevant to your domain (fintech faces different threats than edtech) allows PMs to prioritize.
  A payments product needs to worry about card skimming and [[PCI-DSS]] compliance; a social platform needs to worry about account takeover and spam bots.

- **Incident cost justifies prevention investment**: The average cost of a data breach in 2023 was USD 4.45 million globally.
  PMs can use threat data to build business cases for security investment with leadership, framing it as risk reduction rather than cost.

## Example

In April 2021, personal data of 18 crore (180 million) Domino's India customers was leaked on the dark web after a breach at Jubilant FoodWorks.
The leaked data included names, phone numbers, email addresses, delivery addresses, and payment details.
The attacker exploited a vulnerability in the company's systems and published a searchable portal where anyone could look up an individual's order history by phone number.
This breach demonstrated multiple threat categories: initial exploitation through a technical vulnerability, data exfiltration, and subsequent social engineering risk (attackers could use the leaked personal details for targeted phishing).
For PMs at food delivery and e-commerce platforms, this case underscored the need for data minimization -- do you really need to store two years of delivery addresses? -- and [[Encryption|encryption at rest]] for PII databases.

## Related Concepts

- [[OWASP-Top-10]]
- [[Encryption]]
- [[Incident-Response]]
- [[Threat-Modeling]]
- [[SQL-Injection]]
- [[Two-Factor-Authentication]]
- [[Session-11-Security-Compliance]]
