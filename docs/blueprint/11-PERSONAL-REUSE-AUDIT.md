# Hórus Personal — Reuse Audit 03–10

**Status:** CANONICAL IMPLEMENTATION AUDIT FOR MODULE 11  
**Audited:** 2026-08-13  
**Architecture authority:** `docs/blueprint/HORUS-MASTER-BLUEPRINT.md`  
**Progress authority:** `docs/blueprint/ROADMAP.md`  
**Repository:** `gusborba9-star/gusborba9-star-Horus-`

## 1. Audit objective

Determine, from the current repository and live Supabase schema, which foundations created during modules 03–10 must be reused by Hórus Personal, which must be generalized/extended, and which Personal contracts are genuinely new.

The rule is **reuse before rebuild**. Personal must not create parallel Nexus, capability, model registry, budget, usage, reconciliation, idempotency, memory or audit systems.

## 2. Product boundary confirmed

### Personal

`LOGIN → PERSONAL → SUBSCRIBE → SELECT FIXED PERSONA → ACTIVATE ON DEVICE → OPTIONAL CAPABILITY GRANTS → USE`

Personal is pre-built. The user does not create an agent, role, objective graph, model selection or capability graph.

Official identities:

- Aline
- Luiza
- Íris
- Clara
- Bel
- Lúcia

Persona is an identity layer, not an independent agent.

### Collaborator

`USER OBJECTIVE → NEXUS ANALYSIS → COLLABORATOR DESIGN → CAPABILITIES/MODEL REQUIREMENTS → ECONOMIC ESTIMATION → APPROVAL → CREATE/EXECUTE`

This distinction remains mandatory. Personal consumes the platform; it does not reproduce the Collaborator builder.

## 3. Confirmed reusable runtime primitives

| Existing structure | Evidence | Personal decision |
|---|---|---|
| `lib/collaborators/nexus.ts` | Repository | **REUSE/GENERALIZE** — current resolution logic is collaborator-shaped but demonstrates the canonical Nexus boundary. Extract shared routing contracts rather than copy the file. |
| `public.capabilities` | Live Supabase | **REUSE** — canonical capability registry. No Personal registry. |
| `public.providers` | Live Supabase | **REUSE** |
| `public.models` | Live Supabase | **REUSE** |
| `public.pricing_snapshots` | Live Supabase | **REUSE** — current pricing snapshot infrastructure exists. |
| `public.model_price_history` | Live Supabase | **REUSE** — historical model pricing exists. |
| `public.provider_endpoint_history` | Live Supabase | **REUSE** — endpoint availability/pricing history exists. |
| `public.fx_rates` / `public.fx_snapshots` | Live Supabase | **REUSE** — economics already has FX infrastructure. |
| `public.economic_policy` | Live Supabase | **REUSE/EXTEND** |
| `public.economic_policy_versions` | Live Supabase | **REUSE** |
| `public.execution_budgets` | Live Supabase | **REUSE** — Personal tier maps to an internal economic profile; do not create Personal budgets. |
| `public.execution_attempts` | Live Supabase | **REUSE** |
| `public.execution_usage` | Live Supabase | **REUSE** |
| `public.economic_events` | Live Supabase | **REUSE** |
| `public.horus_execution_logs` | Live Supabase | **REUSE** |
| `public.idempotency_keys` | Live Supabase | **REUSE** |
| `public.horus_semantic_cache_entries` | Live Supabase | **REUSE** |
| `public.memory_graph_nodes` | Live Supabase | **REUSE/EXTEND** — Personal semantics must sit on the shared graph. |
| Authentication / `public.users` | Live Supabase | **REUSE** |
| RLS-enabled ownership model | Live Supabase | **REUSE/EXTEND** — Personal ownership is user-scoped rather than organization-scoped. |
| OpenRouter provider path | E2E 10 + repository | **REUSE** |
| Provider/model routing contract | E2E 10 | **REUSE/GENERALIZE** |
| Budget → attempt → provider → usage → reconciliation | E2E 10 | **REUSE** |
| Idempotency boundary | E2E 10 | **REUSE** |

## 4. Live economic infrastructure already present

The live Supabase project `gusborba9-star-Horus-` is active and contains the execution/economic chain needed by Personal.

