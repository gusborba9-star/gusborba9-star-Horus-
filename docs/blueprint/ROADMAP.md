# Hórus Cognitive OS — Canonical Global Roadmap

**Canonical architecture:** `docs/blueprint/HORUS-MASTER-BLUEPRINT.md`  
**Progress authority:** this file  
**Integrity contract:** `docs/blueprint/ARCHITECTURE-LOCK.md`  
**Evidence authority:** closure/evidence documents  
**Last audited:** 2026-08-12

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

The Studio 09 surface is complete and the Digital Collaborator foundation is now implemented/verified, but the Hórus platform and the other commercial surfaces are not globally closed. A completed surface never promotes the whole product to market readiness.

### Commercial surfaces

| Surface | Status | Scope / evidence |
|---|---|---|
| Colaboradores Digitais | 🔵 PLANNED | Commercial surface architecture defined; E2E 10 foundation implemented/verified, but no dedicated commercial launch closure. |
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

### 10 — Agents / Digital Collaborators
**Status: 🟢 VERIFIED — platform primitive; live deployment verified, live provider execution evidence unavailable**  
**Evidence:** code/schema, Supabase migration and RLS inspection, `horus-ci` success, Vercel Production READY deployment. `COMPLETE` remains gated on a real authenticated application-user provider execution E2E.

- [x] Agent/collaborator primitive
- [x] Collaborator product model
- [x] Identity / role / specialization / objectives / instructions
- [x] Memory-scope contract
- [x] Capability binding to canonical `capabilities`
- [x] Permission/autonomy model
- [x] Economic policy binding
- [x] Version snapshot/lifecycle foundation
- [x] Nexus collaborator resolution
- [x] Capability resolution
- [x] Provider/model selection from canonical registry
- [x] Bounded Memory Graph context assembly
- [x] Organization membership gate before privileged resolution
- [x] RLS tenant/user isolation
- [x] Idempotency boundary
- [x] Shared budget authorization
- [x] Shared attempt authorization
- [x] Real provider execution boundary in production code
- [x] Usage/cost reconciliation contract
- [x] Durable collaborator execution persistence
- [x] Durable execution log correlation
- [x] Deterministic autonomy rejection for `SUGGEST` / `PREPARE`
- [ ] Concrete collaborator connector binding/execution
- [ ] Delegation / parent-child collaborator execution
- [ ] Collaborator team orchestration
- [ ] Learning/optimization loop
- [ ] Live provider E2E with authenticated user session
- [ ] Dedicated `10` closure with live provider evidence

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
**Status: 🟢 IMPLEMENTED — Studio-scoped + LIVE VERIFIED; collaborator reuse verified at implementation level**  
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
- [x] Collaborator execution reuses canonical budget/attempt/usage/reconciliation
- [ ] Cross-product execution coverage
- [ ] Cross-product economic authorization
- [ ] Cross-product budget/usage reconciliation

### 19 — Security / Vault / RLS
**Status: 🟢 VERIFIED — Studio-scoped + LIVE VERIFIED; collaborator tenant boundary verified at schema/code level**  
**Platform-wide completion remains open.**

- [x] Supabase RLS on relevant Studio domain tables
- [x] Vault/service-role secret boundary
- [x] Connector `secret_ref`
- [x] Permission enforcement for Studio execution
- [x] Authorization before protected connector use
- [x] Collaborator RLS policies
- [x] Collaborator organization membership gate
- [x] Security evidence during E2E
- [ ] Platform-wide tenant isolation closure
- [ ] Platform-wide credential lifecycle closure
- [ ] Cross-product authorization closure
- [ ] Dedicated security closure

### 20 — Deployment / Lifecycle
**Status: 🟢 VERIFIED — Studio-scoped + LIVE VERIFIED; E2E 10 production deployment verified**  
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
- [x] E2E 10 Production deployment READY
- [ ] Cross-product deployment lifecycle
- [ ] Generalized lifecycle contracts for non-Studio surfaces
- [ ] Dedicated lifecycle closure

## 4. Shared platform progress — evidence boundaries

### Cognitive Core / Memory
**Status: 🟡 IN_PROGRESS.** Memory foundation exists; broader cognitive behavior is not closed.

- [x] Memory Graph schema/foundation
- [x] Semantic cache schema/foundation
- [x] Context/memory service foundation
- [x] Collaborator bounded Memory Graph reads
- [ ] Full short/long-term memory lifecycle
- [ ] Full retrieval/RAG verification
- [ ] Cross-product memory governance

### Nexus
**Status: 🟢 IMPLEMENTED — architecture + current routing foundation; platform-wide closure pending.**

- [x] Intent-oriented central orchestration contract
- [x] Provider/model-agnostic architecture
- [x] Context/capability/connector decision model
- [x] Collaborator resolution boundary
- [x] Capability resolution
- [x] Model/provider selection foundation
- [ ] Full dynamic capability/agent/team composition
- [ ] Full production inference routing
- [ ] Cross-product verification

### Capability System
**Status: 🟢 IMPLEMENTED — current canonical registry; platform-wide composition closure pending.**

- [x] Canonical `capabilities` registry
- [x] Capability/provider/model relationships
- [x] Studio capability composition
- [x] Collaborator capability binding
- [ ] Full Nexus-driven platform-wide capability composition
- [ ] Capability governance/compatibility closure

