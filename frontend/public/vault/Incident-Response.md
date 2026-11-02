---
title: Incident Response
aliases: [IR, Breach Response, Security Incident Management, Incident Handling]
tags: [security, pm2, operations, risk-management, compliance]
category: Security Operations
---

## Definition
#definition

Incident response (IR) is the organized approach to detecting, containing, eradicating, and recovering from a security breach or cyberattack.
It is a predefined playbook that ensures teams act swiftly and methodically rather than panicking when a [[Security-Threats|security incident]] occurs.
For PMs, understanding IR is essential because product decisions -- logging, [[Monitoring]], user notification flows, and data architecture -- directly determine how quickly and effectively the organization can respond to a breach.

## How It Works

- **Phase 1 -- Preparation**: Before any incident occurs, the team establishes IR policies, assembles a cross-functional incident response team (engineering, security, legal, communications, PM), sets up [[Monitoring]] and alerting tools (SIEM systems like Splunk or Datadog), and conducts tabletop exercises.
  PMs contribute by ensuring the product has adequate audit logging and that user notification templates exist.

- **Phase 2 -- Detection and Analysis**: The team identifies that an incident is occurring through alerts, anomaly detection, user reports, or threat intelligence feeds.
  This phase involves triaging severity -- is it a minor vulnerability disclosure or an active data exfiltration?
  The speed of detection depends on the [[Monitoring]] infrastructure the PM helped prioritize in the roadmap.

- **Phase 3 -- Containment**: Short-term containment stops the bleeding -- isolating compromised servers, revoking leaked API keys, blocking malicious IPs, or forcing password resets.
  Long-term containment involves deploying temporary fixes that allow business operations to continue while a permanent solution is developed.
  PMs may need to approve feature degradation (e.g., temporarily disabling third-party integrations) during this phase.

- **Phase 4 -- Eradication and Recovery**: The root cause is identified and eliminated -- patching the vulnerability, removing malware, rotating all credentials.
  Systems are restored from clean backups and monitored closely for signs of re-compromise.
  Recovery includes verifying data integrity and gradually restoring full service.

- **Phase 5 -- Post-Incident Review (Blameless Postmortem)**: The team documents what happened, what went well, what failed, and what changes are needed.
  This feeds directly into the product backlog as security improvements.
  The [[GDPR]] and [[DPDP-Act]] require documented incident reports within specific timeframes (72 hours for GDPR).

## PM Implications
#pm-implication

- **PMs own the user communication during incidents**: When a breach affects users, the PM must coordinate with legal and communications on what to disclose, when, and how.
  [[GDPR]] mandates notifying affected users "without undue delay."
  Having pre-drafted notification templates and an in-app banner system is a product feature that pays for itself during a crisis.

- **Logging and observability are PM-driven priorities**: If your product does not log authentication events, API access patterns, and data modifications, the IR team is flying blind during detection and analysis.
  PMs must ensure logging infrastructure is in the roadmap, not treated as pure engineering overhead.
  [[Monitoring]] capabilities directly determine mean time to detect (MTTD).

- **Incident response readiness affects enterprise sales**: Enterprise buyers and [[SOC-2]] auditors ask for your IR plan, your last tabletop exercise date, and your mean time to respond (MTTR).
  PMs at B2B SaaS companies should treat IR maturity as a sales enablement asset and ensure the security page on the website reflects real capabilities.

- **Postmortems feed the backlog**: Every incident reveals product and architecture gaps.
  PMs should participate in postmortems and translate findings into prioritized stories.
  The Equifax breach postmortem revealed that an unpatched Apache Struts vulnerability sat in the backlog for months -- a PM prioritization failure with USD 700 million in consequences.

## Example

In 2018, British Airways suffered a breach where attackers injected malicious JavaScript (a Magecart-style attack) into the airline's payment page, skimming credit card details of approximately 380,000 customers over two weeks.
The IR timeline revealed failures at multiple phases: detection took 15 days because the monitoring systems did not flag the injected script, containment was slow because the team initially could not identify the compromised component, and user notification was delayed.
The UK's Information Commissioner's Office (ICO) initially proposed a GBP 183 million fine under [[GDPR]] (later reduced to GBP 20 million).
For PMs, the lesson is that payment flows require [[Encryption|subresource integrity checks]], Content Security Policy headers, and real-time script monitoring -- these are product requirements, not DevOps nice-to-haves.
In the Indian context, the RBI's 2021 directive mandating tokenization of card data was partly a regulatory response to similar payment breach risks, making IR preparedness a [[Compliance-Frameworks|compliance]] obligation for fintech PMs.

## Related Concepts

- [[Monitoring]]
- [[Security-Threats]]
- [[Uptime]]
- [[OWASP-Top-10]]
- [[Compliance-Frameworks]]
- [[Session-11-Security-Compliance]]
