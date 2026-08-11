# 09 — STUDIO — DEFINITIVE OPERATIONAL CLOSURE

> **Historical record preserved:** the previous closure remains available in Git history at commit `96df0e8483a8af76f43caba26e4189fb53ea447b`. Its original conclusion was `🟡 PARTIAL` because live provider execution and rollback evidence were not yet available at that time. This document now records the later verified state; the historical evidence is not rewritten or treated as if it never existed.

## RECONCILED FINAL STATE

**Status:** 🟢 COMPLETE  
**Reconciled:** 2026-08-11  
**Revision:** `Revision 1 · MAJOR`  
**Approval:** `APPROVED`  
**Preview:** `READY · VERIFIED`  
**Staging:** `READY · VERIFIED`  
**Delivery:** `DELIVERED · VERIFIED`

### 1. Final E2E result

The Studio rollback was executed through the authenticated Studio flow against the real Vercel provider. The provider confirmed the production mutation and the system subsequently reconciled the operation through execution, attempt, budget and execution-log layers.

Final rollback target:

`dpl_Hq1KzZzk9hMQqPGHhXEjrNVvY2bk`

Final restored deployment:

- Vercel project: `prj_xQDty1690tXrnIWH4IIHOOXWF7CG`
- deployment: `dpl_Hq1KzZzk9hMQqPGHhXEjrNVvY2bk`
- environment: `production`
- status: `READY`
- SHA: `843170948682f23e5d23a43811bd9a12bb5d3eb8`
- runtime: no `error`/`fatal` evidence in the verified post-rollback window.

### 2. Rollback target contract

The E2E exposed and corrected a real architectural defect: the Delivery Anchor had been used as the operational rollback target.

Historical failed attempt:

- operation: `3bae0b04-009a-49a9-97c4-aa1532f35a4c`
- attempt: `b5bd13ab-065d-4b63-b845-f289993722de`
- budget: `6884863f-c56c-47e5-a7ab-a21ef4e40c2d`
- provider response: HTTP `402`
- `error.code`: `unprocessable_entity`
- native message: `To rollback further than the previous production deployment, upgrade to pro.`
- erroneous target: `dpl_6aVQ6ztZuam8kr6pqrofGBJH4puM`

The failure was preserved. The architecture was corrected so that:

**Delivery Anchor ≠ Rollback Target.**

The canonical rollback policy is:

`PREVIOUS_READY_PRODUCTION`

The resolver uses Current Production as authority, enumerates provider Production history, requires the same project, `production` target, `READY` status and `createdAt < current`, and selects the immediate temporal predecessor. The Delivery Anchor remains provenance only.

The successful rollback therefore resolved, persisted and sent:

`dpl_Hq1KzZzk9hMQqPGHhXEjrNVvY2bk`

### 3. Execution reconciliation

The real rollback was reconciled as:

- execution: `SUCCEEDED`;
- attempt: `SUCCEEDED`;
- provider: Vercel;
- provider request/target: reconciled with the target above;
- execution log: `COMPLETED`;
- budget: `SETTLED`;
- terminal budget completion timestamp: persisted;
- usage/cost reconciliation: persisted;
- remaining attempts: reconciled to zero where applicable.

The reconciliation defect discovered after the first successful provider mutation was fixed in the canonical reconciliation logic rather than by rewriting historical data.

The earlier failed execution remains FAILED and immutable as historical evidence.

### 4. CI / deployment evidence

The rollback-target correction and subsequent reconciliation correction were versioned through GitHub and validated through the canonical CI workflow. The corrected implementation reached Production and its Vercel status was `READY` with clean runtime evidence.

The final documentation reconciliation is intentionally documentation-only and does not alter the runtime contract established by the completed E2E.

### 5. Connector / Vault / authorization

Verified during the E2E:

- Connector: `CONNECTED`;
- `ROLLBACK_PRODUCTION`: present;
- required permissions: present;
- `secret_ref`: resolvable;
- Vault secret reference: valid;
- authorization boundary: enforced;
- provider adapter: Vercel;
- native provider response: retained as diagnostic evidence.

### 6. Lifecycle integrity

The application lifecycle and provider lifecycle were reconciled rather than treated as interchangeable.

Final application state:

`APPROVED → PREVIEW VERIFIED → STAGING VERIFIED → PRODUCTION VERIFIED → DELIVERY VERIFIED → ROLLBACK VERIFIED`

The provider state independently confirmed the restored Production deployment.

### 7. Database / security evidence

The Studio execution domain was live-inspected during E2E:

- Studio project/revision/execution records are persisted;
- execution/attempt/budget relationships are reconciled;
- RLS is enabled and the intended Studio policies were verified;
- Vault functions are service-role-only;
- connector rows retain `secret_ref`, not plaintext credentials;
- no historical failed execution was rewritten;
- the terminal budget completion defect was corrected at the reconciliation contract.

### 8. Historical evidence classification

The original closure dated 2026-08-07 correctly reported the evidence available **at that time** as `🟡 PARTIAL`. It must not be read as the current state after the subsequent live E2E.

Git history retains the original document and all prior evidence. This reconciled closure adds the later facts rather than erasing the historical boundary.

### 9. Final evidence matrix

| Gate | Final state |
|---|---|
| Approved Revision | 🟢 VERIFIED |
| Preview | 🟢 READY + VERIFIED |
| Staging | 🟢 READY + VERIFIED |
| Production | 🟢 READY + VERIFIED |
| Delivery | 🟢 DELIVERED + VERIFIED |
| Real provider rollback | 🟢 LIVE VERIFIED |
| Rollback target | 🟢 VERIFIED — immediate previous READY Production |
| Current Production reconciliation | 🟢 VERIFIED |
| Execution | 🟢 SUCCEEDED |
| Attempt | 🟢 SUCCEEDED |
| Budget | 🟢 SETTLED |
| Execution log | 🟢 COMPLETED |
| Provider response | 🟢 RECONCILED |
| Connector | 🟢 VERIFIED |
| Vault / secret_ref | 🟢 VERIFIED |
| Runtime | 🟢 VERIFIED — no error/fatal evidence |
| Reconciliation | 🟢 VERIFIED |
| Lifecycle | 🟢 VERIFIED |

# FINAL DECISION

## 🟢 09 — STUDIO — COMPLETE

E2E 09 is closed. No Block 10 work was started by this reconciliation. Future Studio changes must preserve the canonical `PREVIOUS_READY_PRODUCTION` rollback policy, execution/economic reconciliation contract and evidence requirements defined in the Master Blueprint and Architecture Lock.