### Provider Adapters
**Status: 🟢 IMPLEMENTED — Studio/Vercel live verified; collaborator text provider path implemented.**

- [x] Provider abstraction in persistence
- [x] Vercel adapter path
- [x] OpenRouter text provider path for collaborators
- [x] Native provider diagnostic preservation
- [x] Provider request/target correlation for rollback
- [ ] Generalized multi-provider adapter contract
- [ ] Cross-product provider verification

### HITL / Approval
**Status: 🟢 IMPLEMENTED — Studio-scoped; collaborator autonomy gate implemented; platform-wide policy pending.**

- [x] Revision approval boundary
- [x] Production approval boundary
- [x] Risk/approval fields in execution model
- [x] Collaborator `READ/SUGGEST/PREPARE/EXECUTE/AUTONOMOUS` policy boundary
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
| 10 | 🟢 VERIFIED | platform collaborator primitive; live deployment verified; provider E2E evidence unavailable | code/schema, Supabase migration/RLS, `horus-ci`, Vercel Production READY |
| 11 | 🔵 PLANNED | commercial surface | Blueprint only |
| 12 | 🔵 PLANNED | platform-wide | Blueprint only |
| 13 | 🔵 PLANNED | commercial surface | Blueprint only |
| 14 | 🔵 PLANNED | platform-wide/commercial | current schemas/history; no production billing closure |
| 15 | 🔵 PLANNED | platform-wide | schema foundation exists; no cross-product closure |
| 16 | 🔵 PLANNED | platform-wide | architecture/schema foundation; no production router closure |
| 17 | 🟢 IMPLEMENTED | Studio-scoped | Studio connector schema/code/E2E |
| 18 | 🟢 IMPLEMENTED | Studio-scoped + LIVE VERIFIED; collaborator reuse verified | execution/attempt/budget/reconciliation E2E + E2E 10 code integration |
| 19 | 🟢 VERIFIED | Studio LIVE VERIFIED; collaborator schema/code verified | RLS/Vault/Connector E2E + collaborator RLS/membership gate |
| 20 | 🟢 VERIFIED | Studio LIVE VERIFIED; E2E 10 deployment verified | Vercel lifecycle/rollback E2E + Production READY deployment |

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
| Colaboradores Digitais | 🔵 PLANNED | dedicated product + platform closure; E2E 10 foundation exists |
| Hórus Personal | 🔵 PLANNED | dedicated product + platform closure |
| Hórus Operations | 🔵 PLANNED | dedicated product + platform closure |
| Studio Projects | 🟢 COMPLETE | 09 closure + applicable platform gates |

## 8. Audit findings and reconciliation decisions — 2026-08-12

1. E2E 10 introduced a canonical collaborator foundation without creating a second agent/capability/economic registry.
2. Collaborator capability bindings reference the existing canonical `capabilities` registry.
3. Collaborator execution reuses `execution_budgets`, `execution_attempts`, `execution_usage` and `reconcile_horus_execution_attempt`; no parallel budget/attempt/usage system was created.
4. The first migration initially attempted an invalid scalar foreign key to the composite `models` primary key. The migration was corrected before successful application; provider/model references remain provider-neutral text fields and are resolved against the canonical model/provider registry at runtime.
5. The initial collaborator RLS mutation policy used a broad `FOR ALL` policy alongside a SELECT policy. This was corrected into explicit INSERT/UPDATE/DELETE policies and `auth.uid()` was wrapped as a statement-level initplan to reduce repeated evaluation.
6. New collaborator foreign keys were indexed in the hardening migration after Supabase performance review identified missing covering indexes.
7. Service-role API paths now validate organization membership before privileged collaborator resolution/creation, preventing client-supplied organization IDs from bypassing tenant authorization.
8. `SUGGEST` and `PREPARE` collaborators are blocked before economic authorization; only `EXECUTE` and `AUTONOMOUS` enter the provider execution boundary.
9. CI run `horus-ci` for the final validated implementation completed SUCCESS with npm test, TypeScript, ESLint and production build all successful.
10. Vercel Production deployment for the final validated SHA is READY. Runtime error aggregation reports no runtime errors in the selected recent window.
11. Supabase confirms all four collaborator tables have RLS enabled and explicit policies. Security/performance advisors show no collaborator-specific RLS-no-policy issue; existing unrelated project-wide advisories remain unchanged.
12. Live provider execution could not be promoted to evidence because the available Vercel integration exposes deployment/runtime data but not an authenticated application-user session for invoking the collaborator execution endpoint. This is classified as **EVIDENCE UNAVAILABLE**, not product failure.
13. Module 09 remains COMPLETE and no historical 03–09 progress was reclassified downward.
14. No functional module 11 work was initiated.

## 9. Documentation rules for future progress

When an item becomes complete:

`IMPLEMENT/CORRECT → VALIDATE → RECORD EVIDENCE → UPDATE STATUS → DERIVE CHECKBOX → UPDATE CLOSURE IF APPLICABLE → CI → DEPLOY/VERIFY → CONTINUE`

A checkbox never creates evidence. Evidence creates the status; the checkbox mirrors it.

## 10. Next-module boundary

**11 — Hórus Personal is the next historical functional module after E2E 10.**

Module 10 remains `🟢 VERIFIED`, not `COMPLETE`, until a real authenticated application-user provider execution E2E is recorded. No module 11 implementation is started by this execution.
