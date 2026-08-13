# Hórus Cognitive OS — Canonical Global Roadmap

**Canonical architecture:** `docs/blueprint/HORUS-MASTER-BLUEPRINT.md`  
**Progress authority:** this file  
**Integrity contract:** `docs/blueprint/ARCHITECTURE-LOCK.md`  
**Evidence authority:** closure/evidence documents  
**Last audited:** 2026-08-13

> This document answers **WHERE Hórus is**. It does not redefine architecture and it does not replace closure/evidence documents.

## 1. Status taxonomy

- 🔒 `NOT_STARTED` — no functional implementation started for the defined module scope.
- 🔵 `PLANNED` — architecture/plan established; implementation not established for the defined scope.
- 🟡 `IN_PROGRESS` — active implementation or validation is underway.
- 🟢 `IMPLEMENTED` — implementation exists, but complete verification/closure gates are not satisfied.
- 🟢 `VERIFIED` — direct validation evidence exists for the stated scope.
- 🟢 `COMPLETE` — all closure gates for the stated scope are satisfied and evidence is recorded.
- ⚠️ `BLOCKED` — a proven external/unresolved dependency prevents progress.

**Checkbox rule:** `[x]` is derived from the corresponding status/evidence. It is not an independent registry. `[x]` is allowed only where sufficient evidence exists for the stated status. `[ ]` means not complete. `🟡 IN_PROGRESS` uses `[ ]`; no `[~]` convention is used.

## 2. Global status

**Hórus global status: NOT READY FOR MARKET.**

Studio 09 and the Digital Collaborator E2E 10 platform primitive are closed at their respective scopes. The platform and the other commercial surfaces are not globally closed.

| Surface | Status | Scope / evidence |
|---|---|---|
| Colaboradores Digitais | 🔵 PLANNED | E2E 10 platform primitive COMPLETE; commercial launch surface not closed. |
| Hórus Personal | 🟡 IN_PROGRESS | E2E 11 Personal core domain implemented; authenticated product/E2E/voice/actions/economics/closure remain open. |
| Hórus Operations | 🔵 PLANNED | Cognitive-team operating model defined; no dedicated closure. |
| Studio Hórus / Projects | 🟢 COMPLETE | 09 closure; live Vercel rollback and Studio lifecycle/economic reconciliation verified. |

## 3. Historical module sequence — IDs preserved

> **Roadmap order ≠ dependency order.** IDs preserve project sequencing/history. The Blueprint dependency graph is the architectural authority.

### 01 — Core / Foundation
**Status: 🟢 IMPLEMENTED**

- [x] Base Hórus application foundation
- [x] Supabase integration
- [x] LangGraph/core orchestration foundation
- [x] Core API execution route
- [x] Base product/runtime configuration
- [ ] Global launch-readiness closure

### 02 — Cognitive Core / Memory
**Status: 🟡 IN_PROGRESS**

- [x] Memory Graph foundation
- [x] Durable memory persistence schema
- [x] Semantic-cache foundation
- [x] Context/memory service foundation
- [ ] Complete short-term working memory contract
- [ ] Complete long-term memory lifecycle
- [ ] Pruning / TTL / invalidation closure
- [ ] End-to-end cognitive retrieval verification
- [ ] Cross-product memory governance

### 03–08 — Prior closed blocks
**Status: 🟢 COMPLETE — historical closure preserved**

- [x] Historical module closures/statuses preserved
- [x] No reopening of 03–08 in this reconciliation
- [ ] No new component claim without direct evidence

### 09 — Studio / Projects
**Status: 🟢 COMPLETE — Studio-scoped + LIVE VERIFIED**  
**Evidence:** `docs/blueprint/09-STUDIO-CLOSURE.md`.

- [x] Project/revision lifecycle
- [x] Approval, preview, staging and production verification
- [x] Delivery verification
- [x] Connector execution contract
- [x] Execution/economic authorization
- [x] Attempt tracking and budget reconciliation
- [x] Execution-log lifecycle
- [x] Provider adapter execution
- [x] Deterministic `PREVIOUS_READY_PRODUCTION` rollback policy
- [x] Real Vercel production rollback and provider verification
- [x] Runtime/CI verification
- [x] Connector `CONNECTED` and Vault `secret_ref`

Historical failed rollback remains immutable evidence.

### 10 — Agents / Digital Collaborators
**Status: 🟢 COMPLETE — authenticated production E2E and terminal economic reconciliation verified**  
**Evidence:** `docs/blueprint/10-AGENTS-CLOSURE.md`, authenticated E2E run `31628461257`, `horus-ci` run `31628461226`, Supabase persistence audit and Production deployment verification.

