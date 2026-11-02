---
title: GitHub
aliases:
  - GitHub Actions
  - GitHub Platform
  - Git Version Control
tags:
  - pm2
  - devops
  - ci-cd
  - web-fundamentals
  - collaboration
category: DevOps & Tools
---

## Definition
#definition

GitHub is a cloud-based platform for version control and collaborative software development built on top of Git. Beyond hosting code repositories, GitHub provides pull request workflows, code review tools, issue tracking, GitHub Actions (a built-in [[CI-CD]] automation engine), GitHub Pages, package registries, and security scanning. For PMs, GitHub is often the central nervous system of the engineering workflow -- where code changes are proposed, reviewed, tested, and deployed through [[Deployment-Pipeline]] automation.

## How It Works

- **Git and repositories**: Git is a distributed version control system that tracks every change to every file in a project. GitHub hosts Git repositories in the cloud, enabling teams to collaborate. Developers work on **branches** (isolated copies of the codebase), make commits (snapshots of changes), and submit **pull requests (PRs)** to merge their branch into the main branch after code review.

- **Pull request workflow**: PRs are the primary collaboration mechanism. A developer opens a PR describing their changes, reviewers leave comments on specific lines of code, automated checks (tests, linting, security scans) run via [[CI-CD]], and the PR is merged only when all checks pass and reviewers approve. PMs can track PR velocity and review times as engineering health metrics.

- **GitHub Actions**: A workflow automation engine triggered by repository events (code push, PR opened, schedule, manual trigger). Teams define workflows in YAML files that run jobs on GitHub-hosted runners -- building code, running tests, deploying to staging/production, and more. This integrates [[CI-CD]] directly into the code repository without needing external tools like Jenkins.

- **Issues and project boards**: GitHub Issues provide lightweight ticket tracking that PMs can use for bug reports and feature requests. GitHub Projects (Kanban boards) offer visual project management integrated with issues and PRs. While not as feature-rich as Jira or Linear, they eliminate context-switching between tools.

- **Security features**: GitHub provides Dependabot (automated dependency updates and vulnerability alerts), code scanning (CodeQL for finding security vulnerabilities), and secret scanning (detecting accidentally committed API keys or passwords). These automated guardrails are part of a [[DevOps]] security-left approach.

## PM Implications
#pm-implication

- **PR metrics reveal engineering health**: PMs should track PR cycle time (time from PR opened to merged), review turnaround time, and PR size distribution. Large PRs (500+ lines) take longer to review and introduce more bugs. If cycle times are growing, it may signal process problems, unclear requirements, or [[Technical-Debt]] that PMs need to address.

- **GitHub Actions reduce DevOps overhead**: By using GitHub Actions for [[CI-CD]], teams avoid maintaining separate Jenkins/CircleCI infrastructure. PMs planning sprints should factor in the initial setup cost (writing workflow YAML files) but recognize the long-term reduction in deployment friction and [[DevOps]] toil.

- **Branch strategy affects release cadence**: Whether the team uses GitFlow (separate develop/release/hotfix branches), trunk-based development (everyone commits to main), or feature branches affects how quickly features reach users. PMs wanting continuous deployment need to align on a branch strategy that supports [[Feature-Flags]] and frequent small releases.

- **Open-source contributions and community**: For products with open-source components, GitHub is where community contributors submit PRs, report bugs, and request features. PMs at companies with open-source strategies (e.g., Postman, Hasura) must actively triage GitHub issues and nurture the contributor community as a product channel.

## Example

**Hasura's open-source development on GitHub (India context)**: Hasura, the Bengaluru-based company behind the popular open-source GraphQL engine, uses GitHub as its primary product development platform. Their `hasura/graphql-engine` repository has 30,000+ stars and receives contributions from a global community. Hasura's PMs track GitHub issues as a direct input to their product roadmap -- the most upvoted issues influence sprint planning. Their GitHub Actions [[CI-CD]] pipeline runs 50+ test suites on every PR across multiple database backends ([[Database-Scaling]] configurations for Postgres, SQL Server, BigQuery). When a community member in India reports a bug with a [[REST-API]] endpoint, the PR fixing it goes through automated testing, code review, and is deployed to Hasura Cloud via their [[Deployment-Pipeline]] -- all orchestrated through GitHub. This transparency (all development is public) builds trust and serves as de facto [[API-Documentation]] for their open-source users.

## Key GitHub Metrics for PMs

PMs should track these engineering health indicators available from GitHub data (directly or via tools like LinearB, Sleuth, or the DORA dashboard):

- **PR cycle time**: Hours from PR opened to merged -- a proxy for development throughput
- **Review turnaround**: Time from review requested to first review comment -- indicates team responsiveness
- **PR size**: Lines changed per PR -- smaller PRs (under 200 lines) correlate with fewer defects and faster reviews
- **Deployment frequency**: How often code reaches production via [[CI-CD]] -- a DORA metric that correlates with high-performing teams
- **Change failure rate**: Percentage of deployments causing incidents, tracked via [[Error-Tracking]] integration

## Related Concepts

- [[CI-CD]]
- [[DevOps]]
- [[Deployment-Pipeline]]
- [[Feature-Flags]]
- [[Technical-Debt]]
- [[Session-04-APIs-Integrations]]
