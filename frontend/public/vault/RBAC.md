---
title: RBAC
aliases: [Role-Based Access Control, Role Based Access Control, Access Control]
tags: [security, pm2, authorization, access-control, compliance]
category: Security
---

## Definition
#definition

Role-Based Access Control (RBAC) is an authorization model where permissions are assigned to roles (e.g., Admin, Editor, Viewer) rather than directly to individual users, and users are then assigned to roles.
This abstraction simplifies permission management at scale -- when a new employee joins, the administrator assigns a role rather than configuring dozens of individual permissions.
For PMs, RBAC is fundamental to [[Authorization]] design decisions that affect user experience, security posture, and [[Compliance-Frameworks|compliance]] readiness.

## How It Works

- **Roles and Permissions**: A role is a named collection of permissions.
  For example, an "Editor" role in a CMS might include permissions to create, read, and update articles, but not delete them or manage users.
  Permissions are granular actions on resources: `article:read`, `article:write`, `user:manage`.
  The PM defines what roles exist in the product based on user personas and organizational structures.

- **User-Role Assignment**: Users are mapped to one or more roles.
  In simple systems, each user has exactly one role.
  In complex enterprise products, a user may have different roles in different contexts -- a project manager in Workspace A and a viewer in Workspace B.
  This is called scoped RBAC and is common in multi-tenant SaaS products.

- **Role Hierarchy**: Some RBAC implementations support inheritance -- an Admin role inherits all permissions of the Editor role, which inherits all permissions of the Viewer role.
  This reduces duplication and makes the permission model easier to reason about.
  However, deep hierarchies can become hard to audit.

- **Principle of Least Privilege**: RBAC enforces the security principle that users should have only the minimum permissions needed to perform their job.
  A support agent should not have database admin access.
  A marketing intern should not be able to deploy code.
  Violations of this principle are a top finding in [[SOC-2]] audits and a common cause of [[Security-Threats|insider threat incidents]].

- **Attribute-Based Access Control (ABAC)**: An evolution of RBAC where access decisions consider attributes beyond roles -- user department, resource sensitivity level, time of day, IP location.
  For example, "Allow access to payroll data only for HR role AND only from the office network AND only during business hours."
  ABAC is more flexible but more complex to implement and audit.

## PM Implications
#pm-implication

- **Role design is product design**: The roles you define shape how organizations use your product.
  Too few roles (only Admin and User) force customers into insecure workarounds -- giving everyone Admin access because User is too restrictive.
  Too many roles create configuration complexity.
  PMs should research how target customers' organizational structures map to product roles and iterate based on customer feedback.

- **RBAC is table stakes for enterprise sales**: Enterprise customers expect customizable roles and permissions.
  "Can we create custom roles?" is a common procurement question.
  [[SOC-2]] and [[ISO-27001]] auditors will verify that your product enforces least privilege.
  PMs at B2B SaaS companies should plan for custom role support in the roadmap early -- retrofitting RBAC onto a flat permission model is expensive.

- **Audit logging must accompany RBAC**: It is not enough to enforce permissions -- you must log who did what, when, and under which role.
  This audit trail is required by [[Compliance-Frameworks]] and is invaluable during [[Incident-Response]].
  PMs should ensure that role changes and permission exercises are logged and exportable.

- **RBAC impacts onboarding and adoption**: If setting up roles is a 30-minute configuration task before a team can start using the product, you have a time-to-value problem.
  PMs should design sensible default roles that work out of the box, with customization available for advanced users.
  Notion's default roles (Workspace Owner, Member, Guest) are a good example of simple defaults that cover most use cases.

## Example

Razorpay, India's leading payment gateway, implements a granular RBAC system in its merchant dashboard.
A typical merchant organization has distinct roles: the business owner needs full access including settlement and refund controls; the finance team needs read access to transactions and payouts but cannot change API keys; the development team needs API key access and webhook configuration but should not process manual refunds; and the support team can view transaction details and initiate refunds within a threshold but cannot access API credentials or bank account settings.
This role structure maps directly to real organizational needs and satisfies [[PCI-DSS]] requirements for access control to payment data.
When Razorpay introduced custom roles, enterprise adoption accelerated because organizations could create roles like "Franchise Manager" (view only their franchise's transactions) -- a direct example of RBAC unlocking a market segment.
PMs at fintech platforms should design their role matrix by shadowing how different personas within a merchant's organization actually use the dashboard.

## Related Concepts

- [[Authorization]]
- [[Authentication]]
- [[OWASP-Top-10]]
- [[Two-Factor-Authentication]]
- [[SOC-2]]
- [[Session-11-Security-Compliance]]