- [x] Agent/collaborator primitive and product model
- [x] Identity / role / specialization / objectives / instructions
- [x] Memory-scope contract
- [x] Capability binding to canonical `capabilities`
- [x] Permission/autonomy model
- [x] Economic policy binding
- [x] Version snapshot/lifecycle foundation
- [x] Nexus collaborator resolution
- [x] Capability resolution
- [x] Canonical provider/model selection
- [x] Bounded Memory Graph context assembly
- [x] Organization membership gate and RLS isolation
- [x] Idempotency boundary
- [x] Shared budget/attempt authorization
- [x] Real OpenRouter provider execution in Production
- [x] Usage/cost reconciliation and settled budget
- [x] Durable collaborator execution/log persistence
- [x] Deterministic rejection of `SUGGEST` / `PREPARE` side effects
- [x] Authenticated live E2E and negative authorization tests
- [ ] Concrete collaborator connector binding/execution
- [ ] Delegation / parent-child execution
- [ ] Collaborator team orchestration
- [ ] Learning/optimization loop

### 11 — Hórus Personal
**Status: 🟡 IN_PROGRESS — E2E11 core domain implemented; verification/closure not complete**

#### Product model — mandatory

- [x] Personal is a pre-built product, not a user-created agent
- [x] Flow contract: `LOGIN → PERSONAL → SUBSCRIBE → SELECT IDENTITY → ACTIVATE → OPTIONAL PERMISSIONS → USE`
- [x] Six fixed official identities: Aline, Luiza, Íris, Clara, Bel, Lúcia
- [x] No free-form persona creation
- [x] Persona identity ≠ independent agent
- [x] All six identities share the same Personal runtime/Nexus/infrastructure contract
- [x] Persistent identity selection per authenticated user

#### Subscription / activation

- [x] Personal subscription domain with tier/status/economic-profile fields
- [ ] Billing-backed Personal subscription lifecycle
- [x] Device/session activation data model
- [ ] Device activation API and supported-device verification
- [ ] Subscription change/cancellation lifecycle

**Commercial baseline only:** R$49,90 / R$79,90 / R$159,90. These are provisional values, not frozen prices. Tier names, prices, usage policies and economic profiles require validation.

#### Cognition / voice / memory

- [ ] Text interaction E2E
- [ ] STT contract
- [ ] TTS contract
- [x] Primary + compatible fallback voice profile contract per persona
- [x] Personal Identity Profile domain
- [ ] Personal memory semantics over shared Memory Graph
- [ ] Context continuity
- [ ] Proactive behavior foundation
- [ ] Adaptive model routing for Personal
- [ ] Cross-model orchestration / deliberation
- [ ] Outcome-based model performance learning
- [ ] Evidence / Truth Layer
- [ ] Persistent Decision Memory
- [ ] Context Fabric integration
- [ ] Prompt Optimization routed through provider-neutral Nexus policy

#### Permissions / App Actions

- [x] User-owned capability grants over canonical `capabilities`
- [x] Capability scope
- [x] Permission state and revocation
- [x] Confirmation policy for sensitive actions
- [x] Permission Center API foundation
- [x] Permission audit
- [ ] Initial deterministic App Actions
- [ ] Official API integrations where available
- [ ] Native Android integrations where appropriate
- [ ] Android Intent/share where appropriate
- [ ] UI automation only as a last resort and only after security/platform-policy/reliability validation
- [ ] External side-effect evidence
- [ ] Idempotent App Action execution

#### Economics / Nexus routing

- [ ] Personal subscription → internal economic profile mapping
- [x] Reuse canonical budgets/attempts/usage/reconciliation architecture
- [ ] Cost-aware internal model routing
- [ ] STT/TTS routing policy
- [ ] Research/tool cost routing
- [ ] Expected-use economic simulation
- [ ] Heavy-use economic simulation
- [ ] Worst-reasonable legitimate-use simulation
- [ ] Final pricing validation
- [ ] Final tier naming validation

#### Mandatory reuse from 03–10

- [x] Reuse Nexus architecture from E2E 10
- [x] Reuse canonical capability registry
- [x] Reuse provider/model registry
- [x] Reuse execution budget/attempt/usage/reconciliation
- [x] Reuse idempotency architecture
- [x] Reuse provider-adapter foundation
- [x] Reuse Memory Graph foundation
- [x] Reuse authentication/RLS/security primitives
- [x] Reuse execution/audit correlation
- [x] Generalize domain-scoped primitives where required for Personal

`[x]` here means the shared primitive is established and must be consumed; it does **not** mean the Personal consumer is fully verified.

#### Dedicated closure gates

