# Hórus Architecture Lock

**Status:** ACTIVE / PERMANENT DOCUMENTATION CONTRACT  
**Canonical architecture:** `docs/blueprint/HORUS-MASTER-BLUEPRINT.md`  
**Progress authority:** `ROADMAP.md`

## Purpose

This document prevents documentation drift, silent architectural deletion and false progress claims. It applies to every future Hórus development cycle.

## Permanent rules

1. **Blueprint Master is the architectural authority.** Product and platform architecture must be reconciled against `docs/blueprint/HORUS-MASTER-BLUEPRINT.md`.
2. **Roadmap is the progress authority.** Module status, evidence, blockers and dependencies belong in `ROADMAP.md`.
3. **Closure documents are evidence, not architectural substitutes.** A closure records what happened and proves gates; it does not redefine the whole Hórus architecture.
4. **No module may be marked COMPLETE without evidence.** Evidence must identify the relevant implementation, validation and live/provider state when applicable.
5. **A COMPLETE module cannot regress to PARTIAL/NOT_STARTED without a technically proven regression.** Any regression must be recorded with cause, evidence and affected version/SHA.
6. **No architectural component may be removed silently.** If architecture changes, the Blueprint must be updated explicitly and the Roadmap impact recorded.
7. **Every architectural change updates the Blueprint Master.** The update must happen in the same development cycle.
8. **Every material functional change updates the Roadmap.** Progress must reflect actual repository/database/provider evidence.
9. **Every relevant migration records migration/evidence.** Schema, RLS, RPC, Vault and data-contract changes require explicit evidence.
10. **Every E2E records provider evidence when applicable.** At minimum: provider, execution, attempt, budget, logs, deployment, target/current deployment and SHA/provenance.
11. **Progress is reconciled after every significant execution.** Do not leave documentation claiming an older state after the system has materially advanced.
12. **Historical documentation cannot override current verified state.** Historical documents are retained for provenance and chronology.
13. **Never fabricate PASS by inference.** READY, mergeability, existence of code or an application lifecycle flag is not a substitute for direct evidence of the required gate.
14. **Never turn a tooling limitation into a product failure.** If a tool cannot expose evidence, classify the evidence as unavailable and distinguish that from a functional defect.
15. **Never create a parallel registry/architecture when a canonical source already exists.** Extend or reconcile the existing source instead.
16. **Provider state and application state are distinct.** An application status must not claim an external side effect without provider evidence.
17. **Delivery Anchor is provenance, not a generic rollback target.** Rollback targets must be resolved according to the canonical provider-history policy.
18. **Failed historical executions are immutable evidence.** Reconciliation fixes must not rewrite a failed operation into success.
19. **Economic state is part of execution correctness.** Successful terminal attempts must reconcile their budget correctly, including terminal timestamps and usage.
20. **No next-module implementation starts merely because a preceding document was rewritten.** Global documentation reconciliation must complete first.

## Status taxonomy

Use exactly these roadmap states:

- 🔒 `NOT_STARTED`
- 🔵 `PLANNED`
- 🟡 `IN_PROGRESS`
- 🟢 `IMPLEMENTED`
- 🟢 `VERIFIED`
- 🟢 `COMPLETE`
- ⚠️ `BLOCKED`

Use evidence qualifiers where necessary: `IMPLEMENTED`, `VERIFIED`, `LIVE VERIFIED`, `COMPLETE`. Never promote an implementation-only state to COMPLETE without its closure criteria.

## Reconciliation protocol

After any correction, implementation, migration, deployment, CI, E2E, architectural, database, connector, provider, lifecycle, economic/reconciliation or security change:

`DETECT → CORRECT → VALIDATE → REAUDIT → DOCUMENT → CONTINUE`

Validation must cover all affected layers, not merely the changed file. If validation fails, correct and repeat until the affected contract is consistent or a genuine external blocker is proven.

## Canonical relationship

`HORUS-MASTER-BLUEPRINT.md` defines **what Hórus is**.

`ROADMAP.md` defines **where Hórus is**.

`09-STUDIO-CLOSURE.md` and future closure files define **why a completed gate is believed to be complete**.

No one of these documents may silently replace the role of another.
