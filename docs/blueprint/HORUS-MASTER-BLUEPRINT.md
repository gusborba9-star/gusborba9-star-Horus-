# Hórus Cognitive OS — Master Blueprint

**Status:** CANONICAL ARCHITECTURAL SOURCE OF TRUTH  
**Last reconciled:** 2026-08-13  
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

The Collaborator is a dynamically composed/productized agent surface. The user declares an objective to Nexus; Nexus determines the required role, capabilities, context, model/inference requirements and economic profile. The user does not manually select the underlying model/provider.

### 2.2 Hórus Personal
A **pre-built personal cognitive product** for everyday and professional contexts. Personal is not a user-created agent and is not a smaller copy of the Collaborator creation flow.

The Personal product is pre-defined by Hórus. The user:

1. authenticates into Hórus;
2. enters Personal;
3. selects a Personal subscription tier;
4. activates the Personal on the user's device;
5. selects one of the six official Personal identities;
6. optionally grants capabilities/permissions;
7. may revoke or change those permissions at any time.

The six official identities are fixed by the product and no free-form persona creation exists in Hórus Personal:

- **Aline**
- **Luiza**
- **Íris**
- **Clara**
- **Bel**
- **Lúcia**

Each identity has a system-defined identity profile containing nominal identity, PT-BR feminine voice identity, vocal profile, personality, communication style, formality, conversational rhythm, proactive behavior, intervention pattern, memory/context characteristics and defined behavior for everyday situations.

A Personal identity is **not an independent agent**. All six identities use the same Personal runtime/Nexus, shared infrastructure, capabilities, policies and architectural memory foundation. The identity layer changes how the Personal interacts; it does not fork the cognitive architecture.

The selected identity is persistent for that user. For example, choosing “Clara” establishes Clara as the user's Personal identity until the user changes it through the supported product flow.

Personal has first-class text and voice interaction. Voice identity must use a primary voice plus a compatible fallback so provider failure cannot silently change the identity's perceived voice.

Personal starts with **no external device capability implicitly authorized**. External actions are granted progressively through explicit capabilities and policies. The user controls them through a Personal Permission Center and can revoke them at any time.

Indicative commercial pricing currently discussed for validation is **R$49,90 / R$79,90 / R$159,90**. These values are **provisional commercial baselines, not frozen architecture or final pricing**. Final prices, tier names, quotas, economic profiles and margins require economic simulation using current provider/infrastructure costs before commercial closure.

The user never selects the underlying model/provider. Nexus routes cognition, STT, TTS, retrieval, research and tools according to task requirements and the active Personal economic policy.

### 2.3 Hórus Operations
A coordinated cognitive team for operating companies/business processes, combining specialized collaborators under Nexus, controlled shared memory/context, permissions, objectives, execution, verification and governance. **Monthly subscription.**

### 2.4 Studio Hórus / Projects
The universal intent-to-project surface. The user declares an intention/objective; Nexus contextualizes, classifies, designs, composes capabilities and prepares or executes a project through controlled lifecycle gates. **One-time payment per project.** Studio is a major surface, not the definition of Hórus.

### 2.5 Product-model distinction: Personal vs Collaborator

Personal and Collaborator deliberately share the same platform foundation but have different product lifecycles.

**Personal:**

`USER → LOGIN → PERSONAL → SUBSCRIBE → SELECT IDENTITY → ACTIVATE → OPTIONAL CAPABILITY GRANTS → USE`

The user does not create the agent, role, architecture or capability graph. The product is pre-built.

**Collaborator:**

`USER → INTENT/OBJECTIVE → NEXUS ANALYSIS → AGENT/COLLABORATOR DESIGN → CAPABILITIES/MODEL REQUIREMENTS → ECONOMIC ESTIMATION → USER APPROVAL → CREATE/EXECUTE`

The Collaborator surface is dynamically composed around the user's business objective. Nexus is responsible for determining which IA/model to use for each task.

This distinction is mandatory. Personal must not be implemented as a second Collaborator builder, and Collaborator must not be constrained to the fixed six Personal identities.

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

### 3.1 Nexus economic/model routing