- [ ] Authenticated Personal E2E
- [ ] Persona persistence E2E
- [ ] Text E2E
- [ ] Voice E2E
- [ ] Memory/context E2E
- [ ] Permission grant E2E
- [ ] Permission revocation E2E
- [ ] App Action E2E with external evidence
- [ ] Idempotency replay E2E
- [ ] Economic authorization/reconciliation E2E
- [ ] Negative authorization/security E2E
- [x] Production deployment/build verification for E2E11 core checkpoint
- [ ] CI / TypeScript / ESLint / complete build closure
- [ ] Dedicated `11` closure document

### 12 — Observability / Audit
**Status: 🔵 PLANNED — platform-wide**

- [ ] Cross-product telemetry contract
- [ ] Execution audit coverage
- [ ] Provider request/response correlation coverage
- [ ] Deployment audit coverage
- [ ] Approval/HITL audit coverage
- [ ] Usage/economic audit coverage
- [ ] Personal permission grant/revocation audit coverage
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
- [ ] Personal tier → economic-profile mapping
- [ ] Collaborator Nexus-driven pricing flow
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
- [ ] User-scoped Personal ownership
- [ ] Workspace-scoped billing
- [ ] Dedicated closure

### 16 — Inference / Model Routing
**Status: 🟢 IMPLEMENTED — foundation exists; platform-wide closure pending**

- [x] Provider-neutral architecture
- [x] Canonical provider/model registry foundation
- [x] Collaborator OpenRouter text path
- [ ] Capability-aware routing closure
- [ ] Model selection policy closure
- [ ] Cost/quality/latency routing
- [ ] Context-window constraints
- [ ] Fallback strategy
- [ ] Provider health integration
- [ ] Economic policy integration
- [ ] OpenRouter pricing/model-data contract for Nexus economics
- [ ] Personal routing verification
- [ ] Collaborator dynamic pricing/routing verification
- [ ] Dedicated closure

### 17 — Connector / Plugin Fabric
**Status: 🟢 IMPLEMENTED — Studio-scoped; platform-wide completion open**

- [x] Studio connector contract
- [x] GitHub / Vercel / Supabase connectors
- [x] Permission boundary
- [x] Vault-backed `secret_ref`
- [x] Provider adapter binding in Studio
- [ ] Canonical platform-wide connector registry lifecycle
- [ ] Versioned connector manifest lifecycle
- [ ] OAuth lifecycle
- [ ] API-key/service-credential lifecycle generalized platform-wide
- [ ] Credential expiry/revocation lifecycle generalized platform-wide
- [ ] Health-check lifecycle
- [ ] Platform-wide rate-limit/retry/backoff policy
- [ ] Platform-wide webhook lifecycle
- [ ] Broad connector catalog
- [ ] Platform-wide compatibility/version governance
- [ ] Personal connector/action coverage

### 18 — Execution / Economics
**Status: 🟢 IMPLEMENTED — Studio LIVE VERIFIED; collaborator reuse verified; platform-wide closure open**

- [x] Execution specification
- [x] Authorization contract
- [x] Attempt tracking
- [x] Budget model
- [x] Usage/cost tracking
- [x] Economic policy
- [x] Provider correlation
- [x] Idempotency
- [x] Terminal settlement
- [x] Reconciliation
- [x] Failed-attempt immutability
- [x] Collaborator reuse of canonical economics
- [ ] Cross-product execution coverage
- [ ] Cross-product economic authorization
- [ ] Cross-product reconciliation
- [ ] Personal subscription → economic-profile adapter
- [ ] Personal economic-routing E2E

### 19 — Security / Vault / RLS
**Status: 🟢 VERIFIED — Studio LIVE VERIFIED; collaborator boundary verified; platform-wide closure open**

- [x] Studio RLS
- [x] Vault/service-role secret boundary
- [x] Connector `secret_ref`
- [x] Studio permission enforcement
- [x] Authorization before protected connector use
- [x] Collaborator RLS
- [x] Collaborator organization membership gate
- [x] Negative security E2E
- [ ] Platform-wide tenant isolation
- [ ] Platform-wide credential lifecycle
- [ ] Cross-product authorization
- [x] Personal user-owned capability grants foundation
- [x] Personal permission revocation enforcement at domain/API layer
- [ ] Dedicated security closure

### 20 — Deployment / Lifecycle
**Status: 🟢 VERIFIED — Studio LIVE VERIFIED; E2E 10 Production deployment verified; platform-wide closure open**

