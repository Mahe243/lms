---
title: Threat Modeling
aliases: [Threat Analysis, STRIDE, Attack Surface Analysis]
tags: [security, pm2, design, risk-management]
category: Security
---

## Definition
#definition

Threat modeling is a structured approach to identifying, quantifying, and addressing potential security threats to a system during the design phase, before code is written.
It involves systematically analyzing the architecture to find attack surfaces -- points where an unauthorized user could try to enter or extract data.
For PMs, threat modeling is the security equivalent of user story mapping: it forces you to think about how things can go wrong before you build, rather than patching after a breach.

## How It Works

- **STRIDE Framework**: Developed by Microsoft, STRIDE categorizes threats into six types:
  **S**poofing (impersonating a user or system),
  **T**ampering (modifying data in transit or at rest),
  **R**epudiation (denying an action without proof),
  **I**nformation Disclosure (data leaks),
  **D**enial of Service (making systems unavailable), and
  **E**levation of Privilege (gaining unauthorized access levels).
  PMs can use STRIDE as a checklist during design reviews to ensure each category is addressed.

- **Identifying Attack Surfaces**: An attack surface includes every point where data enters or leaves the system -- APIs, user input forms, file uploads, third-party integrations, admin panels, and even error messages that leak system details.
  The larger the attack surface, the more opportunities an attacker has.
  PMs should push for API minimalism and question whether each endpoint is truly necessary.

- **Data Flow Diagrams (DFDs)**: The team maps how data moves through the system -- from user input, through services, to databases, and back.
  Each boundary crossing (e.g., from the public internet to an internal service) is a trust boundary where [[Encryption]] and [[Authentication]] checks must occur.
  DFDs make abstract architectures concrete and auditable.

- **Risk Prioritization**: Not all threats are equal.
  Teams use a risk matrix (likelihood x impact) to prioritize which threats to mitigate first.
  A low-probability but catastrophic threat (e.g., full database breach) may warrant more investment than a high-probability but low-impact one (e.g., a UI-based information leak).

- **Shift-Left Security**: Threat modeling embodies the "shift-left" philosophy -- catching [[Security-Threats|security issues]] earlier in the SDLC when they are cheaper to fix.
  A vulnerability found during design costs 6x less to fix than one found in production, according to IBM's Systems Sciences Institute.

## PM Implications
#pm-implication

- **PMs should participate in threat modeling sessions**: You do not need to be a security engineer, but PMs bring critical context about user personas, data sensitivity, and business impact.
  When the team asks "what happens if this data leaks?", the PM is best positioned to answer in terms of user trust, regulatory fines, and brand damage.

- **Threat models inform the backlog**: The output of a threat modeling session is a prioritized list of risks and mitigations.
  These translate directly into security-focused user stories: "As a system, I must validate all input to prevent [[SQL-Injection]]" or "As an admin, I need [[RBAC]] so that support agents cannot access payment data."

- **Design decisions have security consequences**: Choosing between a monolithic and microservice architecture, between server-side and client-side rendering, or between first-party [[Authentication]] and [[OAuth]] -- each has different attack surfaces.
  PMs who understand this can ask better questions during architecture discussions.

- **Third-party integrations expand the attack surface**: Every SDK, payment gateway, analytics tool, or partner API is a potential entry point.
  PMs should require security reviews for new integrations and ensure [[Compliance-Frameworks|compliance requirements]] flow through to vendors via contractual obligations.

## Example

When NPCI designed the UPI (Unified Payments Interface) system, threat modeling was critical given the scale (processing billions of transactions monthly) and the sensitivity of financial data.
The design team mapped data flows between the payer's bank app, NPCI's switching infrastructure, and the payee's bank, identifying trust boundaries at each handoff.
STRIDE analysis revealed risks like spoofing (someone impersonating a UPI ID), tampering (altering transaction amounts mid-flow), and information disclosure (leaking account balances).
This led to design decisions including device binding for the UPI PIN, end-to-end [[Encryption]] of transaction payloads, and mandatory [[Two-Factor-Authentication]] for every payment.
PMs at fintech startups building on UPI should conduct their own threat models for the layers they control -- their app's local storage, session management, and deep-link handling are their attack surface even if UPI's core is secure.

## Related Concepts

- [[OWASP-Top-10]]
- [[Security-Threats]]
- [[Privacy-by-Design]]
- [[SQL-Injection]]
- [[Incident-Response]]
- [[Session-11-Security-Compliance]]
