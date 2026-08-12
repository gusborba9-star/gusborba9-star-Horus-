# Hórus Cognitive OS — Master Blueprint

**Status:** CANONICAL ARCHITECTURAL SOURCE OF TRUTH  
**Last reconciled:** 2026-08-12  
**Scope:** Entire Hórus product and platform, not only Studio.

## 1. Purpose and architectural authority

Hórus is a cognitive operating system for people, professionals and businesses. Its core abstraction is **intent → context → cognition → capabilities → execution → verification**, coordinated by Nexus.

This document defines what Hórus is. It does not imply that every component is implemented. `ROADMAP.md` defines current progress; closure/evidence documents prove individual gates.

### Evidence states

- **PLANNED:** architecture explicitly defined but implementation not established.
- **IMPLEMENTED:** code/schema/contracts exist.
- **VERIFIED:** implementation was validated by direct evidence.
- **LIVE VERIFIED:** validated against a live provider/runtime/environment.
- **COMPLETE:** all defined gates for the module are satisfied and evidence is recorded.
- **BLOCKED:** progress is prevented by a proven external/unresolved dependency.

## 2. Commercial product architecture

Hórus has four first-class commercial surfaces sharing the same transversal platform.

### 2.1 Colaboradores Digitais
Specialized digital employees for any niche, profession, market, company or operational function. **Monthly subscription.**

### 2.2 Hórus Personal
A personal cognitive collaborator for everyday and professional contexts, including assistance, writing, organization, practical guidance, cooking, construction/project support, professional support, conversation and user-defined roles. Text and voice are first-class modalities. **Monthly subscription.**

### 2.3 Hórus Operations
A coordinated cognitive team for operating companies/business processes, combining specialized collaborators under Nexus, controlled shared memory/context, permissions, objectives, execution, verification and governance. **Monthly subscription.**

### 2.4 Studio Hórus / Projects
The universal intent-to-project surface. The user declares an intention/objective; Nexus contextualizes, classifies, designs, composes capabilities and prepares or executes a project through controlled lifecycle gates. **One-time payment per project.** Studio is a major surface, not the definition of Hórus.

## 3. Nexus — transversal decision and orchestration layer

Nexus is not merely an agent orchestrator. It is the central decision/orchestration layer shared across all Hórus surfaces.

The user declares intent. Nexus dynamically determines the internal plan from intent, context, objective, constraints, authorization and available capabilities. The user must not need to manually choose model, agent, capability, provider, connector, pipeline, execution strategy or internal architecture.

Conceptually valid plans include:

`Intent → Nexus → model → capability → result`

`Intent → Nexus → agent → capability → connector → execution`

`Intent → Nexus → cognitive team → subagents → parallel execution → verification`

Nexus may select any required combination of:

- context and memory;
- agent/collaborator/cognitive team;
- capability composition;
- model and inference route;
- provider adapter;
- connector/tool;
- execution strategy;
- economic authorization;
- HITL/approval;
- lifecycle;
- verification/reconciliation.

Provider/model selection is an internal routing concern; product contracts remain provider/model-agnostic.

### Nexus responsibilities

1. intent interpretation;
2. context assembly;
3. task decomposition;
4. capability inference/composition;
5. collaborator/agent/team selection;
6. inference/model routing;
7. connector/tool discovery and planning;
8. execution strategy selection;
9. economic authorization requirements;
10. approval/HITL requirements;
11. lifecycle planning;
12. verification and reconciliation.

## 4. Cognitive Core

The Cognitive Core is the shared intelligence substrate beneath Nexus and every commercial surface.

### 4.1 Context and memory

- Memory Graph for durable user/workspace/project/agent context;
- short-term working context;
- long-term memory;
- semantic retrieval and ranking;
- RAG/context assembly;
- semantic cache where appropriate;
- pruning/TTL policies;
- provenance and audit metadata.

The existing memory foundation is implemented; broader end-to-end cognitive-memory behavior remains subject to independent verification.

### 4.2 Inference / model routing

A provider-neutral routing layer selects the appropriate model/provider per task using capability, latency, cost, quality, context and policy. Product surfaces never depend directly on a provider-specific model contract.

### 4.3 Agents / collaborators

Agents are reusable cognitive workers with role, objective, instructions, memory scope, capabilities, connectors, permissions, economic policy and execution boundaries. A collaborator is a productized agent/team role; Agents are platform primitives.

E2E 10 establishes the first reusable Digital Collaborator foundation without creating a parallel agent registry. The canonical collaborator model persists identity, role, specialization, objectives, instructions, memory scope, tools/connectors policy, autonomy, economic policy version, model preference, fallback policy, lifecycle state and version snapshots. Capability bindings are separate from the collaborator entity and reuse the existing canonical `capabilities` registry.