- [x] Preview / staging / production lifecycle
- [x] Delivery lifecycle
- [x] Production approval boundary
- [x] Provider deployment verification
- [x] Real production rollback
- [x] Deterministic rollback target resolution
- [x] Runtime verification
- [x] Provider/application reconciliation
- [x] E2E 10 Production deployment READY
- [ ] Personal device/session activation lifecycle
- [ ] Cross-product deployment lifecycle
- [ ] Generalized lifecycle contracts for non-Studio surfaces
- [ ] Dedicated lifecycle closure

## 4. Shared platform progress — evidence boundaries

### Cognitive Core / Memory
**Status: 🟡 IN_PROGRESS**

- [x] Memory Graph schema/foundation
- [x] Semantic cache foundation
- [x] Context/memory service foundation
- [x] Collaborator bounded Memory Graph reads
- [ ] Full short/long-term memory lifecycle
- [ ] Full retrieval/RAG verification
- [ ] Cross-product memory governance
- [ ] Personal memory behavior verification

### Nexus
**Status: 🟢 IMPLEMENTED — current routing foundation; platform-wide closure pending**

- [x] Intent-oriented central orchestration contract
- [x] Provider/model-agnostic architecture
- [x] Context/capability/connector decision model
- [x] Collaborator resolution boundary
- [x] Capability resolution
- [x] Model/provider selection foundation
- [x] Shared execution/economic boundary consumption in E2E 10
- [ ] Full dynamic capability/agent/team composition
- [ ] Full production inference routing
- [ ] OpenRouter pricing/model-data contract for dynamic economics
- [ ] Personal runtime verification
- [ ] Collaborator dynamic pricing/routing verification
- [ ] Cross-product verification

### Capability System
**Status: 🟢 IMPLEMENTED — canonical registry; platform-wide composition closure pending**

- [x] Canonical `capabilities` registry
- [x] Capability/provider/model relationships
- [x] Studio capability composition
- [x] Collaborator capability binding
- [x] Personal capability grant domain
- [ ] Full Nexus-driven platform-wide capability composition
- [ ] Capability governance/compatibility closure

### Provider Adapters
**Status: 🟢 IMPLEMENTED — Studio/Vercel live verified; collaborator text provider path live E2E verified**

- [x] Provider abstraction
- [x] Vercel adapter
- [x] OpenRouter collaborator text path
- [x] Native provider diagnostic preservation
- [x] Provider request/target correlation
- [ ] Generalized multi-provider adapter contract
- [ ] STT adapter
- [ ] TTS adapter
- [ ] Cross-product provider verification

### HITL / Approval
**Status: 🟢 IMPLEMENTED — Studio and collaborator boundaries verified; platform-wide policy pending**

- [x] Revision approval boundary
- [x] Production approval boundary
- [x] Risk/approval fields
- [x] Collaborator `READ/SUGGEST/PREPARE/EXECUTE/AUTONOMOUS` policy boundary
- [x] Personal confirmation/permission domain foundation
- [ ] Platform-wide HITL policy engine
- [ ] Cross-product approval governance

## 5. Evidence matrix

| Area | Current status | Verified scope | Next closure requirement |
|---|---|---|---|
| 01 | 🟢 IMPLEMENTED | Foundation | Global launch closure |
| 02 | 🟡 IN_PROGRESS | Memory foundation + bounded collaborator reads | Full lifecycle/retrieval |
| 03–08 | 🟢 COMPLETE | Historical closure preserved | No reopening without evidence |
| 09 | 🟢 COMPLETE | Studio live lifecycle | None for defined 09 scope |
| 10 | 🟢 COMPLETE | Authenticated Production E2E | Commercial surface/connectors/delegation/team remain separate |
| 11 | 🟡 IN_PROGRESS | Personal core schema/API + production build/deployment | Authenticated E2E + cognition/voice/actions/economics |
| 12 | 🔵 PLANNED | No platform-wide closure | Cross-product audit |
| 13 | 🔵 PLANNED | Architecture defined | Team execution surface |
| 14 | 🔵 PLANNED | No commercial closure | Payment + reconciliation |
| 15 | 🔵 PLANNED | Partial domain boundaries exist | Platform-wide identity/tenant closure |
| 16 | 🟢 IMPLEMENTED | Provider/model foundation + collaborator path | Dynamic routing/economics |
| 17 | 🟢 IMPLEMENTED | Studio scope | Platform-wide fabric |
| 18 | 🟢 IMPLEMENTED | Studio live + collaborator reuse | Cross-product closure |
| 19 | 🟢 VERIFIED | Studio live + collaborator boundary | Personal + platform-wide closure |
| 20 | 🟢 VERIFIED | Studio live + E2E 10 deployment | Personal + cross-product lifecycle |

## 6. Personal dependency/reuse matrix

