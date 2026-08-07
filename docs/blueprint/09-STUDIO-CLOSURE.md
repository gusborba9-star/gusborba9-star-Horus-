# 09 — STUDIO — CLOSURE

**Evidence date:** 2026-08-07
**Branch:** `main`
**Functional implementation head:** `5abe8e8efb51d46687cc1a69cdd09e22c4177dd4`
**Decision:** 🟡 PARTIAL

## Executive finding

The previous classification of 09 as COMPLETE was not supportable against the actual repository state. The checked-in Studio UI was a launcher for five modules rather than a universal project execution workspace. The Supabase project already contained a substantial Studio persistence surface, but the application did not expose a complete canonical Project → Revision → Capability → Connector → Economic → Core → Provider → Execution → Preview → Staging → Production chain.

This cycle integrated the existing database surface instead of creating a parallel Studio data model.

## Implemented in this closure

- Canonical Studio project request authentication using the existing Supabase auth/RLS model.
- Project API: create/list/read/update using `studio_projects`.
- Project state now carries execution graph, environment state, delivery state and Nexus intelligence snapshot.
- Revision API with persistent versioning and parent revision links.
- Change classification: MICRO, LOW, MEDIUM, MAJOR, REBUILD.
- Nexus execution specification contract combining user intent, project state, requirements, capabilities, connectors and economic constraints.
- Capability inference for the existing capability registry; no second registry was created.
- Granular connector permission contract.
- Vault-backed connector secret storage, restricted to service-role functions.
- Read-only connector adapters for authorized GitHub, Vercel and Supabase credentials.
- Production mutation blocked at the generic project PATCH boundary; production requires a dedicated approval/deployment flow.
- Studio UI changed from a module launcher to a project-centric Nexus workspace.
- Canonical Node contract test script and TypeScript script added.
- Canonical GitHub Actions workflow added.
- Duplicate revision route removed.
- Studio runtime migration applied to the existing Supabase project.

## Database evidence

Applied migration:

- `horus_studio_runtime_closure` — applied successfully on Supabase project `ljqmiuxztqseyglhvgmi`.

The existing Studio migrations were already present before this closure:

- `horus_studio_project_engine`
- `horus_studio_capability_registry`

The live database confirms the existing tables `studio_projects`, `studio_project_revisions`, `studio_connectors` and `studio_executions` and the seeded capability registry.

## Security evidence

Studio RLS was inspected live. Project ownership and organization-member read boundaries exist. Connector mutation is owner-scoped; shared organization reads are permitted. Execution rows are owner-scoped for select/insert/update.

Supabase Security Advisor after the migration reports no Studio-specific CRITICAL finding. Existing INFO findings and the existing WARN for `reserve_horus_credits` remain part of the previously established economic/security boundary and were not reclassified as Studio defects.

## External integration evidence

The application now contains real server-side adapter paths for authorized read operations against GitHub, Vercel and Supabase using Vault-backed connector credentials. No external provider is exposed to the user-facing Studio contract.

This is an implementation-level integration path. A live authenticated GitHub/Vercel/Supabase connector execution was **not** performed during this closure because no test credential was supplied and no existing user connector could be safely assumed.

## Economic/Core boundary

The Studio does not create a second billing or economic engine. Revision specifications explicitly require economic authorization. The current implementation stops short of claiming provider execution completion; no direct provider bypass was introduced.

## Validation status

- TypeScript: **NOT EXECUTED in this environment**.
- ESLint: **NOT EXECUTED in this environment**.
- Production build: **NOT EXECUTED in this environment**.
- `npm test`: **NOT EXECUTED in this environment**.
- GitHub Actions: workflow was added, but no workflow run was retrievable for the final commit at closure time.
- Vercel: **NOT DETERMINED**. The connected Vercel account exposed a project named `velor-api`, not a Hórus project; therefore no deployment was attributed to Hórus.
- Runtime: **NOT DETERMINED** for the Hórus deployment.
- Live connector E2E: **NOT EXECUTED**.
- Live provider execution: **NOT EXECUTED**.

## Why 09 is not COMPLETE

The following are still not proven end-to-end:

1. real preview deployment generation and dedicated preview runtime;
2. staging deployment and promotion;
3. production deployment with approval and rollback correlation;
4. live connector E2E using an authorized credential;
5. full Studio execution through an existing Economic Authorization budget and Provider Adapter;
6. local/global test, typecheck, lint and build execution for the final SHA;
7. Vercel deployment/runtime evidence for this repository.

These are evidence/implementation gaps inside 09, not permission to start block 10.

## Block boundary

12 — OBSERVABILITY remains independent and is **not** considered complete because Studio emits or stores execution-related state.

03–08 were not reopened architecturally.

10 — AGENTS was not started.
