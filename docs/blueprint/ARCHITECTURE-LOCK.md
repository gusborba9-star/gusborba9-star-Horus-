# Hórus Architecture Lock

**Status:** ACTIVE / PERMANENT DOCUMENTATION CONTRACT  
**Canonical architecture:** `docs/blueprint/HORUS-MASTER-BLUEPRINT.md`  
**Progress authority:** `ROADMAP.md`  
**Evidence authority:** closure/evidence documents

## Purpose

This document prevents documentation drift, silent architectural deletion, false progress claims and accidental promotion of Studio-scoped evidence into platform-wide claims. It applies to every Hórus development cycle.

## Permanent rules

1. **Blueprint Master is the architectural authority.** It defines what Hórus is.
2. **Roadmap is the progress authority.** It defines where Hórus is.
3. **Closure/evidence documents are evidence.** They prove why a gate is considered complete; they do not redefine architecture.
4. **No module may be marked COMPLETE without direct evidence against its closure criteria.**
5. **A COMPLETE module cannot regress to PARTIAL/NOT_STARTED without a technically proven regression recorded with cause, evidence and affected version/SHA.**
6. **No architectural component may be removed silently.** Architectural change requires explicit Blueprint reconciliation.
7. **Every architectural change updates the Blueprint Master in the same development cycle.**
8. **Every material functional change updates the Roadmap in the same development cycle.**
9. **Every relevant migration records migration/evidence.** Schema, RLS, RPC, Vault and data-contract changes require explicit evidence.
10. **Every E2E records provider evidence when applicable:** provider, execution, attempt, budget, logs, deployment, target/current deployment and SHA/provenance.
11. **Progress is reconciled after every significant execution.**
12. **Historical documentation cannot override current verified state.** Historical evidence remains preserved for provenance.
13. **Never fabricate PASS by inference.** READY, mergeability, code existence, badges or application lifecycle flags are not substitutes for direct gate evidence.
14. **Tooling limitation ≠ product failure.** Unavailable evidence must be classified as unavailable, not converted into a functional defect.
15. **Never create a parallel registry/architecture when a canonical source already exists.** Extend/reconcile the canonical source.
16. **Provider state ≠ application state.** Application state cannot claim an external side effect without provider evidence.
17. **Delivery Anchor is provenance, not a generic rollback target.** Rollback targets follow the canonical provider-history policy.
18. **Failed historical executions are immutable evidence.** Reconciliation fixes must never rewrite failure history into success.
19. **Economic state is part of execution correctness.** Successful terminal attempts must reconcile budget state, terminal timestamp and usage/cost evidence.
20. **Studio-scoped evidence cannot prove platform-wide completion.** A Studio E2E may establish Studio-scoped `VERIFIED`/`LIVE VERIFIED`/`COMPLETE`, but transversal modules require evidence covering their own platform contract.
21. **Roadmap order ≠ dependency order.** Historical module IDs may remain stable while the Blueprint dependency graph remains authoritative.
22. **Global market readiness is a separate gate.** No single surface or Studio closure can promote Hórus globally to `READY FOR MARKET`.
23. **Each commercial surface requires its own closure/evidence before being considered launch-ready.**
24. **After any correction, continue autonomously.** Do not return to the user for intermediate discoveries when the required action is within authorized technical scope.
25. **The mandatory operational loop is:** `DETECT → CORRECT → VALIDATE → REAUDIT → DOCUMENT → CONTINUE`.
26. **CI/deploy validation is asynchronous work, not a user step.** Never report `IN_PROGRESS` as a blocker; wait for a conclusive result when the integration permits it.
27. **No next-module implementation starts merely because documentation was rewritten.** Complete reconciliation and validation first.
28. **Documentation remains atomic.** Update only the documents whose architectural/progress/evidence responsibilities are affected; preserve history and avoid duplicate registries.

## Status taxonomy

Use exactly these roadmap states:

- 🔒 `NOT_STARTED`
- 🔵 `PLANNED`
- 🟡 `IN_PROGRESS`
- 🟢 `IMPLEMENTED`
- 🟢 `VERIFIED`
- 🟢 `COMPLETE`
- ⚠️ `BLOCKED`

Use evidence qualifiers where useful: `Studio-scoped`, `platform-wide`, `LIVE VERIFIED`. Never promote an implementation-only state to COMPLETE without closure evidence.

## Reconciliation protocol

After any correction, implementation, migration, deployment, CI, E2E, architectural, database, connector, provider, lifecycle, economic/reconciliation or security change:

`DETECT → CORRECT → VALIDATE → REAUDIT → DOCUMENT → CONTINUE`

Validation covers every affected layer. If validation fails, correct and repeat until the affected contract is consistent or a genuine external blocker is proven.

## Canonical relationship

`HORUS-MASTER-BLUEPRINT.md` defines **what Hórus is**.

`ROADMAP.md` defines **where Hórus is**.

`09-STUDIO-CLOSURE.md` and future closure files define **why a completed gate is considered complete**.

No one of these documents may silently replace another document's role.