Nexus is the decision point for model selection. Product surfaces must not hard-code a provider-specific model choice into user-facing contracts.

For Collaborators, Nexus may use current model/provider pricing and availability data, including OpenRouter model/pricing information where supported by the canonical provider registry, to estimate execution economics and select an appropriate model for the requested task. The routing decision considers at minimum capability, quality, latency, context requirements, provider health/policy and cost.

For Personal, Nexus uses the same provider-neutral routing foundation, but the user purchases a commercial Personal tier rather than receiving a per-agent price calculated from a newly designed agent. The tier maps internally to an economic profile/budget policy. The user does not see tokens, provider costs or internal model-routing units.

OpenRouter pricing/model data is an input to routing/economics, not a product dependency exposed to the user and not a reason to create a second model registry.

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

Personal consumes the same Cognitive Core. It does not create a parallel Personal Memory Engine. Personal-specific memory rules define what is stored, retained, retrieved and surfaced as personal preference, routine, relationship/context or task state while using the shared memory foundation.

### 4.2 Inference / model routing

A provider-neutral routing layer selects the appropriate model/provider per task using capability, latency, cost, quality, context and policy. Product surfaces never depend directly on a provider-specific model contract.

### 4.3 Agents / collaborators

Agents are reusable cognitive workers with role, objective, instructions, memory scope, capabilities, connectors, permissions, economic policy and execution boundaries. A collaborator is a productized agent/team role; Agents are platform primitives.

E2E 10 establishes the first reusable Digital Collaborator foundation and closes its defined authenticated execution gate without creating a parallel agent registry. The canonical collaborator model persists identity, role, specialization, objectives, instructions, memory scope, tools/connectors policy, autonomy, economic policy version, model preference, fallback policy, lifecycle state and version snapshots. Capability bindings are separate from the collaborator entity and reuse the existing canonical `capabilities` registry.

Collaborator execution reuses the existing execution/economic primitives rather than creating a second budget/attempt/usage system. The Nexus resolution boundary selects an active collaborator, resolves an enabled capability, selects an active provider/model, assembles bounded memory context, evaluates autonomy/approval policy, then enters the shared budget → attempt → provider → usage → reconciliation chain.

Autonomy levels are explicit: `READ`, `SUGGEST`, `PREPARE`, `EXECUTE`, `AUTONOMOUS`. `SUGGEST` and `PREPARE` cannot silently execute side effects. Cross-tenant access is rejected before service-role reads when an organization scope is supplied.

The current implementation supports text generation through the existing OpenRouter provider/model registry and bounded Memory Graph reads. Connector binding is represented by collaborator policy and remains separately governed by the canonical Connector Fabric; no collaborator-owned credential store is permitted.

The authenticated E2E closure proves the defined collaborator platform primitive, API contract, tenant gate, autonomy/economic boundary and real text-provider execution path in Production. It does not make all future collaborators, multimodal execution, team delegation, or platform-wide connector coverage complete.

## 5. Capability system

Capabilities are canonical units of what Hórus can do. They are distinct from models and connectors. A capability may require multiple models, tools, connectors and execution steps. One canonical registry must be used; parallel capability registries are prohibited.

Studio already has a canonical capability composition contract; platform-wide capability coverage is separately tracked in the Roadmap.

Personal uses the same canonical capability registry. Personal-specific capabilities are domain capabilities, not a second Personal registry. A capability grant is the user's authorization to expose a capability to the Personal within an explicit scope and policy.

Examples include `calendar.read`, `calendar.create`, `contacts.read`, `reminders.create`, `maps.open`, `whatsapp.send_message`, `email.send` and `calls.initiate`. Exact availability is implementation/provider dependent and must be verified before being advertised as supported.

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

Personal App Actions consume this fabric where an external connector is required. Android-native actions may use official Android intents/APIs without forcing every device action into the connector registry. Accessibility/UI automation is not the core architecture and may only be considered as a last-resort implementation for a specific capability after security, platform-policy and reliability review.

The action priority is: **official API → native platform integration → Android Intent/share → UI automation only as a last resort**.

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

### 8.1 Personal economic policy