Collaborator execution reuses the existing execution/economic primitives rather than creating a second budget/attempt/usage system. The Nexus resolution boundary selects an active collaborator, resolves an enabled capability, selects an active provider/model, assembles bounded memory context, evaluates autonomy/approval policy, then enters the shared budget → attempt → provider → usage → reconciliation chain.

Autonomy levels are explicit: `READ`, `SUGGEST`, `PREPARE`, `EXECUTE`, `AUTONOMOUS`. `SUGGEST` and `PREPARE` cannot silently execute side effects. Cross-tenant access is rejected before service-role reads when an organization scope is supplied.

The current implementation supports text generation through the existing OpenRouter provider/model registry and bounded Memory Graph reads. Connector binding is represented by collaborator policy and remains separately governed by the canonical Connector Fabric; no collaborator-owned credential store is permitted.

This E2E establishes the platform primitive and API contract. It does not make all future collaborators, multimodal execution, team delegation, or platform-wide connector coverage complete.

## 5. Capability system

Capabilities are canonical units of what Hórus can do. They are distinct from models and connectors. A capability may require multiple models, tools, connectors and execution steps. One canonical registry must be used; parallel capability registries are prohibited.

Studio already has a canonical capability composition contract; platform-wide capability coverage is separately tracked in the Roadmap.

## 6. Connector / Plugin Fabric — platform architecture

Connector Fabric is a platform-wide extensible plugin fabric, not a list of three integrations. Its purpose is to let Nexus discover and invoke external capabilities without changing Nexus or Cognitive Core when new providers are added.

### Canonical connector contract

The system must have one canonical **Connector Registry**. Each connector is represented by a versioned manifest exposing:

- connector identity/version;
- capabilities exposed;
- provider-neutral operations;
- permission scopes;
- OAuth/API-key/service-credential requirements;
- Vault-backed credential references;
- credential lifecycle, expiration and revocation;
- health checks;
- rate limits;
- retry/backoff policy;
- idempotency contract;
- webhook/event support;
- request/response correlation;
- provider adapter binding;
- compatibility/version constraints;
- audit metadata;
- least-privilege requirements.

Nexus performs connector and capability discovery through this canonical registry. Product code must not embed provider-specific connector selection.

Current live evidence covers the Studio connector domain for GitHub, Vercel and Supabase, with external API capability represented in the existing architecture. This is **Studio-scoped evidence**, not proof that the entire platform-wide fabric is complete.

The architecture is intentionally extensible to dozens of connectors without changing Nexus or Cognitive Core.

## 7. Studio and Project Engine

Studio is the project-oriented execution surface. Its canonical persistence includes `studio_projects`, `studio_project_revisions`, `studio_connectors` and `studio_executions`.

Lifecycle:

`INTENT → PROJECT → REVISION → APPROVAL → PREVIEW → STAGING → PRODUCTION APPROVAL → DELIVERY → VERIFICATION`

Revision classes:

`MICRO → LOW → MEDIUM → MAJOR → REBUILD`

## 8. Execution Engine / Economics

Execution is shared infrastructure, not inherently Studio-only. The canonical chain is:

`intent → execution spec → authorization → connector/provider → attempt → usage/cost → reconciliation → result → audit`

Execution boundaries must be explicit and idempotent. Provider side effects require provider evidence.

Every economically relevant execution is governed by authorization, budget and attempt limits. A terminal successful attempt reconciles its budget to `SETTLED` with completion timestamp and usage/cost evidence. Failed attempts remain immutable.

Current live E2E evidence proves this contract in the Studio domain. E2E 10 reuses the same budget, attempt, usage and reconciliation primitives for collaborator executions; this is not a second economic architecture. Cross-product execution/economics coverage remains separately tracked.

## 9. Provider adapters

Provider adapters translate canonical contracts to provider APIs while preserving native status/code/message/details/headers and request correlation where available.

The Vercel rollback E2E established: **Delivery Anchor is provenance, not rollback target**. Rollback target resolution uses Current Production plus provider deployment history; canonical policy is `PREVIOUS_READY_PRODUCTION`.

## 10. Approval / HITL

HITL applies where policy, authorization, financial impact, production mutation or configured risk thresholds demand it. Application approval state never substitutes for external side-effect evidence.

E2E 10 enforces autonomy policy before economic authorization. `SUGGEST` and `PREPARE` are approval-bound states; only `EXECUTE` and `AUTONOMOUS` may enter the provider execution boundary in the current collaborator E2E.

## 11. Deployment / Lifecycle

Application lifecycle and provider reality are separate contracts. Deployment evidence includes project, revision, deployment ID, target/current deployment, SHA/provenance, environment, provider status, runtime health, request/response correlation and reconciliation where applicable.

Rollback is an authorized production mutation with deterministic target resolution and provider verification. The Studio implementation is live verified; generalized cross-product lifecycle remains separately tracked.

## 12. Observability / Audit