The current pricing snapshot infrastructure already records OpenRouter as a pricing source. The latest observed snapshot available during this audit was recorded on 2026-08-06 and included model pricing metadata for `google/gemini-2.5-flash-lite`.

This proves the repository/database already has the intended direction for **Nexus-driven provider/model economics**. It does not yet prove complete dynamic OpenRouter catalog synchronization; that remains a roadmap closure item.

## 5. Existing structures that must NOT be copied

The following are collaborator/studio domain structures and should not be cloned for Personal:

- `horus_collaborators`
- `horus_collaborator_capabilities`
- `horus_collaborator_versions`
- `horus_collaborator_executions`
- `studio_projects`
- `studio_project_revisions`
- `studio_connectors`
- `studio_executions`

Personal needs its own product identity/ownership/action domain, but must connect into the shared canonical execution/economic/security primitives.

## 6. Existing structures requiring generalization

### 6.1 Nexus

Current `lib/collaborators/nexus.ts` is explicitly collaborator-oriented. It should not become the Personal Nexus by copy/paste.

Target architecture:

`Nexus Core → surface resolver → Personal / Collaborator / Operations`

The shared contracts should cover intent, context, capability resolution, model/provider routing, policy, economics and execution. Surface-specific resolvers supply Personal identity or Collaborator composition.

### 6.2 Capability authorization

`public.capabilities` is reusable, but Personal needs a user-owned grant layer:

`user → capability → scope → policy → grant/revocation`

A Personal grant is not the same entity as `horus_collaborator_capabilities`.

### 6.3 Execution

The shared execution budget/attempt/usage chain is reusable. Personal-specific action records should reference the canonical operation/attempt/log chain rather than replace it.

### 6.4 Connector Fabric

Current connectors are Studio-scoped. Personal App Actions require a platform-wide connector/action contract before broad external integrations are claimed as supported.

## 7. Genuinely new Personal contracts

1. Personal identity catalog containing exactly six fixed personas.
2. Personal Identity Profile.
3. User → Personal ownership/activation record.
4. Personal subscription/tier → economic-profile mapping.
5. User-owned capability grants with explicit scopes.
6. Permission Center state and revocation API.
7. Confirmation policy for sensitive Personal actions.
8. Personal voice profile and primary/fallback voice routing.
9. STT adapter contract.
10. TTS adapter contract.
11. Personal context/memory semantics over the shared Memory Graph.
12. Android device/session activation contract.
13. Deterministic Personal App Action contract.
14. External side-effect evidence contract.
15. Personal proactive intent/event contract.

## 8. Security rules for implementation

- Personal starts with no external device capability implicitly authorized.
- Every external action requires a canonical capability and explicit grant.
- Grants are scoped and revocable.
- Sensitive actions require confirmation unless an explicit policy permits autonomous execution.
- Service-role access must remain server-side.
- RLS remains mandatory for user-owned Personal state.
- App Actions require idempotency.
- Provider failure must not silently change Persona identity or voice identity.
- UI automation is not the primary integration mechanism; official API/native integration/Android Intent precedes Accessibility-based automation.

## 9. Implementation order derived from the audit

1. Extract/generalize Nexus contracts without changing the verified Collaborator path.
2. Define Personal domain tables/contracts.
3. Implement fixed persona catalog and Personal Identity Profile.
4. Implement Personal ownership/subscription activation.
5. Implement Personal capability grants and revocation.
6. Integrate shared Memory Graph with Personal-specific memory semantics.
7. Implement voice provider abstraction, STT and TTS with persona-safe fallback.
8. Generalize Connector Fabric/action contract where required.
9. Implement deterministic Android/App Actions.
10. Integrate canonical execution/economic/idempotency/audit chain.
11. Implement proactivity on top of events/pending intents.
12. Run Personal E2E and closure gates.

## 10. Non-goals of this audit

This audit does not mark Personal as implemented. It does not authorize advertising unsupported integrations, and it does not freeze Personal pricing. R$49,90 / R$79,90 / R$159,90 remain provisional commercial baselines until economic simulation is complete.

## 11. Safety boundary

No existing production Collaborator or Studio schema is modified by this audit. The audit is documentation-only and is intended to prevent architectural duplication before Personal implementation begins.