Personal subscriptions map to internal economic profiles rather than exposing token/minute accounting as the product contract. Indicative tiers are currently modeled as Personal / Personal Pro / Personal Ultra or Prime around the provisional R$49,90 / R$79,90 / R$159,90 baseline.

These prices and names are not frozen. Before Personal commercial closure, the system must simulate expected, heavy and worst-reasonable legitimate usage using current costs for LLM inference, STT, TTS, retrieval/search, memory, storage, database, cache, infrastructure and payment/operational overhead.

The Nexus may optimize internal model/provider selection to preserve margin. A high-usage Personal should not be reduced to a visible credit counter solely because an economical model can satisfy a task. Economic routing is an internal optimization subject to the product's promised quality/capability contract.

No parallel Personal budget/attempt/usage/reconciliation architecture is permitted. Personal must reuse the canonical execution/economic primitives and add only the Personal-specific commercial mapping required to associate a subscription tier with an economic profile.

## 9. Provider adapters

Provider adapters translate canonical contracts to provider APIs while preserving native status/code/message/details/headers and request correlation where available.

The Vercel rollback E2E established: **Delivery Anchor is provenance, not rollback target**. Rollback target resolution uses Current Production plus provider deployment history; canonical policy is `PREVIOUS_READY_PRODUCTION`.

## 10. Approval / HITL

HITL applies where policy, authorization, financial impact, production mutation or configured risk thresholds demand it. Application approval state never substitutes for external side-effect evidence.

E2E 10 enforces autonomy policy before economic authorization. `SUGGEST` and `PREPARE` are approval-bound states; only `EXECUTE` and `AUTONOMOUS` may enter the provider execution boundary in the current collaborator E2E.

### 10.1 Personal permission model

Personal does not receive unrestricted device authority. Every externally consequential Personal capability is represented as an explicit capability grant with at minimum:

- capability identity;
- scope;
- permission state;
- policy/autonomy level;
- confirmation requirement;
- auditability;
- revocation path;
- owner/user association.

The Permission Center must explain what a capability permits, what data it can access and which actions it can execute. Revocation must be effective server-side/platform-side, not merely a UI state.

Initial Personal state is **no external permissions** unless a capability is explicitly required and authorized. A missing capability produces a permission request rather than an implicit attempt to bypass authorization.

Example:

`Personal → Nexus → intent SEND_MESSAGE → capability whatsapp.send_message → permission exists? → policy → action → result → Personal response`

If permission is absent, execution stops at the authorization boundary and the user is offered the explicit grant flow.

## 11. Deployment / Lifecycle

Application lifecycle and provider reality are separate contracts. Deployment evidence includes project, revision, deployment ID, target/current deployment, SHA/provenance, environment, provider status, runtime health, request/response correlation and reconciliation where applicable.

Rollback is an authorized production mutation with deterministic target resolution and provider verification. The Studio implementation is live verified; generalized cross-product lifecycle remains separately tracked.

Personal device activation is a product lifecycle distinct from application deployment. Activation associates the user's subscribed Personal with the supported device/session; it does not create a new agent deployment per user.

## 12. Observability / Audit

Execution, provider interactions, deployment mutations, approvals, usage, attempts and reconciliation require durable audit evidence. Observability is transversal; Studio evidence does not close the platform-wide Observability module.

Collaborator executions persist correlation through collaborator execution ID, shared budget/attempt/log references, provider/model identity, usage, latency, result and terminal status.

Personal capability actions must produce equivalent durable execution/audit correlation where they cross the shared execution boundary. Permission grants/revocations must also be auditable.

## 13. Security

Security boundaries include Supabase RLS, Vault/service-role-only secret functions, connector permission enforcement, credential expiry/revocation, authorization before secret access, least privilege, audit trails and tenant/workspace isolation.

The Studio domain has verified RLS/Vault boundaries. E2E 10 adds RLS-backed collaborator/organization isolation and a server-side organization membership gate before service-role resolution. Platform-wide security remains subject to independent verification.

Personal adds a user-owned authorization boundary for device/personal capabilities. A Personal must never inherit an organization's unrestricted permissions merely because the same user may also operate a Collaborator.

## 14. Workspace / Identity / Multi-tenant

