# Hórus Cognitive OS — Canonical Global Roadmap

**Canonical architecture:** `docs/blueprint/HORUS-MASTER-BLUEPRINT.md`  
**Progress authority:** this file  
**Integrity contract:** `docs/blueprint/ARCHITECTURE-LOCK.md`  
**Evidence authority:** closure/evidence documents  
**Last audited:** 2026-08-11

> This document answers **WHERE Hórus is**. It does not redefine architecture and it does not replace closure/evidence documents.

## 1. Status taxonomy

- 🔒 `NOT_STARTED` — no functional implementation started for the defined module scope.
- 🔵 `PLANNED` — architecture/plan established; implementation not established for the defined scope.
- 🟡 `IN_PROGRESS` — active implementation or validation is underway.
- 🟢 `IMPLEMENTED` — implementation exists, but the complete verification/closure gates are not satisfied.
- 🟢 `VERIFIED` — direct validation evidence exists for the stated scope.
- 🟢 `COMPLETE` — all closure gates for the stated scope are satisfied and evidence is recorded.
- ⚠️ `BLOCKED` — a proven external/unresolved dependency prevents progress.

**Checkbox rule:** `[x]` is derived from the corresponding status/evidence. It is not an independent registry. `[x]` is allowed only where the item has sufficient evidence for its stated status. `[ ]` means the item is not complete. `🟡 IN_PROGRESS` uses `[ ]`; no `[~]` convention is used.

## 2. Global status

**Hórus global status: NOT READY FOR MARKET.**

The Studio 09 surface is complete, but the Hórus platform and the other commercial surfaces are not globally closed. A completed surface never promotes the whole product to market readiness.

### Commercial surfaces

| Surface | Status | Scope / evidence |
|---|---|---|
| Colaboradores Digitais | 🔵 PLANNED | Commercial architecture defined in Blueprint; no dedicated production closure. |
| Hórus Personal | 🔵 PLANNED | Text + voice product architecture defined; no dedicated production closure. |
| Hórus Operations | 🔵 PLANNED | Cognitive-team operating model defined; no dedicated production closure. |
| Studio Hórus / Projects | 🟢 COMPLETE | 09 closure; live Vercel rollback and full Studio lifecycle/economic reconciliation verified. |

## 3. Historical module sequence — IDs preserved

> **Roadmap order ≠ dependency order.** IDs preserve project sequencing/history. The Blueprint dependency graph is the architectural authority.

### 01 — Core / Foundation
**Status: 🟢 IMPLEMENTED**  
**Evidence boundary:** repository history and current core routes/configuration. This is not a global launch closure.

- [x] Base Hórus application foundation
- [x] Supabase integration
- [x] LangGraph/core orchestration foundation
- [x] Core API execution route
- [x] Base product/runtime configuration
- [ ] Global launch-readiness closure

### 02 — Cognitive Core / Memory
**Status: 🟡 IN_PROGRESS**  
**Evidence boundary:** Memory Graph foundation is implemented; broader cognitive-memory behavior is not fully verified.

- [x] Memory Graph foundation
- [x] Durable memory persistence schema
- [x] Semantic-cache foundation
- [x] Context/memory service foundation
- [ ] Complete short-term working memory contract
- [ ] Complete long-term memory lifecycle
- [ ] Pruning / TTL / invalidation closure
- [ ] End-to-end cognitive retrieval verification

### 03 — Prior closed block
**Status: 🟢 COMPLETE — historical closure preserved**  
**Evidence boundary:** historical project closure/evidence referenced by prior Roadmap versions. No separate 03 closure artifact is present in the current `docs/blueprint/` tree; this audit therefore does not invent new component-level claims for 03.

- [x] Historical module closure preserved
- [x] Historical status preserved without reopening
- [ ] No new component claim added without direct evidence

### 04 — Prior closed block
**Status: 🟢 COMPLETE — historical closure preserved**  
**Evidence boundary:** historical project closure/evidence referenced by prior Roadmap versions. No separate 04 closure artifact is present in the current `docs/blueprint/` tree; no unsupported component claims are added.

