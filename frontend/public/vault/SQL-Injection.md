---
title: SQL Injection
aliases: [SQLi, SQL Injection Attack, Injection Attack]
tags: [security, pm2, owasp, vulnerability, database]
category: Security
---

## Definition
#definition

SQL Injection (SQLi) is a code injection attack where an attacker inserts malicious SQL statements into input fields or URL parameters that are directly concatenated into database queries, allowing them to read, modify, or delete data they should never access.
It has been the most prevalent web application vulnerability for over two decades and remains in the [[OWASP-Top-10]] (now under "Injection").
For PMs, SQL injection represents the canonical example of why input validation and secure coding practices must be non-negotiable requirements, not optional engineering best practices.

## How It Works

- **The Vulnerability**: When application code builds SQL queries by concatenating user input directly, an attacker can "break out" of the intended query structure.
  For example, a login form that runs `SELECT * FROM users WHERE username = '` + userInput + `'` can be exploited by entering `' OR '1'='1` as the username, which makes the query return all users and bypass [[Authentication]].

- **Types of SQL Injection**: Classic (in-band) SQLi returns data directly in the application's response.
  Blind SQLi does not show data but reveals information through application behavior (boolean-based: the page loads differently; time-based: the response is delayed by an injected `SLEEP` command).
  Out-of-band SQLi exfiltrates data through DNS or HTTP requests triggered by the database server itself.

- **Parameterized Queries (Prepared Statements)**: The primary defense.
  Instead of concatenating user input into the SQL string, the query structure is defined with placeholders, and user input is passed as parameters that the database engine treats as data, never as SQL code.
  Every modern framework supports this: `cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))` in Python, or `@Query` annotations in Java Spring.

- **Defense in Depth**: Beyond parameterized queries, teams should employ input validation (rejecting unexpected characters), least-privilege database accounts (the app's DB user should not have DROP TABLE permissions), Web Application Firewalls (WAFs) that detect and block SQLi patterns, and regular vulnerability scanning with tools like SQLMap (for testing) and Snyk (for code analysis).

- **ORM Protection**: Object-Relational Mappers like Django ORM, SQLAlchemy, or Hibernate abstract away raw SQL, making injection harder by default.
  However, ORMs that allow raw query methods can still be vulnerable if developers bypass the ORM's parameterization.
  PMs should ensure that code review processes flag raw SQL usage.

## PM Implications
#pm-implication

- **Every user input field is a potential entry point**: PMs must think beyond login forms.
  Search boxes, filters, sorting parameters, URL slugs, file upload names, HTTP headers, and even cookie values can be injection vectors.
  During story grooming, PMs should ask: "What happens if a user enters malicious content here?"
  This question alone can prevent vulnerabilities from reaching production.

- **Automated security testing belongs in the CI/CD pipeline**: PMs should advocate for static application security testing (SAST) tools that flag SQL concatenation patterns during code review, and dynamic testing (DAST) tools that probe running applications for injection vulnerabilities.
  This is a [[Threat-Modeling|shift-left security]] practice that catches issues before they ship.

- **Legacy systems are the biggest risk**: Older codebases written before parameterized queries were standard practice are often riddled with SQLi vulnerabilities.
  PMs managing legacy product migrations should ensure that security remediation is explicitly scoped and budgeted, not assumed to happen "as part of the rewrite."

- **The business impact is catastrophic**: A successful SQL injection can dump the entire database -- user credentials, payment information, personal data -- in minutes.
  This triggers [[GDPR]] and [[DPDP-Act]] breach notification obligations, regulatory fines, class-action lawsuits, and permanent brand damage.
  The cost of a parameterized query is zero; the cost of not using one can be existential.

## Example

In 2019, security researchers demonstrated that several Indian government portals (including state transport and land record systems) were vulnerable to basic SQL injection, allowing access to citizens' Aadhaar numbers, vehicle registrations, and property records.
These were not sophisticated attacks -- they used textbook injection payloads that would have been stopped by parameterized queries.
The CERT-In (Indian Computer Emergency Response Team) issued advisories, but remediation was slow due to the fragmented nature of government IT systems.
Meanwhile, the 2017 Equifax breach -- exposing personal data of 147 million Americans -- was caused by a related injection vulnerability (an unpatched Apache Struts CVE allowing remote code execution), resulting in a USD 700 million settlement.
For PMs working on govtech or public-facing systems in India, the lesson is stark: even if your product is secure, the [[SQL-Basics|database layer]] of integrated government systems may not be, and your [[Threat-Modeling|threat model]] must account for the weakest link in the chain.

## Related Concepts

- [[OWASP-Top-10]]
- [[SQL-Basics]]
- [[Security-Threats]]
- [[Threat-Modeling]]
- [[Encryption]]
- [[Session-11-Security-Compliance]]
