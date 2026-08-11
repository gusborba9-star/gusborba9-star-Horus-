# Hórus Cognitive OS — Global Roadmap

**Canonical architecture:** `docs/blueprint/HORUS-MASTER-BLUEPRINT.md`  
**Progress authority:** this file  
**Integrity rules:** `docs/blueprint/ARCHITECTURE-LOCK.md`  
**Last global reconciliation:** 2026-08-11

## 1. Product architecture

Hórus has four first-class commercial surfaces sharing the transversal Nexus and Cognitive Core:

1. **Colaboradores Digitais** — specialized digital employees for any niche, profession, market, company or function. **Monthly subscription.**
2. **Hórus Personal** — personal cognitive collaborator for everyday/professional contexts, with **text + voice**. **Monthly subscription.**
3. **Hórus Operations** — coordinated cognitive team for operating companies/processes. **Monthly subscription.**
4. **Studio Hórus / Projects** — universal intent-to-project environment. **One-time payment per project.**

The user declares intent. Nexus internally selects the required context, memory, agents/teams, capabilities, models, providers, connectors and execution strategy. Product surfaces do not require manual internal architecture selection.

## 2. Status taxonomy

- 🔒 **NOT_STARTED** — no functional implementation started.
- 🔵 **PLANNED** — architecture/plan established; implementation not established.
- 🟡 **IN_PROGRESS** — active implementation/validation.
- 🟢 **IMPLEMENTED** — implementation exists.
- 🟢 **VERIFIED** — direct validation evidence exists.
- 🟢 **COMPLETE** — all module closure gates are satisfied and evidence is recorded.
- ⚠️ **BLOCKED** — proven external/unresolved dependency prevents progress.

A status is never promoted by inference. Evidence qualifiers may specify `Studio-scoped`, `platform-wide`, or `LIVE VERIFIED` where needed.

## 3. Progress map — historical module IDs preserved

> **Important:** roadmap order ≠ architectural dependency order. IDs 01–20 preserve project sequencing/history. The authoritative architectural dependency graph is in the Master Blueprint §18.

| Module | Status | Scope / evidence boundary |
|---|---|---|
| 01 — Core / Foundation | 🟢 IMPLEMENTED | Base Hórus/Supabase/LangGraph foundations exist in repository history; not a global launch gate closure. |
| 02 — Cognitive Core / Memory | 🟡 IN_PROGRESS | Memory foundation exists; broader short/long-term memory, pruning/TTL and complete cognitive behavior remain independently unverified. |
| 03–08 — Prior closed blocks | 🟢 COMPLETE | Historical closures preserved; not reopened by this reconciliation. |
| 09 — Studio / Projects | 🟢 COMPLETE | **Studio-scoped + LIVE VERIFIED:** real Vercel rollback, execution/attempt success, budget settled, log completed, reconciliation corrected, CI success, Production READY, clean runtime, Connector/Vault and deterministic rollback target. See closure. |
| 10 — Agents / Collaborators | 🔒 NOT_STARTED | Next functional module. Architecture defined; no functional implementation started here. |
| 11 — Hórus Personal | 🔵 PLANNED | Commercial architecture defined; text/voice product not implemented/verified. |
| 12 — Observability | 🔵 PLANNED | Transversal architecture defined; Studio evidence does not close platform-wide observability. |
| 13 — Hórus Operations | 🔵 PLANNED | Commercial team architecture defined; implementation not started/verified. |
| 14 — Billing / Monetization | 🔵 PLANNED | Commercial models defined; production billing flows not independently implemented/verified. |
| 15 — Workspace / Identity / Multi-tenant | 🔵 PLANNED | Architectural boundary defined; full cross-product tenant implementation not verified. |
| 16 — Inference / Model Routing | 🔵 PLANNED | Provider/model-agnostic architecture defined; full production router not independently closed. |
| 17 — Connector / Plugin Fabric | 🟢 IMPLEMENTED | **Studio-scoped:** canonical connector architecture/integrations for GitHub, Vercel, Supabase are implemented/verified. Platform-wide extensible fabric, registry manifest lifecycle, OAuth/credentials/health/rate-limit/webhook/version compatibility remain to be completed. |
| 18 — Execution / Economics | 🟢 IMPLEMENTED | **Studio-scoped + LIVE VERIFIED:** execution/attempt/budget/reconciliation contract proven in E2E 09. Cross-product execution coverage remains unverified. |
| 19 — Security / Vault / RLS | 🟢 VERIFIED | **Studio-scoped + LIVE VERIFIED:** RLS/Vault boundary and relevant security state verified. Platform-wide tenant/security coverage remains open. |
| 20 — Deployment / Lifecycle | 🟢 VERIFIED | **Studio-scoped + LIVE VERIFIED:** Preview/Staging/Production/Delivery and real rollback verified. Generalized cross-product lifecycle remains open. |