- [x] Historical module closure preserved
- [x] Historical status preserved without reopening
- [ ] No new component claim added without direct evidence

### 05 — Prior closed block
**Status: 🟢 COMPLETE — historical closure preserved**  
**Evidence boundary:** historical project closure/evidence referenced by prior Roadmap versions. No separate 05 closure artifact is present in the current `docs/blueprint/` tree; no unsupported component claims are added.

- [x] Historical module closure preserved
- [x] Historical status preserved without reopening
- [ ] No new component claim added without direct evidence

### 06 — Prior closed block
**Status: 🟢 COMPLETE — historical closure preserved**  
**Evidence boundary:** historical project closure/evidence referenced by prior Roadmap versions. No separate 06 closure artifact is present in the current `docs/blueprint/` tree; no unsupported component claims are added.

- [x] Historical module closure preserved
- [x] Historical status preserved without reopening
- [ ] No new component claim added without direct evidence

### 07 — Prior closed block
**Status: 🟢 COMPLETE — historical closure preserved**  
**Evidence boundary:** historical project closure/evidence referenced by prior Roadmap versions. No separate 07 closure artifact is present in the current `docs/blueprint/` tree; no unsupported component claims are added.

- [x] Historical module closure preserved
- [x] Historical status preserved without reopening
- [ ] No new component claim added without direct evidence

### 08 — Prior closed block
**Status: 🟢 COMPLETE — historical closure preserved**  
**Evidence boundary:** historical project closure/evidence referenced by prior Roadmap versions. No separate 08 closure artifact is present in the current `docs/blueprint/` tree; no unsupported component claims are added.

- [x] Historical module closure preserved
- [x] Historical status preserved without reopening
- [ ] No new component claim added without direct evidence

### 09 — Studio / Projects
**Status: 🟢 COMPLETE — Studio-scoped + LIVE VERIFIED**  
**Evidence:** `docs/blueprint/09-STUDIO-CLOSURE.md`.

- [x] Project lifecycle
- [x] Revision system
- [x] Approval boundary
- [x] Preview verification
- [x] Staging verification
- [x] Production verification
- [x] Delivery verification
- [x] Connector execution contract
- [x] Execution specification
- [x] Economic authorization
- [x] Attempt tracking
- [x] Budget authorization
- [x] Budget reconciliation / terminal settlement
- [x] Execution-log lifecycle
- [x] Provider adapter execution
- [x] Native Vercel error preservation
- [x] Deterministic `PREVIOUS_READY_PRODUCTION` rollback policy
- [x] Delivery Anchor ≠ Rollback Target
- [x] Real Vercel production rollback
- [x] Provider-side Production verification
- [x] Runtime verification
- [x] CI verification
- [x] Connector `CONNECTED`
- [x] Vault `secret_ref` resolution

Historical failed rollback remains immutable evidence; it is not rewritten as success.

### 10 — Agents / Collaborators
**Status: 🔒 NOT_STARTED**  
**Next functional module. No implementation is initiated by this reconciliation.**

- [ ] Agent primitive
- [ ] Collaborator product model
- [ ] Agent role/objective/instruction contract
- [ ] Agent memory scope
- [ ] Capability binding
- [ ] Connector binding
- [ ] Permission model
- [ ] Economic policy binding
- [ ] Agent lifecycle
- [ ] Agent execution
- [ ] Verification

### 11 — Hórus Personal
**Status: 🔵 PLANNED**

- [ ] Personal collaborator model
- [ ] Text interaction
- [ ] Voice interaction
- [ ] User-defined role/context
- [ ] Personal memory scope
- [ ] Safety/permission boundary
- [ ] Subscription lifecycle
- [ ] Dedicated closure

### 12 — Observability / Audit
**Status: 🔵 PLANNED — platform-wide**

- [ ] Cross-product telemetry contract
- [ ] Execution audit coverage
- [ ] Provider request/response correlation coverage
- [ ] Deployment audit coverage
- [ ] Approval/HITL audit coverage
- [ ] Usage/economic audit coverage
- [ ] Retention/query policy
- [ ] Dedicated closure