Execution, provider interactions, deployment mutations, approvals, usage, attempts and reconciliation require durable audit evidence. Observability is transversal; Studio evidence does not close the platform-wide Observability module.

Collaborator executions persist correlation through collaborator execution ID, shared budget/attempt/log references, provider/model identity, usage, latency, result and terminal status.

## 13. Security

Security boundaries include Supabase RLS, Vault/service-role-only secret functions, connector permission enforcement, credential expiry/revocation, authorization before secret access, least privilege, audit trails and tenant/workspace isolation.

The Studio domain has verified RLS/Vault boundaries. E2E 10 adds RLS-backed collaborator/organization isolation and a server-side organization membership gate before service-role resolution. Platform-wide security remains subject to independent verification.

## 14. Workspace / Identity / Multi-tenant

Workspace is the primary organizational boundary. Users may belong to one or more workspaces under authorization. Projects, collaborators, agents, connectors, memories, executions, budgets and billing records require explicit tenant/workspace ownership. Authorization must be enforced server-side/database-side, never by client filtering.

E2E 10 collaborator and collaborator-execution records carry owner and optional organization scope. Organization access is checked before privileged execution queries, while database RLS remains the client-facing boundary.

## 15. Billing / Monetization

| Surface | Model |
|---|---|
| Colaboradores Digitais | Monthly subscription |
| Hórus Personal | Monthly subscription |
| Hórus Operations | Monthly subscription |
| Studio Projects | One-time payment |
| Multimedia/high-cost execution | Metered credits where applicable |

Billing is distinct from execution authorization while exposing required economic constraints. No parallel billing registry is permitted.

## 16. Infrastructure roles

- **GitHub:** source, CI, code history and evidence.
- **Vercel:** application deployment/runtime and provider deployment state.
- **Supabase:** canonical persistence, RLS, Vault integration and execution/economic records.

These are current infrastructure choices, not product boundaries. Connector Fabric is designed for expansion beyond them.

## 17. Current architectural baseline

### 03–08
**CLOSED / preserved.** Existing closure/evidence documents remain authoritative for their gates; this reconciliation does not reopen them.

### 09 — Studio
**🟢 COMPLETE.** Real Vercel rollback, successful execution/attempt, settled budget, completed execution log, corrected reconciliation, CI success, Production readiness, clean runtime, Connector/Vault authorization and deterministic `PREVIOUS_READY_PRODUCTION` resolution are recorded in `09-STUDIO-CLOSURE.md`.

### 10 — Agents / Digital Collaborators
**🟢 IMPLEMENTED / VERIFIED at code, schema, CI and deployment level.** The collaborator primitive, capability binding, version snapshot, Nexus resolution boundary, autonomy policy, tenant gate, shared economics integration and text-provider execution boundary are implemented. Live provider E2E execution remains an evidence gate before `COMPLETE` because the available deployment integration does not expose an authenticated application-user execution surface for this audit.

All other platform modules are classified by direct evidence in `ROADMAP.md`; Studio evidence must not be promoted into platform-wide completion.

## 18. Architectural dependency graph

This graph defines architectural dependency, independent of roadmap numbering:

`Identity / Workspace`
→ `Cognitive Core / Memory / RAG`
→ `Nexus`
→ `Agents / Collaborators`
→ `Capabilities`
→ `Inference / Model Routing`
→ `Connector / Plugin Fabric`
→ `Execution / Economics`
→ `Provider Adapters`
→ `Preview / Staging / Production`
→ `Verification / Reconciliation`
→ `Observability / Audit`
→ `Billing / Usage`

Commercial surfaces consume the shared graph:

`Colaboradores Digitais` / `Hórus Personal` / `Hórus Operations` / `Studio Projects`

Roadmap numbering is not this dependency graph; roadmap order is historical/project sequencing, while this graph is the architectural authority.

## 19. Launch readiness

Hórus is not globally `READY FOR MARKET` because one completed surface does not close the platform or other commercial surfaces.

### Shared platform gates

Required for global launch readiness, as applicable:

- Identity / Workspace;
- authorization;
- Cognitive Core;
- Nexus;
- capability composition;
- inference/model routing;
- connector security/fabric;
- execution/idempotency;
- economic authorization;
- billing;
- observability/audit;
- RLS/Vault/security;
- runtime reliability;
- recovery/rollback;
- CI/deployment evidence.

### Commercial surface gates

Each launched surface requires its own closure/evidence:

- Colaboradores Digitais;
- Hórus Personal;
- Hórus Operations;
- Studio Projects.

A surface can be `COMPLETE` without making another surface `COMPLETE`.

## 20. Non-regression rule

Any architectural change affecting a shared concept updates this Blueprint and the Roadmap in the same development cycle. No component may be silently removed. Current verified evidence determines current status; historical evidence remains preserved for provenance.
