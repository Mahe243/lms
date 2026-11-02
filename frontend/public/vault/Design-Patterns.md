---
title: Design Patterns
aliases:
  - Software Design Patterns
  - MVC Pattern
  - Architectural Patterns
tags:
  - pm2
  - web-fundamentals
  - backend
  - architecture
  - software-engineering
category: Architecture & Design
---

## Definition
#definition

Design Patterns are reusable, proven solutions to common problems in software design. Popularized by the "Gang of Four" book, they provide a shared vocabulary for developers to describe architectural decisions -- patterns like MVC (Model-View-Controller), Observer, Singleton, and Factory. For PMs, design patterns matter because they shape how a product's codebase is organized, how easy it is to extend with new features, and how much [[Technical-Debt]] accumulates over time.

## How It Works

- **MVC (Model-View-Controller)**: The most widely referenced pattern. The **Model** manages data and business logic, the **View** handles the UI presentation ([[DOM]], templates), and the **Controller** processes user input and coordinates between Model and View. Most [[Frontend-Frameworks]] (React, Angular) and [[Backend-Languages]] frameworks (Rails, Django, Spring) are built on variations of MVC. This separation of concerns allows frontend and backend teams to work independently.

- **Observer pattern**: An object (the "subject") maintains a list of dependents ("observers") and notifies them of state changes. This is the backbone of reactive programming, event-driven architectures, and real-time features. When a user updates their cart on Flipkart and the cart icon updates simultaneously, the Observer pattern is at work. It is also the basis for pub/sub messaging in [[Microservices-Architecture]].

- **Singleton pattern**: Ensures a class has only one instance and provides a global access point to it. Common use cases include database connection pools, configuration managers, and logging services. While useful, overuse of Singletons creates tight coupling and makes testing difficult -- a common source of [[Technical-Debt]].

- **Factory pattern**: Instead of directly instantiating objects with `new`, a factory method creates objects based on input parameters. This is heavily used in payment processing systems -- a `PaymentProcessorFactory` might return a Razorpay processor, a Stripe processor, or a UPI processor based on the user's chosen method, without the calling code knowing the implementation details.

- **Repository pattern**: Abstracts the data access layer so that business logic does not depend on whether data comes from a SQL database, a NoSQL store, a [[REST-API]], or an in-memory cache. This pattern makes it easier to swap out databases (e.g., migrating from MySQL to PostgreSQL) without rewriting business logic -- reducing [[Vendor-Lock-In]] at the data layer.

## PM Implications
#pm-implication

- **Patterns affect feature velocity**: A well-patterned codebase (clear MVC separation, factory abstractions for integrations) allows engineers to add new features by extending existing patterns rather than writing from scratch. When a PM hears "adding a new payment method will take 3 weeks," the underlying question is whether the code uses a factory/strategy pattern (add a new class) or hardcoded conditionals (rewrite the payment flow).

- **Pattern misuse creates technical debt**: Over-engineering with unnecessary patterns (a Singleton where a simple function works, an Abstract Factory for a system with one implementation) adds complexity without value. PMs should be wary when engineering proposes refactoring to adopt a pattern -- ask what concrete problem it solves and what the cost of not doing it is.

- **Architecture reviews should reference patterns**: When evaluating whether to adopt [[Microservices-Architecture]] or stay with a monolith, the discussion is really about architectural patterns. PMs who can use pattern vocabulary (pub/sub, CQRS, event sourcing, saga pattern) in architecture discussions earn credibility and can ask sharper questions about tradeoffs.

- **Patterns enable [[Build-vs-Buy]] flexibility**: The Repository pattern and Strategy pattern (where the algorithm is selected at runtime) make it easier to swap vendors. A PM planning to evaluate Twilio vs. Gupshup for SMS notifications benefits from engineering using a strategy pattern -- the swap becomes a configuration change, not a rewrite.

## Example

**Zomato's restaurant listing architecture (India context)**: Zomato's backend uses the MVC pattern extensively in its Django-based services. The Model layer includes database schemas for restaurants, menus, reviews, and orders ([[Database-Scaling]] across multiple databases). The View layer serves data through [[REST-API]] endpoints consumed by mobile apps and the web [[DOM]]. The Controller layer handles business logic like search ranking, filtering by cuisine, and applying discount calculations. When Zomato expanded from restaurant discovery to food delivery (Zomato Gold to Zomato Pro), the MVC separation meant the View and Controller for delivery features could be built independently without restructuring the core restaurant Model. They also use the Observer pattern for real-time order tracking -- when a delivery partner updates their location, the Observer broadcasts the change to the customer's app, the restaurant dashboard, and the internal analytics system simultaneously, without each subscriber knowing about the others.

## Patterns at a Glance

| Pattern | Problem It Solves | PM-Relevant Signal |
|---|---|---|
| **MVC** | Separating UI from business logic | Enables parallel frontend/backend work |
| **Observer** | Broadcasting state changes to many consumers | Powers real-time features, event-driven flows |
| **Factory** | Creating objects without hardcoding types | Adding a new payment method or integration is fast |
| **Repository** | Decoupling data access from business logic | Easier to swap databases, reduces [[Vendor-Lock-In]] |
| **Singleton** | Ensuring a single shared instance | Over-use signals [[Technical-Debt]] risk |
| **Strategy** | Selecting algorithms at runtime | Enables A/B testing, [[Feature-Flags]], vendor swaps |

## Related Concepts

- [[Backend-Languages]]
- [[Microservices-Architecture]]
- [[Client-Server-Architecture]]
- [[Technical-Debt]]
- [[Frontend-Frameworks]]
- [[Session-04-APIs-Integrations]]