### 13 — Hórus Operations
**Status: 🔵 PLANNED**

- [ ] Cognitive team model
- [ ] Multi-collaborator orchestration
- [ ] Shared/controlled memory
- [ ] Role/permission governance
- [ ] Parallel execution
- [ ] Verification/governance loop
- [ ] Subscription lifecycle
- [ ] Dedicated closure

### 14 — Billing / Monetization
**Status: 🔵 PLANNED**

- [ ] Colaboradores Digitais subscription
- [ ] Hórus Personal subscription
- [ ] Hórus Operations subscription
- [ ] Studio one-time project payment
- [ ] Metered credits where applicable
- [ ] Billing authorization boundary
- [ ] Payment provider integration
- [ ] Webhook/idempotency lifecycle
- [ ] Reconciliation
- [ ] Dedicated closure

### 15 — Workspace / Identity / Multi-tenant
**Status: 🔵 PLANNED**

- [ ] Workspace model
- [ ] Membership/roles
- [ ] Tenant ownership
- [ ] Server-side authorization
- [ ] Database tenant isolation
- [ ] Cross-product ownership model
- [ ] Workspace-scoped memory
- [ ] Workspace-scoped agents/collaborators
- [ ] Workspace-scoped billing
- [ ] Dedicated closure

### 16 — Inference / Model Routing
**Status: 🔵 PLANNED**

- [ ] Provider-neutral inference contract
- [ ] Capability-aware routing
- [ ] Model selection policy
- [ ] Cost/quality/latency routing
- [ ] Context-window constraints
- [ ] Fallback strategy
- [ ] Provider health integration
- [ ] Economic policy integration
- [ ] Dedicated closure

### 17 — Connector / Plugin Fabric
**Status: 🟢 IMPLEMENTED — Studio-scoped**  
**Platform-wide completion remains open.**

- [x] Studio connector contract
- [x] GitHub connector
- [x] Vercel connector
- [x] Supabase connector
- [x] External API capability represented
- [x] Permission boundary
- [x] Vault-backed `secret_ref`
- [x] Provider adapter binding in Studio
- [x] Request/response correlation in rollback diagnostics
- [ ] Canonical platform-wide connector registry lifecycle
- [ ] Versioned connector manifest lifecycle
- [ ] OAuth lifecycle
- [ ] API-key/service-credential lifecycle generalized platform-wide
- [ ] Credential expiry/revocation lifecycle generalized platform-wide
- [ ] Connector health-check lifecycle
- [ ] Platform-wide rate-limit/retry/backoff policy
- [ ] Platform-wide webhook lifecycle
- [ ] Broad connector catalog / dozens of connectors
- [ ] Platform-wide compatibility/version governance

### 18 — Execution / Economics
**Status: 🟢 IMPLEMENTED — Studio-scoped + LIVE VERIFIED**  
**Platform-wide completion remains open.**

- [x] Execution specification
- [x] Authorization contract
- [x] Attempt tracking
- [x] Budget model
- [x] Usage/cost tracking schema
- [x] Economic policy
- [x] Provider correlation
- [x] Idempotency primitives
- [x] Terminal budget settlement
- [x] Reconciliation contract
- [x] Failed-attempt immutability
- [ ] Cross-product execution coverage
- [ ] Cross-product economic authorization
- [ ] Cross-product budget/usage reconciliation

### 19 — Security / Vault / RLS
**Status: 🟢 VERIFIED — Studio-scoped + LIVE VERIFIED**  
**Platform-wide completion remains open.**

- [x] Supabase RLS on relevant Studio domain tables
- [x] Vault/service-role secret boundary
- [x] Connector `secret_ref`
- [x] Permission enforcement for Studio execution
- [x] Authorization before protected connector use
- [x] Security evidence during E2E
- [ ] Platform-wide tenant isolation closure
- [ ] Platform-wide credential lifecycle closure
- [ ] Cross-product authorization closure
- [ ] Dedicated security closure

### 20 — Deployment / Lifecycle
**Status: 🟢 VERIFIED — Studio-scoped + LIVE VERIFIED**  
**Platform-wide completion remains open.**