| Personal requirement | Existing source | Action |
|---|---|---|
| Nexus orchestration | E2E 10 / Nexus | REUSE |
| Canonical capabilities | Shared `capabilities` registry | REUSE |
| Policy/autonomy | E2E 10 | REUSE / EXTEND for personal confirmation |
| Execution budget | Shared execution economics | REUSE |
| Attempts | Shared execution economics | REUSE |
| Usage/cost | Shared execution economics | REUSE |
| Reconciliation | Shared execution economics | REUSE |
| Idempotency | E2E 10 | REUSE |
| Provider/model registry | Shared provider registry | REUSE |
| OpenRouter text path | E2E 10 | REUSE |
| Memory Graph | Cognitive Core / E2E 10 | REUSE / EXTEND semantics |
| RLS/Auth | Shared security foundation | REUSE / EXTEND user ownership |
| Audit/execution logs | Shared execution/audit | REUSE |
| Connector Fabric | 17 | EXTEND/generalize where needed |
| STT/TTS | Provider layer | NEW domain contracts |
| Six identities | Personal product | NEW |
| Personal Identity Profile | Personal product | NEW |
| Capability grants | Security/product boundary | NEW domain contract over canonical capabilities |
| Permission Center | Personal product | NEW |
| Android/device activation | Personal product | NEW |
| App Actions | Personal product + Connector Fabric | NEW/EXTEND |
| Proactivity/pending intents | Personal product + event infrastructure | NEW/EXTEND |
| Personal subscription mapping | Billing/economics | NEW domain mapping; shared billing |

## 7. Audit/reconciliation decisions — 2026-08-13

1. Module 10 remains COMPLETE and is not reopened.
2. Personal is explicitly a **pre-built product**, not a dynamic agent-creation surface.
3. Personal has exactly six official identities: Aline, Luiza, Íris, Clara, Bel and Lúcia.
4. No free-form Personal persona builder is permitted.
5. Personal and Collaborator share Nexus and platform primitives but have different lifecycles: Personal is selected/activated; Collaborator is designed/composed by Nexus from user intent.
6. Personal capability permissions are explicit, user-owned, scoped, auditable and revocable.
7. Personal must not receive unrestricted device authority.
8. Personal must reuse the canonical capability registry, provider/model registry, execution/economic primitives, idempotency, memory foundation, authentication/RLS and audit infrastructure.
9. The provisional Personal price baseline is R$49,90 / R$79,90 / R$159,90. It is not a frozen commercial decision.
10. Personal commercial pricing must be validated against expected, heavy and worst-reasonable legitimate consumption before launch closure.
11. Collaborator pricing remains a separate Nexus-driven flow using objective/task requirements and current provider/model economics.
12. OpenRouter/model pricing is an internal Nexus input, not a user-facing model selection contract.
13. E2E11 core implementation began with Personal-domain schema, fixed persona catalog, authenticated identity activation boundary, capability grant/revocation/audit APIs, and production build verification.
14. The E2E11 core checkpoint is not a Personal product closure; cognition, prompt optimization routing, voice, memory behavior, device activation, App Actions, economic authorization and authenticated production E2E remain open.
15. No existing 03–10 functional scope was reopened or replaced by the E2E11 core implementation.

## 8. Documentation rules for future progress

When an item becomes complete:

`IMPLEMENT/CORRECT → VALIDATE → RECORD EVIDENCE → UPDATE STATUS → DERIVE CHECKBOX → UPDATE CLOSURE IF APPLICABLE → CI → DEPLOY/VERIFY → CONTINUE`

A checkbox never creates evidence. Evidence creates the status; the checkbox mirrors it.

Any shared architectural change updates the Blueprint and Roadmap in the same development cycle.

## 9. Launch readiness

### Global platform gates

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
| Colaboradores Digitais | 🔵 PLANNED | Dedicated product + platform closure; E2E 10 primitive is complete |
| Hórus Personal | 🟡 IN_PROGRESS | Dedicated product + platform closure |
| Hórus Operations | 🔵 PLANNED | Dedicated product + platform closure |
| Studio Projects | 🟢 COMPLETE | 09 closure + applicable platform gates |

## 10. Next-module boundary

**10 — Agents / Digital Collaborators is CLOSED.** Its closure evidence is recorded in `docs/blueprint/10-AGENTS-CLOSURE.md`.

**11 — Hórus Personal is now in `🟡 IN_PROGRESS`.** The first E2E11 core checkpoint is implemented and production-built. The next implementation work must continue from the 03–10 primitives and Personal-domain contracts only; it must not rebuild shared Nexus, capabilities, economics, provider registry or memory infrastructure.
