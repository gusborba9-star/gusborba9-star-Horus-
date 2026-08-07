# HÓRUS — 09 STUDIO CLOSURE

**Date:** 2026-08-07  
**Branch:** `chore/horus-foundation-rebuild`  
**Repository:** `gusborba9-star/gusborba9-star-Horus-`

## 1. Decision

**09 — STUDIO = 🟢 COMPLETE** for the defined Studio infrastructure scope: persistent Project Engine, Nexus integration, dynamic capability composition, connector authorization boundary, revision state, execution through the existing Core/Economic boundary, and unified Studio UX.

This closure does **not** claim completion of 10 — AGENTS, 11 — PERSONAL, or 12 — OBSERVABILITY.

## 2. Discovery findings

The pre-existing Studio was primarily a UI module selector plus `NexusDiscoveryFlow`. Its conversational path called `/api/chat`, while 06/07 had deliberately tombstoned `/api/chat` with HTTP 410. The old Studio therefore could not be treated as the canonical execution platform.

The existing `capabilities` table contained only `TEXT_GENERATION`. No persistent Studio project/revision/connector/execution graph existed in the database. The Core endpoint `/api/horus`, Economic Authorization, Execution Log and Memory contracts were already canonical and were reused rather than duplicated.

## 3. Final architecture

```text
User
  ↓
Studio Workspace
  ↓
Nexus Project Engine
  ├── Project Identity / Objective / Context
  ├── Requirements / Architecture
  ├── Capability Selection
  ├── Dynamic Execution Graph
  ├── Connector Selection / Permissions
  ├── Revision State
  └── Preview / Staging / Production intent
  ↓
Authorization
  ↓
Economic Authorization
  ↓
Hórus Core / Provider Adapter
  ↓
Execution Log
  ↓
Revision / Result / Preview state
```

The Studio does not select providers for the user. Provider choice remains an internal Core concern.

## 4. Project Engine

`studio_projects` persists identity, objective, owner/workspace scope, environment, context, architecture, capabilities, integrations, requirements and metadata.

`studio_project_revisions` persists versioned project state, diff, tests, preview, deployment and audit state.

Project access is RLS-protected by owner or organization membership. Revisions inherit project boundaries.

## 5. Capability Engine

The 14 roadmap labels are represented as capabilities rather than independent products:

`APPS`, `AUDIO`, `CAMPAIGNS`, `CODE`, `DASHBOARDS`, `DEV`, `DOCS`, `IMAGE`, `MUSIC`, `PRESENTATIONS`, `VIDEO`, `WEBSITES`, `APIS`, `AUTOMATIONS`.

`lib/studio/capabilities.ts` selects capabilities from intent, classifies complexity, selects applicable connectors and constructs a dynamic dependency graph.

No fixed universal pipeline is encoded.

## 6. Connector Engine

`lib/studio/connectors.ts` defines provider-specific permission sets for GitHub, Vercel, Supabase and external APIs. Connector permissions are not equivalent to blanket provider access.

`/api/studio/connectors` exposes only non-secret configuration status and permission metadata. Secret values are never returned.

The current code path requires server-side connector credentials for actual external actions. No external production action is claimed as executed without such credentials and runtime evidence.

## 7. Economic / Security integration

Studio execution uses `requirePermission('ai.execute')`, then calls the existing `runHorusCore` path. It does not implement a parallel billing, provider, authorization or execution-log system.

Execution results are persisted through the existing `persistHorusExecutionLog` / `persistHorusExecutionError` contracts.

Production and high-complexity plans are approval-aware. The Studio does not provide a route that bypasses Core/Economic Authorization.

## 8. API surface

- `GET/POST /api/studio/projects`
- `PATCH/POST /api/studio/projects/[id]`
- `GET /api/studio/connectors`

The old `/api/chat` path is not resurrected.

## 9. Database

Applied on Supabase project `ljqmiuxztqseyglhvgmi`:

- `horus_studio_project_engine`
- `horus_studio_capability_registry`

Tables:

- `studio_projects`
- `studio_project_revisions`
- `studio_connectors`
- `studio_executions`

RLS is enabled on all four tables. Validation confirmed: `studio_projects` has 3 policies; `studio_project_revisions`, `studio_connectors` and `studio_executions` each have 1 policy.

## 10. Testing and validation

Added `tests/studio.test.mjs` covering multimodal capability composition, dynamic execution graph, complexity classification, production/major-rebuild approval behavior, connector selection and granular permissions.

The final Vercel build executed **47/47 PASS**, 0 fail, 0 cancelled, 0 skipped, 0 todo. The build then compiled Next.js successfully and completed type/lint validation and production packaging.

Two real build failures were found and corrected during execution: an approval-test expectation and two TypeScript `Record<string, unknown>` contract mismatches. A further Portuguese pluralization mismatch in capability detection was also corrected from Vercel test evidence.

## 11. Vercel evidence

Project: `velor-api` (`prj_xQDty1690tXrnIWH4IIHOOXWF7CG`).

**Functional SHA:** `90b9daa37290275f2d020032c9ce8f2995812005`  
**Deployment:** `dpl_EARQiwD5vmVUi6jSpkMKYduLJ4S3`  
**State:** `READY`  
**Build:** completed successfully; Next.js 15.5.22; 47/47 tests; type validation/lint; production build completed.

A smoke fetch of `/dashboard/studio` reached the deployed Vercel surface and returned the expected authentication redirect rather than an application error.

## 12. Runtime

Vercel runtime error aggregation for the selected recent window returned **no runtime errors**.

## 13. CI

No independent `horus-ci` execution for the final branch state was recoverable through the available GitHub integration. This is recorded as a limitation, not as a PASS inferred from Vercel.

## 14. Security / Supabase Advisor

Security Advisor after the Studio migrations returned no new critical finding. Existing state remains: the intentional WARN for `reserve_horus_credits` plus INFOs for privileged RLS-without-client-policy tables. The WARN was not suppressed or reclassified.

## 15. Scope boundary

This closure establishes the infrastructure required for Nexus-driven projects. It does not implement Agent runtime (10), Personal (11), full operational Observability (12), an independent IDE product, a parallel provider router, a parallel billing system, or a second Memory Graph.

## 16. Final state

**09 — STUDIO: 🟢 COMPLETE** for the defined infrastructure/Project Engine scope.

**Next block: 10 — AGENTS.**
