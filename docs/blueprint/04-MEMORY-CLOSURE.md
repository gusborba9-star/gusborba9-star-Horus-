# HÓRUS — 04 MEMORY CLOSURE

This document is the operational closure record for the Memory domain and supplements `docs/blueprint/HORUS-ENGINEERING-BLUEPRINT.md` without creating a second memory architecture.

## Canonical contract

- Engine: `lib/memoryGraph.ts`
- Persistence: `public.memory_graph_nodes`
- Retrieval RPC: `public.match_memory_nodes`
- Lifecycle/pruning RPC: `public.prune_memory_graph`
- Existing semantic cache remains separate in `public.horus_semantic_cache_entries`.

## Ownership

Memory ownership is explicit:

- `SYSTEM`: global cognitive knowledge; no user/organization owner.
- `USER`: owned by `auth.users.id`.
- `ORGANIZATION`: owned by `organizations.id` and constrained by organization membership.

RLS policies exist for SELECT/INSERT/UPDATE/DELETE. Retrieval RPC is `SECURITY DEFINER` and executable only by `service_role`; caller boundaries are supplied by the trusted server-side MemoryGraph service.

## Lifecycle

`ACTIVE → STALE → EXPIRED → PRUNED`.

- `expires_at` controls deterministic expiration.
- `last_accessed_at` and `retrieval_count` provide lifecycle telemetry.
- stale classification uses age + low importance + zero retrieval.
- duplicate content is pruned by ownership-aware `content_hash` ranking.
- old degraded stale/expired records are pruned by age/importance bounds.
- operations are bounded and idempotent.

## Retrieval / hot-cold

Retrieval is vector-similarity based with a configurable threshold and hard result bound. HOT context is determined by recent access or repeated retrieval. COLD context remains recoverable through a controlled fallback. Expired, invalidated and pruned records are excluded.

## Compression

Compression is deterministic context compression, not an additional model or memory system: equivalent normalized content is deduplicated and result count is bounded before context enters the Core. No provider call is introduced into the critical memory retrieval path.

## Performance / security

- pgvector extension is installed in `extensions`, not `public`.
- ownership/lifecycle indexes are present.
- RLS policies use init-plan-safe `(select auth.*())` expressions.
- retrieval is bounded at the service and RPC layers.
- Core memory retrieval remains before decision/economic authorization and does not authorize provider execution; economic authorization remains a separate mandatory gate.

## Operational evidence

- Supabase project: `ljqmiuxztqseyglhvgmi`, `ACTIVE_HEALTHY`.
- Applied migrations: `memory_graph_lifecycle_and_boundaries`, `memory_graph_match_rpc_fix`, `memory_graph_match_rpc_ambiguity_fix`, `memory_graph_security_hardening`, `memory_graph_rls_performance`.
- CI: `horus-ci` #200, `quality`, PASS; TypeScript PASS; ESLint PASS; `npm test` 24/24 PASS; build PASS.
- Final Vercel project: `velor-api`.
- Final deployment for the validated source state: `dpl_9EGXvXbfSa5htXMdpVFhcZSM8rUR`, READY.
- Runtime error clusters for `/api/horus` and `/api/horus/review`: none in the validation window.

## Definition of Done

04 — MEMORY is COMPLETE when the final source SHA, CI, Supabase state, deployment and runtime evidence are recorded together. The current closure evidence is recorded in `ROADMAP.md`.