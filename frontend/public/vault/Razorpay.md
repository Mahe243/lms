---
title: Razorpay
aliases:
  - Razorpay
  - Razorpay Payment Gateway
tags:
  - pm2
  - india-context
  - fintech
  - payments
  - api-integration
category: India Fintech Platforms
---

## Definition

Razorpay is India's leading full-stack payment gateway and financial services platform that enables businesses to accept, process, and disburse payments through its suite of APIs. Founded in 2014, it processes payments across [[UPI]], cards, net banking, wallets, and EMI options, serving over 8 million businesses. Razorpay exemplifies API-first product design, offering developers clean [[REST-API]] endpoints, [[Webhooks]] for event-driven notifications, and SDKs across multiple platforms. #definition

## How It Works

- **API-Driven Integration:** Merchants integrate Razorpay using its [[REST-API]] with API key authentication. The standard flow involves creating an Order (server-side), opening the Checkout form (client-side), and verifying payment signatures (server-side). Every interaction is stateless and follows RESTful conventions with JSON request/response payloads.

- **Payment Processing Pipeline:** When a customer initiates payment, Razorpay's gateway routes the transaction to the appropriate payment network (NPCI for [[UPI]], card networks for cards, bank servers for net banking). The gateway handles retries, fallback routing, and 3D Secure authentication for cards, abstracting complexity from merchants.

- **Webhook Event System:** Razorpay uses [[Webhooks]] to notify merchant servers of asynchronous events like `payment.captured`, `payment.failed`, `refund.processed`. Each webhook payload includes an HMAC signature for verification, ensuring authenticity. This event-driven pattern is critical because payment outcomes are inherently asynchronous.

- **PCI-DSS Compliance:** Razorpay is [[PCI-DSS]] Level 1 certified, meaning it handles card data storage and processing. Merchants using Razorpay's hosted checkout never touch raw card numbers, reducing their own compliance burden from SAQ-D to SAQ-A. Tokenization of card data follows [[RBI-Guidelines]] mandated since October 2022.

- **RazorpayX and Banking Stack:** Beyond payments, RazorpayX offers business banking APIs for payouts, vendor payments, payroll, and tax payments. This positions Razorpay as a neo-banking platform, competing with traditional banks on developer experience and API quality.

- **Dashboard and Analytics:** Razorpay provides a merchant dashboard with real-time transaction analytics, settlement tracking, dispute management, and refund processing. The dashboard exposes the same data available through [[REST-API]] endpoints, allowing PMs to build custom reporting on top of Razorpay's data infrastructure. Razorpay also offers Razorpay Optimizer, an AI-powered routing engine that improves payment success rates by selecting the optimal payment gateway for each transaction.

## PM Implications

- **Build vs Buy for Payments:** PMs must evaluate whether to build payment infrastructure in-house or use Razorpay's APIs. Understanding [[REST-API]] design patterns and [[API-Authentication]] helps PMs evaluate integration complexity and total cost of ownership. #pm-implication

- **Conversion Optimization:** Razorpay's Smart Checkout uses ML to predict the customer's preferred payment method and reorder options accordingly. PMs should understand how payment UX directly impacts conversion rates, which can vary 15-30% based on checkout design. #pm-implication

- **Compliance Delegation:** By using Razorpay, PMs effectively delegate [[PCI-DSS]] compliance and [[Data-Privacy]] responsibilities for payment data. However, PMs must still ensure their application handles Razorpay's [[Webhooks]] securely and stores only tokenized references. #pm-implication

- **Regulatory Awareness:** [[RBI]] mandates on data localization, card tokenization, and recurring payment guidelines directly affect Razorpay's feature set. PMs must track [[RBI-Guidelines]] changes because they cascade into API changes and product capability shifts. #pm-implication

## Example

**Razorpay Route for Marketplace Payments** #india-context #case-study

Dunzo, the Indian hyperlocal delivery platform, uses Razorpay Route to split payments automatically between merchants, delivery partners, and the platform. When a customer pays INR 500 for a grocery delivery, Razorpay Route API splits the payment: INR 350 to the store, INR 100 to the delivery partner, and INR 50 as Dunzo's commission. This is done via the Transfers API with `"on_hold": true` and a settlement schedule, ensuring [[RBI-Guidelines]] on marketplace escrow are met. The Route API handles TDS deduction at source and generates compliant invoices. Without this, Dunzo would need to build a complex settlement engine handling [[UPI]], card, and wallet payments separately.

See also: [[Session-12-Security-Privacy]]

## Key Metrics

- **Merchants Served:** Over 8 million businesses
- **Annual Payment Volume:** Over USD 150 billion processed
- **Valuation:** USD 7.5 billion (as of last funding round)
- **Payment Methods Supported:** UPI, credit/debit cards, net banking, wallets, EMI, PayLater, international cards

## Related Concepts

- [[UPI]]
- [[REST-API]]
- [[Webhooks]]
- [[PCI-DSS]]
- [[API-Authentication]]
- [[RBI-Guidelines]]