Workspace is the primary organizational boundary. Users may belong to one or more workspaces under authorization. Projects, collaborators, agents, connectors, memories, executions, budgets and billing records require explicit tenant/workspace ownership. Authorization must be enforced server-side/database-side, never by client filtering.

E2E 10 collaborator and collaborator-execution records carry owner and optional organization scope. Organization access is checked before privileged execution queries, while database RLS remains the client-facing boundary.

Personal is primarily **user-owned**, not organization-owned. Personal identity, subscription, memory scope, capability grants, device activation and personal execution records must resolve to the authenticated user. Organization/workspace context may be used by explicitly authorized Personal capabilities, but it must never silently broaden Personal authority.

## 15. Billing / Monetization

| Surface | Model |
|---|---|
| Colaboradores Digitais | Monthly subscription; economic profile/price may be determined by Nexus |
| Hórus Personal | Monthly subscription; fixed commercial tiers mapped internally to economic profiles |
| Hórus Operations | Monthly subscription |
| Studio Projects | One-time payment per project |
| Multimedia/high-cost execution | Metered credits where applicable |

Billing is distinct from execution authorization while exposing required economic constraints. No parallel billing registry is permitted.

Personal price values currently discussed are provisional and must not be treated as final until economic validation. Collaborator pricing is a separate Nexus-driven calculation flow based on objective/task requirements and current model/provider economics.

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
**🟢 COMPLETE.** The collaborator primitive, capability binding, version snapshot, Nexus resolution boundary, autonomy policy, tenant gate, shared economics integration and text-provider execution boundary are implemented and have passed the defined authenticated Production E2E closure. `10-AGENTS-CLOSURE.md` records the terminal evidence: real Supabase Auth/JWT, normal Collaborator API creation, Nexus/capability/policy resolution, real OpenRouter execution, execution/attempt/usage, economic reconciliation, settled budget, completed execution log, idempotency replay and negative authorization controls.

The E2E 10 closure does not make all future collaborators, multimodal execution, team delegation, platform-wide connector coverage or the separate commercial launch surface complete. Those remain independently tracked in `ROADMAP.md`.

### 11 — Hórus Personal
**Architecture: DEFINED / implementation not yet established.** Personal must consume the shared 03–10 foundation and add only Personal-domain contracts.

Required Personal-domain primitives:

- fixed six-identity Personal catalog;
- Personal identity profile and persistent user selection;
- Personal subscription/tier mapping;
- device/session activation;
- Personal-specific memory semantics over the shared Cognitive Core;
- voice identity with primary/fallback routing;
- user-owned capability grants;
- Permission Center;
- Personal App Actions;
- Personal proactivity/pending-intent model;
- Personal economic profile mapping;
- dedicated production E2E closure.

The following must **not** be duplicated for Personal: Nexus, canonical capability registry, provider/model registry, execution budget/attempt/usage/reconciliation, idempotency, shared provider adapter foundation, shared memory engine, authentication, RLS primitives or audit/execution infrastructure. These are reused or extended.

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

Personal additionally consumes:

`User Identity → Personal Subscription → Personal Identity → Capability Grants → Personal Runtime → Shared Nexus/Cognitive/Execution Graph`

Collaborator additionally consumes:

`User Intent → Nexus Analysis → Dynamic Collaborator Composition → Economic Estimation → Shared Nexus/Cognitive/Execution Graph`

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

Personal launch specifically requires verified gates for subscription activation, one of six fixed identities, text/voice runtime, persistent user identity selection, memory/context behavior, capability grants/revocation, Permission Center, at least the supported initial App Actions, economic routing, audit/idempotency and production runtime.

A surface can be `COMPLETE` without making another surface `COMPLETE`.

## 20. Non-regression rule

Any architectural change affecting a shared concept updates this Blueprint and the Roadmap in the same development cycle. No component may be silently removed. Current verified evidence determines current status; historical evidence remains preserved for provenance.

Personal is a consumer of shared platform primitives unless this Blueprint explicitly marks a Personal-specific contract as new. Creating parallel infrastructure for an existing shared concept is an architectural violation unless a new isolation requirement is documented and approved.