- [x] Preview lifecycle
- [x] Staging lifecycle
- [x] Production lifecycle
- [x] Delivery lifecycle
- [x] Production approval boundary
- [x] Provider deployment verification
- [x] Real production rollback
- [x] Deterministic rollback target resolution
- [x] Runtime verification
- [x] Provider/application state reconciliation
- [ ] Cross-product deployment lifecycle
- [ ] Generalized lifecycle contracts for non-Studio surfaces
- [ ] Dedicated lifecycle closure

## 4. Shared platform progress — evidence boundaries

### Cognitive Core / Memory
**Status: 🟡 IN_PROGRESS.** Memory foundation exists; broader cognitive behavior is not closed.

- [x] Memory Graph schema/foundation
- [x] Semantic cache schema/foundation
- [x] Context/memory service foundation
- [ ] Full short/long-term memory lifecycle
- [ ] Full retrieval/RAG verification
- [ ] Cross-product memory governance

### Nexus
**Status: 🟢 IMPLEMENTED — architecture + current routing foundation; platform-wide closure pending.**

- [x] Intent-oriented central orchestration contract
- [x] Provider/model-agnostic architecture
- [x] Context/capability/connector decision model
- [x] Current routing foundation
- [ ] Full dynamic capability/agent/team composition
- [ ] Full production inference routing
- [ ] Cross-product verification

### Capability System
**Status: 🟢 IMPLEMENTED — current canonical registry; platform-wide composition closure pending.**

- [x] Canonical `capabilities` registry
- [x] Capability/provider/model relationships
- [x] Studio capability composition
- [ ] Full Nexus-driven platform-wide capability composition
- [ ] Capability governance/compatibility closure

### Provider Adapters
**Status: 🟢 IMPLEMENTED — Studio/Vercel live verified.**

- [x] Provider abstraction in persistence
- [x] Vercel adapter path
- [x] Native provider diagnostic preservation
- [x] Provider request/target correlation for rollback
- [ ] Generalized multi-provider adapter contract
- [ ] Cross-product provider verification

### HITL / Approval
**Status: 🟢 IMPLEMENTED — Studio-scoped; platform-wide policy pending.**

- [x] Revision approval boundary
- [x] Production approval boundary
- [x] Risk/approval fields in execution model
- [ ] Platform-wide HITL policy engine
- [ ] Cross-product approval governance

## 5. Evidence matrix

| Item | Status | Scope | Evidence |
|---|---|---|---|
| 01 | 🟢 IMPLEMENTED | platform foundation | Git history / current code |
| 02 | 🟡 IN_PROGRESS | Cognitive Core / Memory | current schema/code |
| 03 | 🟢 COMPLETE | historical module scope | prior Roadmap/history; current closure artifact not present |
| 04 | 🟢 COMPLETE | historical module scope | prior Roadmap/history; current closure artifact not present |
| 05 | 🟢 COMPLETE | historical module scope | prior Roadmap/history; current closure artifact not present |
| 06 | 🟢 COMPLETE | historical module scope | prior Roadmap/history; current closure artifact not present |
| 07 | 🟢 COMPLETE | historical module scope | prior Roadmap/history; current closure artifact not present |
| 08 | 🟢 COMPLETE | historical module scope | prior Roadmap/history; current closure artifact not present |
| 09 | 🟢 COMPLETE | Studio + LIVE VERIFIED | `09-STUDIO-CLOSURE.md`, CI, Vercel, Supabase evidence |
| 10 | 🔒 NOT_STARTED | platform | no functional implementation initiated |
| 11 | 🔵 PLANNED | commercial surface | Blueprint only |
| 12 | 🔵 PLANNED | platform-wide | Blueprint only |
| 13 | 🔵 PLANNED | commercial surface | Blueprint only |
| 14 | 🔵 PLANNED | platform-wide/commercial | current schemas/history; no production billing closure |
| 15 | 🔵 PLANNED | platform-wide | schema foundation exists; no cross-product closure |
| 16 | 🔵 PLANNED | platform-wide | architecture/schema foundation; no production router closure |
| 17 | 🟢 IMPLEMENTED | Studio-scoped | Studio connector schema/code/E2E |
| 18 | 🟢 IMPLEMENTED | Studio-scoped + LIVE VERIFIED | execution/attempt/budget/reconciliation E2E |
| 19 | 🟢 VERIFIED | Studio-scoped + LIVE VERIFIED | RLS/Vault/Connector E2E |
| 20 | 🟢 VERIFIED | Studio-scoped + LIVE VERIFIED | Vercel lifecycle/rollback E2E |

