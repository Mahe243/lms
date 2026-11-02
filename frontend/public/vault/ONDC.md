---
title: Open Network for Digital Commerce (ONDC)
aliases:
  - ONDC
  - Open Network for Digital Commerce
tags:
  - pm2
  - india-context
  - fintech
  - e-commerce
  - open-protocol
  - digital-infrastructure
category: India Digital Infrastructure
---

## Definition

ONDC (Open Network for Digital Commerce) is an Indian government-backed initiative to create an open, interoperable protocol for digital commerce, aiming to democratize e-commerce the way [[UPI]] democratized payments. Instead of closed platforms like Amazon or Flipkart where buyers and sellers are locked into one marketplace, ONDC enables any buyer app to discover products from any seller app across the network. Built on the Beckn Protocol, ONDC uses [[REST-API]] standards and [[Microservices-Architecture]] to unbundle the e-commerce stack into interoperable layers. #definition

## How It Works

- **Beckn Protocol Foundation:** ONDC is built on the open-source Beckn Protocol, which defines standard API contracts for search, discovery, ordering, fulfillment, and post-purchase actions. Each action (search, select, init, confirm, status, track, cancel, update) has a defined [[REST-API]] schema. Buyer apps and seller apps communicate through these standardized endpoints via the ONDC gateway, which acts as a registry and routing layer.

- **Unbundled Architecture:** Traditional e-commerce bundles discovery, ordering, payments, logistics, and customer service into one platform. ONDC unbundles these into independent network participants: Buyer Network Participants (BNPs) handle the demand side, Seller Network Participants (SNPs) handle supply, and Logistics Service Providers (LSPs) handle delivery. Each participant exposes APIs conforming to the Beckn specification.

- **Registry and Gateway:** The ONDC Registry maintains a directory of all network participants with their API endpoints, signing keys, and supported domains (retail, food, mobility, logistics). The ONDC Gateway broadcasts search queries from buyer apps to relevant seller apps based on domain and location. Responses are aggregated and returned to the buyer app.

- **Domain Expansion:** ONDC started with food delivery and grocery but has expanded to fashion, electronics, home services, mobility (auto and cab rides), agriculture, and B2B wholesale. Each domain has its own taxonomy and fulfillment specifications, while sharing the common protocol layer.

- **Trust and Settlement:** ONDC uses a network-level dispute resolution framework and a settlement mechanism through NPCI and banking partners. Digital signatures using RSA/Ed25519 keys authenticate every API call between participants, ensuring non-repudiation. Payment settlement follows [[RBI-Guidelines]] on escrow and marketplace payments.

- **Catalog and Discovery Standards:** ONDC mandates standardized product catalogs with defined schemas for attributes like pricing, images, availability, and location. Seller apps must publish catalogs in ONDC's format, enabling cross-platform search. This standardization is analogous to how [[UPI]] standardized the payment message format, allowing any app to process any transaction.

## PM Implications

- **Platform-Agnostic Product Thinking:** PMs building e-commerce products must evaluate whether to participate in ONDC alongside or instead of traditional marketplaces. ONDC reduces dependency on a single platform's policies and commission structures, but introduces integration complexity. #pm-implication

- **API-First Integration Strategy:** Joining ONDC requires implementing the Beckn Protocol's full [[REST-API]] suite. PMs must plan for catalog synchronization, real-time inventory updates, order status callbacks (similar to [[Webhooks]]), and multi-participant coordination. Understanding [[API-Authentication]] and digital signatures is essential. #pm-implication

- **Solving for Discovery:** On closed platforms, the marketplace controls search ranking. On ONDC, seller apps must optimize their catalog data (descriptions, images, pricing, location) for cross-network discoverability. PMs must design catalog management tools that work across ONDC's open taxonomy. #pm-implication

- **Interoperability as Competitive Advantage:** ONDC rewards interoperability over lock-in. PMs familiar with [[UPI]]'s success can apply similar lessons: building on open standards creates ecosystem value that benefits all participants and grows the overall market. #pm-implication

## Example

**Magicpin on ONDC for Hyperlocal Food Delivery** #india-context #case-study

Magicpin, originally a local deals and rewards platform, joined ONDC as a Buyer Network Participant to offer food delivery. Instead of building a supply-side network from scratch (which took Zomato and Swiggy years), Magicpin accesses restaurants already listed on ONDC through seller apps like Sellerapp and Uengage. A user searching for biryani on Magicpin sees results from multiple seller apps, with prices often 10-20% lower than Zomato/Swiggy because ONDC's commission structure (approximately 3-5%) is significantly lower than traditional aggregator commissions (25-35%). The order flow uses Beckn Protocol [[REST-API]] calls: `/search` broadcasts to the gateway, `/on_search` returns catalog results, `/select` and `/init` build the cart, and `/confirm` places the order. Fulfillment is handled by a separate LSP integrated via the same protocol. This architecture mirrors [[UPI]]'s interoperability model applied to commerce.

See also: [[Session-12-Security-Privacy]]

## Key Metrics

- **Live Cities:** Over 1,000 cities and towns across India
- **Domains Active:** Retail (grocery, fashion, electronics), food delivery, mobility, logistics, B2B wholesale
- **Network Participants:** Over 500,000 sellers onboarded across buyer and seller apps
- **Government Target:** 25% of India's e-commerce transactions via ONDC by 2027

## Related Concepts

- [[REST-API]]
- [[Microservices-Architecture]]
- [[UPI]]
- [[API-Authentication]]
- [[Webhooks]]
- [[RBI-Guidelines]]
