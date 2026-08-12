# Hórus Architecture Lock

**Status:** ACTIVE / PERMANENT DOCUMENTATION CONTRACT  
**Canonical architecture:** `docs/blueprint/HORUS-MASTER-BLUEPRINT.md`  
**Canonical progress authority:** `docs/blueprint/ROADMAP.md`  
**Evidence authority:** closure/evidence documents

## Purpose

This document prevents documentation drift, silent architectural deletion, false progress claims and accidental promotion of Studio-scoped evidence into platform-wide claims. It applies to every Hórus development cycle.

## Permanent rules

1. **Blueprint Master is the architectural authority.** It defines what Hórus is.
2. **`docs/blueprint/ROADMAP.md` is the progress authority.** It defines where Hórus is.
3. **Closure/evidence documents are evidence.** They prove why a gate is considered complete; they do not redefine architecture.
4. **The root `ROADMAP.md`, if retained, is only a compatibility/navigation bridge.** It must not duplicate or independently define progress.
5. **No parallel progress registry may be created.** There is one canonical Roadmap and one canonical Blueprint.
6. **No module may be marked COMPLETE without direct evidence against its closure criteria.**
7. **A COMPLETE module cannot regress to PARTIAL/NOT_STARTED without a technically proven regression recorded with cause, evidence and affected version/SHA.**
8. **No architectural component may be removed silently.** Architectural change requires explicit Blueprint reconciliation.
9. **Every architectural change updates the Blueprint Master in the same development cycle.**
10. **Every material functional change updates the canonical Roadmap in the same development cycle.**
11. **Every relevant migration records migration/evidence.** Schema, RLS, RPC, Vault and data-contract changes require explicit evidence.
12. **Every E2E records provider evidence when applicable:** provider, execution, attempt, budget, logs, deployment, target/current deployment and SHA/provenance.
13. **Progress is reconciled after every significant execution.**
14. **Historical documentation cannot override current verified state.** Historical evidence remains preserved for provenance.
15. **Never fabricate PASS by inference.** READY, mergeability, code existence, badges or application lifecycle flags are not substitutes for direct gate evidence.
16. **Tooling limitation ≠ product failure.** Unavailable evidence must be classified as unavailable, not converted into a functional defect.
17. **Never create a parallel registry/architecture when a canonical source already exists.** Extend/reconcile the canonical source.
18. **Provider state ≠ application state.** Application state cannot claim an external side effect without provider evidence.
19. **Delivery Anchor is provenance, not a generic rollback target.** Rollback targets follow the canonical provider-history policy.
20. **Failed historical executions are immutable evidence.** Reconciliation fixes must never rewrite failure history into success.
21. **Economic state is part of execution correctness.** Successful terminal attempts must reconcile budget state, terminal timestamp and usage/cost evidence.
22. **Studio-scoped evidence cannot prove platform-wide completion.** A Studio E2E may establish Studio-scoped `VERIFIED`/`LIVE VERIFIED`/`COMPLETE`, but transversal modules require evidence covering their own platform contract.
23. **Roadmap order ≠ dependency order.** Historical module IDs may remain stable while the Blueprint dependency graph remains authoritative.
24. **Global market readiness is a separate gate.** No single surface or Studio closure can promote Hórus globally to `READY FOR MARKET`.
25. **Each commercial surface requires its own closure/evidence before being considered launch-ready.**
26. **Checkboxes are derived evidence markers, not a registry.** `[x]` is permitted only when the corresponding item has sufficient evidence for its stated status. `[ ]` means not complete; `🟡 IN_PROGRESS` remains `[ ]` unless and until its evidence supports promotion.
27. **Historical preservation is mandatory.** Moving the Roadmap into `docs/blueprint/` must not delete Git history or rewrite the meaning of previous closures.
28. **Cross-domain progress must be preserved.** Execution/Economics, Connector Fabric, Security, Deployment/Lifecycle and other transversal capabilities already proved cannot be erased or incorrectly reduced to Studio-only when the evidence demonstrates broader scope. Conversely, Studio evidence cannot be promoted to platform-wide proof.
29. **Every reconciliation of already-closed modules must audit available historical evidence before changing status.** Missing current artifacts must be reported as an evidence boundary; no new unsupported component claims may be invented.
30. **After any correction, continue autonomously.** Do not return to the user for intermediate discoveries when the required action is within authorized technical scope.
31. **The mandatory operational loop is:** `DETECT → CORRECT → VALIDATE → REAUDIT → DOCUMENT → CONTINUE`.
32. **CI/deploy validation is asynchronous work, not a user step.** Never report `IN_PROGRESS` as a blocker; wait for a conclusive result when the integration permits it.
33. **No next-module implementation starts merely because documentation was rewritten.** Complete reconciliation and validation first.
34. **Documentation remains atomic.** Update only the documents whose architectural/progress/evidence responsibilities are affected; preserve history and avoid duplicate registries.
35. **Digital Collaborators must reuse the canonical execution/economic primitives.** Agent-specific budgets, attempts, usage or reconciliation registries are prohibited when the shared platform contract already exists.
36. **Autonomy is an execution boundary, not metadata.** `SUGGEST` and `PREPARE` cannot silently cross into provider execution; `EXECUTE`/`AUTONOMOUS` require the applicable authorization and economic gates.
37. **Tenant authorization precedes privileged collaborator resolution.** Service-role execution paths must validate organization membership/ownership before reading or mutating tenant-scoped collaborator state.
38. **Collaborator capabilities reuse the canonical capability registry.** A collaborator-owned capability registry is prohibited.

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

`ROADMAP.md` in `docs/blueprint/` defines **where Hórus is**.

`09-STUDIO-CLOSURE.md` and future closure files define **why a completed gate is considered complete**.

The root `ROADMAP.md` is only a compatibility bridge and cannot silently replace the canonical document.
