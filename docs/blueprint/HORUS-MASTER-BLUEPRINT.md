# Hórus Cognitive OS — Master Blueprint

**Status:** CANONICAL ARCHITECTURAL SOURCE OF TRUTH  
**Last reconciled:** 2026-08-11  
**Scope:** Entire Hórus product and platform, not only Studio.

## 1. Purpose and architectural authority

The Hórus is a cognitive operating system for people, professionals and businesses. Its core abstraction is **intent → context → cognition → capabilities → execution → verification**, coordinated by the Nexus.

This document is the canonical architecture. It defines the intended product surfaces, platform boundaries, shared cognitive infrastructure and economic/execution contracts. It does not imply that every component is already implemented. Implementation state is tracked separately in `ROADMAP.md` and supported by closure/evidence documents.

### Evidence states

- **PLANNED:** architecture explicitly defined but implementation not established.
- **IMPLEMENTED:** code/schema/contracts exist.
- **VERIFIED:** implementation was validated by tests, database inspection, CI or equivalent direct evidence.
- **LIVE VERIFIED:** verified against the live provider/runtime/environment with real evidence.
- **COMPLETE:** all defined gates for the module are satisfied and evidence is recorded.
- **BLOCKED:** progress is prevented by an external or explicitly unresolved dependency.

## 2. Commercial product architecture

Hórus is composed of four first-class commercial surfaces. They share the same cognitive/platform core but have different user jobs and monetization.

### 2.1 Colaboradores Digitais

Specialized digital employees/agents for any niche, profession, market or company. A collaborator is a persistent role with goals, context, capabilities, tools, memory and execution boundaries.

**Commercial model:** monthly subscription.

### 2.2 Hórus Personal

A personal cognitive collaborator usable across everyday contexts: personal assistance, professional support, organization, writing, practical guidance, cooking, construction/project support, conversation and other user-defined roles.

Text and voice are first-class interaction modalities. The product must not be constrained to one profession or persona.

**Commercial model:** monthly subscription.

### 2.3 Hórus Operations

A coordinated cognitive team for operating a company or business process. It composes multiple specialized collaborators under central orchestration, shared context, permissions, memory and operational controls.

**Commercial model:** monthly subscription.

### 2.4 Studio Hórus / Projects

The universal project surface. The user declares an intention/objective; Nexus contextualizes and classifies it, designs the required solution, composes capabilities/connectors and prepares or executes the project through controlled lifecycle gates.

Projects use a **one-time payment** commercial model. Studio is a major Hórus surface, not the definition of Hórus itself.

## 3. Nexus — transversal orchestration layer

Nexus is the central decision/orchestration layer shared across Hórus surfaces.

The user should not need to manually select:

- model;
- agent;
- capability;
- provider;
- connector;
- execution strategy;
- internal architecture;
- pipeline.

The user declares intent. Nexus determines the internal plan from intent, context, objective, constraints, authorization and available capabilities.

Nexus is provider/model-invisible at the product contract boundary. Model/provider selection belongs to inference/model routing and provider adapter layers.

### Nexus responsibilities

1. intent interpretation;
2. context assembly;
3. task decomposition;
4. capability inference/composition;
5. collaborator/agent selection;
6. inference/model routing;
7. connector/tool planning;
8. execution strategy selection;
9. economic authorization requirements;
10. approval/HITL requirements;
11. preview/staging/production strategy;
12. verification and reconciliation.

## 4. Cognitive Core

The Cognitive Core is the shared intelligence substrate beneath Nexus and the four commercial surfaces.

### 4.1 Context and memory

- Memory Graph for durable user/workspace/project/agent context.
- Short-term working context.
- Long-term memory.
- Semantic retrieval and context ranking.
- RAG/context assembly.
- Semantic cache where appropriate.
- Context pruning/TTL policies.
- Provenance and audit metadata for important facts/actions.

The existing memory foundation is implemented in the codebase; the broader infinite-memory behavior remains a roadmap capability until independently verified end-to-end.

