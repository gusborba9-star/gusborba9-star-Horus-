# Hórus Cognitive OS — Global Roadmap

**Canonical architecture:** `docs/blueprint/HORUS-MASTER-BLUEPRINT.md`  
**Progress authority:** this file  
**Integrity rules:** `docs/blueprint/ARCHITECTURE-LOCK.md`  
**Last global reconciliation:** 2026-08-11

## 1. Product architecture

Hórus is not the Studio alone. The commercial architecture has four first-class surfaces sharing the transversal Nexus and Cognitive Core:

1. **Colaboradores Digitais** — specialized digital employees for any niche/profession/company. **Monthly subscription.**
2. **Hórus Personal** — personal collaborator for everyday and professional contexts, with text and voice as first-class modalities. **Monthly subscription.**
3. **Hórus Operations** — coordinated cognitive team for operating a company/business operation. **Monthly subscription.**
4. **Studio Hórus / Projects** — universal intent-to-project environment with one-time project payment.

The user declares intent. Nexus internally chooses the required context, agents, capabilities, models, connectors and execution strategy. Product surfaces do not require manual provider/model selection.

## 2. Status taxonomy

- 🔒 **NOT_STARTED** — no implementation work started.
- 🔵 **PLANNED** — architecture/plan established, implementation not established.
- 🟡 **IN_PROGRESS** — active implementation/validation.
- 🟢 **IMPLEMENTED** — implementation exists.
- 🟢 **VERIFIED** — implementation has direct validation evidence.
- 🟢 **COMPLETE** — all defined closure gates are satisfied and evidence is recorded.
- ⚠️ **BLOCKED** — progress is prevented by a proven external/unresolved dependency.

A status is never promoted by inference.

## 3. Global module map

| Module | Status | Current evidence / boundary |
|---|---|---|
| 01 — Core / Foundation | 🟢 IMPLEMENTED | Supabase, LangGraph, Stripe and base Hórus Core foundations exist in repository history. Broader launch readiness remains governed by downstream modules. |
| 02 — Cognitive Core / Memory | 🟡 IN_PROGRESS | Memory Graph foundation exists; broader short/long-term memory, pruning, TTL and full cognitive behavior remain to be independently verified. |
| 03–08 — Prior closed blocks | 🟢 COMPLETE | Preserved as closed historical architecture; this reconciliation does not reopen them. Their closure evidence remains authoritative for their individual gates. |
| 09 — Studio / Projects | 🟢 COMPLETE | Real provider rollback, successful execution/attempt, settled budget, completed log, reconciliation fix, CI success, Production READY, clean runtime and deterministic rollback-target policy verified. See `docs/blueprint/09-STUDIO-CLOSURE.md`. |
| 10 — Agents / Collaborators | 🔒 NOT_STARTED | No functional work started by this reconciliation. Architecture is defined in Master Blueprint. |
| 11 — Hórus Personal | 🔵 PLANNED | Commercial/product architecture defined; text/voice product implementation not started/verified. |
| 12 — Observability | 🔵 PLANNED | Transversal architecture defined; independent module not closed by Studio evidence. |
| 13 — Hórus Operations | 🔵 PLANNED | Commercial/team operating model defined; implementation not started/verified. |
| 14 — Billing / Monetization | 🔵 PLANNED | Canonical commercial models defined; broader production billing flows require implementation/verification. |
| 15 — Workspace / Multi-tenant | 🔵 PLANNED | Architectural boundary defined; full cross-product implementation not verified. |
| 16 — Inference / Model Routing | 🔵 PLANNED | Provider/model-invisible routing architecture defined; full production router not independently closed. |
| 17 — Connector / Plugin Fabric | 🟢 IMPLEMENTED | Studio connector architecture for GitHub/Vercel/Supabase is implemented and structurally verified; expansion to broader connector catalog remains planned. |
| 18 — Execution / Economics | 🟢 IMPLEMENTED | Execution/attempt/budget/reconciliation contracts exist and were live-verified during E2E 09; broader cross-product execution coverage remains to be verified. |
| 19 — Security / Vault / RLS | 🟢 VERIFIED | Studio RLS/Vault boundary and Security Advisor state were live verified; broader tenant/security coverage remains module-dependent. |
| 20 — Deployment / Lifecycle | 🟢 VERIFIED | Studio Preview/Staging/Production/Delivery lifecycle and real rollback were verified during E2E 09. Generalized cross-product lifecycle remains future work. |

## 4. Shared architecture dependencies

`Identity / Workspace`  
→ `Cognitive Core / Memory / RAG`  
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

Commercial surfaces consume these shared services rather than creating parallel stacks.

## 5. 09 — STUDIO — COMPLETE

### Closure evidence

- Revision: `Revision 1 · MAJOR`
- Approval: `APPROVED`
- Preview: `READY · VERIFIED`
- Staging: `READY · VERIFIED`
- Delivery: `DELIVERED · VERIFIED`
- Real Vercel rollback executed through the authenticated Studio flow.
- Provider restored Production to `dpl_Hq1KzZzk9hMQqPGHhXEjrNVvY2bk`.
- Restored deployment: `READY`, `production`, SHA `843170948682f23e5d23a43811bd9a12bb5d3eb8`.
- Rollback policy: `PREVIOUS_READY_PRODUCTION`.
- Delivery Anchor was preserved as provenance and was not used as rollback target.
- Execution: `SUCCEEDED`.
- Attempt: `SUCCEEDED`.
- Budget: `SETTLED`.
- Execution log: `COMPLETED`.
- Reconciliation logic was corrected to persist terminal budget completion correctly.
- CI for the corrected implementation: `SUCCESS`.
- Production runtime: no `error/fatal` evidence after the corrected deployment.
- Connector: `CONNECTED`.
- `ROLLBACK_PRODUCTION`: available.
- Vault `secret_ref`: resolvable.

### Important historical evidence

The earlier failed rollback is preserved as evidence. The provider returned HTTP 402 with `error.code=unprocessable_entity` and the native message that the selected Delivery Anchor was farther back than the previous Production deployment allowed by the current Vercel plan. This proved the architectural distinction:

**Delivery Anchor ≠ Rollback Target.**

The resolver was corrected to use Current Production plus provider deployment history and select the immediate previous eligible READY Production deployment.

The failed historical execution was not rewritten into success.

## 6. Current launch-readiness boundary

The Hórus platform is **not globally launch-ready** merely because Studio 09 is complete. Launch readiness must be established per commercial surface and then at platform level.

Before a surface is marked COMPLETE, its roadmap closure must demonstrate, as applicable:

- intent/Nexus behavior;
- agent/capability composition;
- model routing;
- connector security;
- execution idempotency;
- economic authorization;
- billing;
- provider side-effect verification;
- runtime reliability;
- observability/audit;
- RLS/Vault/security;
- recovery/rollback;
- CI/deployment evidence.

## 7. Next-module boundary

**No next functional module was started during this reconciliation.**

The next module must be selected from this global roadmap only after the current documentation source of truth is accepted and the dependency graph is respected.

10 — AGENTS remains `🔒 NOT_STARTED`.

## 8. Documentation integrity

The Master Blueprint defines architecture. This Roadmap defines progress. Closure documents provide evidence. `ARCHITECTURE-LOCK.md` governs non-regression and reconciliation.

Historical documentation remains preserved and is not deleted merely because its evidence boundary was later superseded. Current verified evidence takes precedence when determining current status.