## 4. Architectural dependency order — authoritative graph

The following is copied conceptually from the Blueprint and is **not** a claim that roadmap IDs execute in this sequence:

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

## 5. Shared platform vs Studio scope

### Platform-wide architecture

The Blueprint defines shared contracts for Identity/Workspace, Cognitive Core, Nexus, Agents, Capabilities, Inference, Connector Fabric, Execution/Economics, Provider Adapters, Lifecycle, Observability, Security and Billing.

### Currently directly proven in Studio

The following evidence is **not automatically platform-wide**:

- Connector security/operations — Studio-scoped;
- Execution/Economics — Studio-scoped;
- Security/Vault/RLS — Studio-scoped;
- Deployment/Lifecycle — Studio-scoped.

When a module has code but only Studio evidence, keep `IMPLEMENTED`/`VERIFIED` with a scope qualifier rather than promoting it to global `COMPLETE`.

## 6. 09 — STUDIO — COMPLETE

### Closure evidence

- Revision: `Revision 1 · MAJOR`
- Approval: `APPROVED`
- Preview: `READY · VERIFIED`
- Staging: `READY · VERIFIED`
- Delivery: `DELIVERED · VERIFIED`
- Real Vercel rollback executed through authenticated Studio flow.
- Provider restored Production to `dpl_Hq1KzZzk9hMQqPGHhXEjrNVvY2bk`.
- Restored deployment: `READY`, `production`, SHA `843170948682f23e5d23a43811bd9a12bb5d3eb8`.
- Rollback policy: `PREVIOUS_READY_PRODUCTION`.
- Delivery Anchor is provenance only; it is not the operational rollback target.
- Execution: `SUCCEEDED`.
- Attempt: `SUCCEEDED`.
- Budget: `SETTLED`.
- Execution log: `COMPLETED`.
- Reconciliation logic corrected terminal budget completion.
- Corrected implementation passed canonical CI.
- Production runtime had no `error/fatal` evidence after corrected deployment.
- Connector `CONNECTED`; `ROLLBACK_PRODUCTION` available; Vault `secret_ref` resolvable.

The earlier failed rollback remains immutable evidence and was not rewritten.

## 7. Launch readiness — explicit global gate

**Global Hórus status: NOT READY FOR MARKET.**

Completing one surface never promotes the entire Hórus to market-ready.

### Shared platform gates required for global launch readiness

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

Each surface intended for launch requires its own closure/evidence:

| Surface | Closure required |
|---|---|
| Colaboradores Digitais | Dedicated closure + platform gates |
| Hórus Personal | Dedicated closure + platform gates |
| Hórus Operations | Dedicated closure + platform gates |
| Studio Projects | 09 closure + applicable platform gates |

A surface can be COMPLETE without making another surface COMPLETE.

## 8. Next-module boundary

**No functional module was started by this reconciliation.**

`10 — Agents / Collaborators` remains **🔒 NOT_STARTED** and is the next functional module. This statement does not override the Blueprint dependency graph; it identifies the next project work item after the documentation gate.

## 9. Evidence and documentation integrity

- Blueprint = what Hórus is.
- Roadmap = where Hórus is.
- Closures = why a gate is considered complete.
- Architecture Lock = permanent anti-drift/non-regression rules.
- Historical documents are preserved.
- Current verified evidence determines current status.
- Studio evidence is never silently promoted to platform-wide proof.