### 4.2 Inference/model routing

A routing layer selects the appropriate model/provider for each task according to capability, latency, cost, quality, context and policy. Product surfaces remain model-agnostic.

The router must support future provider expansion without leaking provider-specific contracts into product APIs.

### 4.3 Agents / collaborators

Agents are reusable cognitive workers with role, objective, instructions, memory scope, capabilities, connectors, permissions, economic policy and execution boundaries.

A collaborator is a productized agent/team role. Agents are platform primitives; Colaboradores Digitais, Personal and Operations are commercial compositions of those primitives.

## 5. Capability system

Capabilities are the canonical units of what the system can do. They are not synonymous with models or connectors.

A capability may require one or more models, tools, connectors and execution steps. The registry must remain canonical; parallel registries must not be introduced.

Studio already has a canonical capability registry and composition contract.

## 6. Connector / plugin fabric

Connectors provide controlled access to external systems. The current live Studio connector architecture explicitly covers GitHub, Vercel and Supabase plus an external API placeholder, with a design intended to expand to dozens of connectors.

Connector architecture requirements:

- provider-neutral capability contract;
- granular permissions;
- server-side Vault secret references;
- permission-before-secret boundary;
- expiration/revocation;
- provider adapters;
- request/response correlation;
- idempotency;
- auditability;
- least privilege;
- no provider credentials in client responses.

## 7. Studio and Project Engine

Studio is the project-oriented execution surface. Its canonical persistence includes `studio_projects`, `studio_project_revisions`, `studio_connectors` and `studio_executions`.

### Project lifecycle

`INTENT → PROJECT → REVISION → APPROVAL → PREVIEW → STAGING → PRODUCTION APPROVAL → DELIVERY → VERIFICATION`

Canonical revision classes:

`MICRO → LOW → MEDIUM → MAJOR → REBUILD`

Execution strategy and recomputation scale with change class.

## 8. Execution Engine

The execution engine is shared infrastructure, not a Studio-only implementation detail.

Execution must preserve the chain:

`intent → execution spec → authorization → connector/provider → attempt → usage/cost → reconciliation → result → audit`

Execution boundaries must be explicit and idempotent. Provider side effects must not be represented as successful merely because an application request was accepted.

### Economic authorization

Every billable or economically relevant execution is governed by authorization, budget and attempt limits. Core structures include execution budgets, attempts, usage and provider cost metadata.

A terminal successful attempt must reconcile the associated budget to `SETTLED` with a completed timestamp. Failed attempts must preserve failure evidence and must not be rewritten as success.

## 9. Provider adapters

Provider adapters translate the canonical execution contract to provider-specific APIs. They must preserve native status/code/message/details/headers and request correlation wherever available.

The Vercel rollback E2E established the architectural rule that **Delivery Anchor is provenance, not rollback target**. Rollback target resolution uses the current Production and provider deployment history; the canonical policy is `PREVIOUS_READY_PRODUCTION`.

## 10. Approval / HITL

Human-in-the-loop is required where policy, authorization, financial impact, production mutation or other configured risk thresholds demand it.

Application approval states are not substitutes for external side-effect evidence.

## 11. Deployment lifecycle

Hórus separates application lifecycle state from provider reality.

Required evidence for deployment operations includes, where applicable:

- project;
- revision;
- deployment ID;
- target/current deployment;
- SHA/provenance;
- environment;
- provider status;
- runtime health;
- request/response correlation;
- reconciliation.

### Rollback

Rollback is an explicit production mutation with authorization and provider verification. The resolver must select the immediate previous eligible Production deployment rather than an arbitrary historical anchor.

## 12. Observability and auditability

Execution, provider interactions, deployment mutations, approvals, usage, attempts and reconciliation require durable audit evidence.

Observability is a transversal platform concern. The independent Observability module remains separate from Studio closure and must not be falsely marked complete by Studio documentation.

## 13. Security

Security boundaries include:

- Supabase RLS;
- Vault/service-role-only secret functions;
- connector permission enforcement;
- credential expiry/revocation;
- authorization before secret access;
- provider identity minimization at product boundaries;
- audit trails;
- least privilege;
- tenant/workspace isolation.

The live Studio domain has verified RLS and Vault boundaries. Broader platform security remains subject to module-specific verification.

## 14. Workspace and multi-tenant architecture

Workspace is the primary organizational boundary for teams/businesses. Users may belong to one or more workspaces subject to authorization. Resources such as projects, collaborators, agents, connectors, memories, executions, budgets and billing records must carry an explicit ownership/tenant boundary.

Operations and enterprise collaboration must never rely on client-side filtering as the security boundary; authorization belongs in the server/database layer.

## 15. Billing and monetization

Canonical commercial models:

| Surface | Model |
|---|---|
| Colaboradores Digitais | Monthly subscription |
| Hórus Personal | Monthly subscription |
| Hórus Operations | Monthly subscription |
| Studio Projects | One-time payment |
| Multimedia / high-cost execution | Metered credits where applicable |

Billing must remain separate from execution authorization while exposing the economic constraints required by execution. No parallel billing registry should be introduced.

## 16. GitHub / Vercel / Supabase role

- **GitHub:** source control, CI, code history, evidence and architectural documentation.
- **Vercel:** application deployment/runtime and production deployment state.
- **Supabase:** canonical relational persistence, RLS, Vault integration and execution/economic records.

These are current infrastructure choices, not permanent product limitations. The connector fabric is designed to expand beyond them.

## 17. Current verified architectural baseline

### 09 — Studio

**🟢 COMPLETE** as of the final E2E 09 closure.

Verified evidence includes real Vercel rollback, successful execution/attempt, settled budget, completed execution log, corrected reconciliation, CI success, Production readiness, clean runtime, Connector/Vault authorization and deterministic `PREVIOUS_READY_PRODUCTION` rollback target resolution.

The historical failed rollback remains preserved as failure evidence.

### 03–08

**CLOSED / preserved.** This reconciliation does not reopen those blocks. Their exact state remains governed by their existing closure/evidence records.

### 10 — Agents

**🔒 NOT_STARTED.** No functional work is initiated by this documentation reconciliation.

### 12 — Observability

**🔵 PLANNED / independent.** Studio evidence does not close the broader Observability module.

Other modules must be classified from direct repository/database/provider evidence before being marked VERIFIED or COMPLETE.

## 18. Architecture dependency graph

`Workspace / Identity`
→ `Cognitive Core`
→ `Nexus`
→ `Agents / Collaborators`
→ `Capabilities`
→ `Inference / Model Routing`
→ `Connector Fabric`
→ `Execution Engine`
→ `Economic Authorization`
→ `Provider Adapters`
→ `Preview / Staging / Production`
→ `Verification / Reconciliation`
→ `Observability / Audit`
→ `Billing / Usage`

Commercial surfaces consume the shared graph:

`Colaboradores Digitais` / `Hórus Personal` / `Hórus Operations` / `Studio Projects`

## 19. Launch-readiness criteria

Hórus is launch-ready only when the required commercial surface(s) satisfy, at minimum:

1. user/workspace authorization;
2. reliable intent handling;
3. Nexus orchestration;
4. required agent/capability composition;
5. model routing;
6. connector security;
7. execution idempotency;
8. economic authorization and billing;
9. provider side-effect verification;
10. observability/auditability;
11. runtime reliability;
12. security/RLS/Vault validation;
13. recovery/rollback where applicable;
14. evidence-backed CI/deployment;
15. documented operational closure.

A product surface cannot be declared launch-ready solely from UI completeness or deployment `READY` status.

## 20. Non-regression rule

Any architectural change affecting a shared concept must update this Blueprint and the Roadmap in the same development cycle. No module may silently remove previously established architecture. Historical documents remain evidence, but the current Blueprint is the canonical architectural source.
