---
title: OAuth
aliases:
  - OAuth 2.0
  - Open Authorization
  - OAuth2
tags:
  - pm2
  - security
  - api
  - web-fundamentals
  - authentication
category: Security & Authentication
---

## Definition
#definition

OAuth (Open Authorization) is an open standard protocol that allows users to grant third-party applications limited access to their resources on another service without sharing their passwords. OAuth 2.0, the current version, is the industry standard for delegated authorization and powers "Login with Google/Facebook/Apple" flows, API access tokens, and machine-to-machine authentication. It is distinct from [[Authentication]] (proving who you are) -- OAuth is about authorization (what you are allowed to do).

## How It Works

- **Roles in OAuth 2.0**: Four parties interact: the **Resource Owner** (user), the **Client** (third-party app), the **Authorization Server** (issues tokens, e.g., Google's auth server), and the **Resource Server** (holds protected data, e.g., Google Calendar API). The separation of authorization server and resource server is what makes OAuth scalable for platform ecosystems.

- **Authorization Code flow** (most common for web apps): The client redirects the user to the authorization server's login page. After the user authenticates and consents, the authorization server redirects back with a short-lived authorization code. The client exchanges this code (plus its own client secret) for an access token and a refresh token. The access token is used in [[REST-API]] calls via [[API-Authentication]] headers.

- **Access tokens and refresh tokens**: Access tokens are short-lived (minutes to hours) and grant specific permissions (scopes). Refresh tokens are long-lived and used to obtain new access tokens without re-prompting the user. This separation limits damage if an access token is leaked. Tokens are often implemented as [[JWT-Authentication]] (JSON Web Tokens).

- **Scopes**: OAuth scopes define the specific permissions granted (e.g., `read:email`, `write:calendar`, `repo:public`). When a user sees "This app wants to access your email and calendar," they are seeing the requested scopes. PMs must carefully design scopes to request only the minimum access needed -- over-requesting scopes reduces user trust and consent rates.

- **Other grant types**: OAuth 2.0 supports multiple flows for different contexts: **Client Credentials** for machine-to-machine (no user involved), **Device Code** for smart TVs and IoT devices without keyboards, and **PKCE (Proof Key for Code Exchange)** for mobile and single-page apps where a client secret cannot be safely stored.

## PM Implications
#pm-implication

- **OAuth enables platform strategy**: If your product wants third-party developers to build integrations (like Slack apps, Shopify plugins, or [[GitHub]] Actions), you need an OAuth provider. PMs driving platform and marketplace strategies must understand OAuth well enough to design scope hierarchies, consent screens, and developer onboarding flows for [[API-Documentation]].

- **Consent UX directly affects conversion**: The OAuth consent screen is a critical conversion point. Users who see too many permission requests (broad scopes) will abandon the flow. PMs must audit requested scopes against actual product needs and implement incremental authorization -- requesting additional scopes only when the user triggers a feature that needs them.

- **Security incidents from OAuth misconfiguration are high-impact**: Poorly implemented OAuth (e.g., not validating redirect URIs, accepting tokens from the wrong issuer) is a common source of account takeover vulnerabilities. PMs should ensure security reviews are part of the [[API-Lifecycle]] for any OAuth integration.

- **Social login reduces friction but creates dependency**: Offering "Sign in with Google" via OAuth reduces signup friction (no password to create), but creates [[Vendor-Lock-In]] -- if Google changes its OAuth policies or the user loses their Google account, access to your product is affected. PMs should offer multiple OAuth providers and an email/password fallback.

## Example

**DigiLocker and Aadhaar OAuth (India context)**: India's DigiLocker platform uses an OAuth-like consent framework to allow third-party services to access government-issued documents (Aadhaar, PAN, driving license) stored in a user's digital locker. When a fintech company like Groww or Zerodha needs to verify a user's PAN for KYC (Know Your Customer), the user is redirected to DigiLocker's consent page, where they authorize sharing their PAN document. DigiLocker then provides a verified document token to the fintech app -- the app never sees the user's DigiLocker password. This is a classic OAuth pattern: delegated authorization with user consent and scoped access. PMs at fintech companies track the DigiLocker OAuth consent completion rate as a key metric in their onboarding funnel, because every drop-off at consent means a lost user who must fall back to manual document upload.

## OAuth 2.0 Grant Types Summary

| Grant Type | Use Case | User Involved? |
|---|---|---|
| **Authorization Code** | Web apps, server-side | Yes -- user logs in and consents |
| **Authorization Code + PKCE** | Mobile apps, SPAs (no client secret) | Yes |
| **Client Credentials** | Machine-to-machine [[REST-API]] calls | No -- service account |
| **Device Code** | Smart TVs, IoT, CLI tools | Yes -- user approves on another device |
| **Refresh Token** | Renewing expired access tokens | No -- silent background refresh |

PMs building products that integrate with third-party services should understand which grant type applies to their use case, as it determines the user experience during [[API-Authentication]] setup.

## Related Concepts

- [[Authentication]]
- [[JWT-Authentication]]
- [[API-Authentication]]
- [[Vendor-Lock-In]]
- [[REST-API]]
- [[Session-04-APIs-Integrations]]
