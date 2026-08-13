# Hórus — Roadmap Delta: Cognitive Fabric & Adaptive Intelligence

**Canonical parent:** `docs/blueprint/ROADMAP.md`  
**Architecture source:** `docs/blueprint/HORUS-MASTER-BLUEPRINT.md`  
**Architecture extension:** `docs/blueprint/HORUS-COGNITIVE-FABRIC-PRINCIPLES.md`  
**Date:** 2026-08-13

> This file records structural progress for the future-proof intelligence layer. It does not mark implementation as complete unless direct evidence exists.

## A. Cross-product intelligence foundation

**Status: 🔵 PLANNED / FOUNDATION PARTIALLY IMPLEMENTED**

- [x] Provider-neutral model registry foundation exists
- [x] OpenRouter text provider path exists
- [x] Shared execution/economic primitives exist
- [x] Nexus collaborator routing boundary exists
- [ ] Generalized platform-wide adaptive routing contract
- [ ] Task Profile contract
- [ ] Capability-aware model scoring
- [ ] Quality/cost/latency optimization policy
- [ ] Provider health-aware routing
- [ ] Deterministic fallback strategy
- [ ] Cross-product routing verification

## B. Prompt / Task Optimization

**Status: 🔵 PLANNED — shared Cognitive Core primitive**

- [ ] Canonical raw-intent normalization boundary
- [ ] Intent extraction
- [ ] Context-aware task enrichment
- [ ] Ambiguity/missing-constraint detection
- [ ] Task decomposition
- [ ] Output/acceptance criteria generation
- [ ] Prompt optimization
- [ ] Model-specific prompt adaptation
- [ ] Intent-preservation safeguards
- [ ] Prompt optimizer telemetry/evaluation
- [ ] Reuse in Studio
- [ ] Reuse in Collaborators
- [ ] Reuse in Personal

### Required contract

```text
RAW REQUEST
 → INTENT
 → CONTEXT
 → TASK PROFILE
 → OPTIMIZED INSTRUCTION
 → MODEL ROUTE
 → EXECUTION
```

The optimizer must improve a poor or underspecified request without silently changing the user's intended objective.

## C. Adaptive Deliberation

**Status: 🔵 PLANNED**

- [ ] Complexity/risk classification
- [ ] Single-model efficient path
- [ ] Lightweight validation path
- [ ] Multi-stage/multi-model path
- [ ] Verification/synthesis policy
- [ ] Economic guardrails for deliberation

## D. Model Performance Intelligence

**Status: 🔵 PLANNED**

- [ ] Per-model task/domain performance profile
- [ ] Quality signals
- [ ] Reliability/error metrics
- [ ] Latency metrics
- [ ] Tool-use success metrics
- [ ] Historical cost profile
- [ ] Outcome-based routing feedback
- [ ] Versioned routing policy
- [ ] Controlled policy evolution

## E. Evidence / Truth Layer

**Status: 🔵 PLANNED**

- [ ] Claim/evidence contract
- [ ] Source provenance
- [ ] Confidence
- [ ] Cross-check strategy
- [ ] Conflict detection
- [ ] Evidence-aware synthesis

## F. Context Fabric

**Status: 🔵 PLANNED / REUSE-FIRST**

- [x] Memory Graph foundation
- [x] Existing context/memory service foundation
- [ ] Unified permissioned context abstraction
- [ ] Calendar/context integration
- [ ] Task context
- [ ] Document/project context
- [ ] Device context
- [ ] External-app context
- [ ] Prior-decision context
- [ ] Execution-outcome context

## G. Decision Memory

**Status: 🔵 PLANNED**

- [ ] Decision entity semantics over existing Memory Graph
- [ ] Alternatives/reason metadata
- [ ] Expected outcome
- [ ] Actual outcome
- [ ] Provenance/confidence
- [ ] Retrieval for future decisions

## H. Permission Graph

**Status: 🔵 PLANNED / Personal domain dependency**

- [ ] Capability → resource → scope → action model
- [ ] Autonomy level
- [ ] Confirmation policy
- [ ] Audit
- [ ] Revocation enforcement
- [ ] Personal Permission Center
- [ ] App Action enforcement

## I. Five-year modularity / provider independence

**Status: 🔵 ARCHITECTURAL REQUIREMENT**

- [x] Product contracts are provider/model agnostic
- [x] Provider adapter abstraction exists
- [ ] Generalized multi-provider adapter contract
- [ ] Dynamic model catalog synchronization
- [ ] Dynamic pricing synchronization
- [ ] Provider health registry
- [ ] Provider/model replacement without product rewrite
- [ ] STT provider abstraction
- [ ] TTS provider abstraction
- [ ] Search/research provider abstraction
- [ ] Multimodal provider abstraction

## J. Required reuse rule

Before implementing any item above:

1. search existing 03–10 primitives;
2. reuse canonical registries/services/contracts where semantically valid;
3. generalize a shared primitive when Personal/Studio/Collaborator require the same behavior;
4. create a new domain object only when ownership/lifecycle/security semantics differ;
5. never duplicate budgets, attempts, usage, reconciliation, capabilities, memory, provider registry or idempotency without an explicit architectural exception;
6. add an E2E/negative test before marking the new primitive verified.

## K. Non-regression gate

No Cognitive Fabric change may regress:

- E2E 09 Studio closure;
- E2E 10 Collaborator closure;
- RLS/tenant isolation;
- capability authorization;
- autonomy/HITL boundaries;
- budget authorization;
- idempotency;
- provider evidence;
- audit/reconciliation.

The adaptive intelligence layer may choose a different model or execution strategy, but it may never bypass deterministic governance boundaries.