## 6. Dependency order — authoritative architectural graph

Roadmap IDs are not dependency order. The Blueprint graph is authoritative:

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

Commercial surfaces consume the shared platform:

`Colaboradores Digitais` / `Hórus Personal` / `Hórus Operations` / `Studio Projects`

## 7. Launch readiness

### Global platform gates — all required before global market readiness

- [ ] Identity / Workspace
- [ ] Authorization
- [ ] Cognitive Core
- [ ] Nexus
- [ ] Capability composition
- [ ] Inference / Model Routing
- [ ] Connector security/fabric
- [ ] Execution / idempotency
- [ ] Economic authorization
- [ ] Billing
- [ ] Observability / audit
- [ ] RLS / Vault / security
- [ ] Runtime reliability
- [ ] Recovery / rollback
- [ ] CI / deployment evidence

**Global decision: NOT READY FOR MARKET.**

### Surface-specific gates

| Surface | Status | Required closure |
|---|---|---|
| Colaboradores Digitais | 🔵 PLANNED | dedicated product + platform closure |
| Hórus Personal | 🔵 PLANNED | dedicated product + platform closure |
| Hórus Operations | 🔵 PLANNED | dedicated product + platform closure |
| Studio Projects | 🟢 COMPLETE | 09 closure + applicable platform gates |

## 8. Audit findings and reconciliation decisions — 2026-08-11

1. The previous Roadmap was root-only and acted as an independent progress authority. Corrected by creating this canonical `docs/blueprint/ROADMAP.md` and converting the root file into a bridge.
2. The Blueprint already correctly distinguished Hórus from Studio and correctly described Nexus as a transversal decision/orchestration layer.
3. The Blueprint already contains the platform-wide Connector Fabric concept; Roadmap now distinguishes Studio-proven connector work from platform-wide completion.
4. Execution/Economics, Security/Vault/RLS and Deployment/Lifecycle are implemented/verified in the Studio domain, but their platform-wide gates remain open.
5. Supabase currently contains real execution/economic primitives: `execution_budgets`, `execution_attempts`, `execution_usage`, `economic_policy`, `economic_policy_versions`, `credit_accounts`, `credit_ledger`, `credit_holds`, `economic_events`, `idempotency_keys`, plus Studio execution/revision/connector tables. This supports the `IMPLEMENTED` scope claims but does not close cross-product behavior.
6. Current Vercel history confirms real Production deployments and the live rollback target lineage. The current Production has subsequently advanced beyond the 09 restored deployment; this does not invalidate the historical 09 closure.
7. The current repository's canonical blueprint directory contains `09-STUDIO-CLOSURE.md`, `ARCHITECTURE-LOCK.md` and `HORUS-MASTER-BLUEPRINT.md`; no standalone 03–08 closure files are present. Their historical COMPLETE status is preserved, but no new granular claims are invented.
8. No functional implementation for module 10 was started by this audit.

## 9. Documentation rules for future progress

When an item becomes complete:

`IMPLEMENT/CORRECT → VALIDATE → RECORD EVIDENCE → UPDATE STATUS → DERIVE CHECKBOX → UPDATE CLOSURE IF APPLICABLE → CI → DEPLOY/VERIFY → CONTINUE`

A checkbox never creates evidence. Evidence creates the status; the checkbox mirrors it.

## 10. Next-module boundary

**10 — Agents / Collaborators remains 🔒 NOT_STARTED.**

This roadmap reconciliation is documentation/audit work only. No functional Agent/Collaborator implementation was started.
