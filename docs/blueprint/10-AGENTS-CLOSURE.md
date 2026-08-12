# Hórus E2E 10 — Agents / Digital Collaborators Evidence

**Status:** 🟢 COMPLETE — authenticated production E2E and terminal economic reconciliation verified.  
**Date:** 2026-08-12  
**Scope:** Digital Collaborator platform primitive, Nexus resolution, canonical capability binding, autonomy/policy boundary, shared economics, tenant isolation, production deployment and live authenticated provider execution.

## 1. Closure evidence

Final authenticated E2E workflow:

- Workflow: `horus-e2e10-authenticated`
- Run: `31628461257`
- Attempt: `1`
- SHA: `6fc046ea94f16e76c842e163732ddc395488fc11`
- Job: `authenticated-e2e10` — SUCCESS
- OIDC token acquisition — SUCCESS
- Required E2E configuration validation — SUCCESS
- Real Supabase Auth user creation/sign-in — SUCCESS
- Real JWT application authentication — SUCCESS
- `POST /api/collaborators` — HTTP 201
- `POST /api/collaborators/execute` — HTTP 200 / terminal SUCCESS
- Real OpenRouter provider execution — SUCCESS
- Idempotency replay — SUCCESS
- Unauthenticated request — DENIED / 401
- Forged organization request — DENIED / 400 `ORGANIZATION_ACCESS_DENIED`

Persisted terminal execution:

- `user_id`: `34a48aa2-74cf-4808-a357-74586b287082`
- `collaborator_id`: `0dae6476-5710-4dba-af06-bf6e41145e5d`
- `execution_id`: `febfcb37-6257-4678-943e-e00b82027bc1`
- `attempt_id`: `f48fdf2c-82cc-481c-9abd-8ab7bc9d3a81`
- `budget_id`: `8cb8168c-82e1-46f8-9056-ce7c772b280a`
- `execution_log_id`: `3e02f688-dc09-4809-96c9-079632ee6b7a`
- execution: `SUCCEEDED`
- attempt: `SUCCEEDED`
- usage: present
- budget: `SETTLED`
- execution log: `COMPLETED`
- provider: `openrouter`
- model: `google/gemini-2.5-flash-lite`
- provider request id: present in persisted attempt
- actual provider cost: `0.00008314 BRL`
- actual total cost: `0.00008314 BRL`
- input tokens: `115`
- output tokens: `12`

The persisted database audit independently confirms the execution → attempt → usage → budget → log relationship and terminal timestamps.

## 2. Implemented architecture

The implemented path is:

`Authenticated User → Nexus Resolution → Collaborator → Capability → Policy/Autonomy → Economic Authorization → Provider Boundary → OpenRouter → Result Persistence → Usage/Reconciliation → Budget Settlement → Audit`

No second execution/economic/capability registry was introduced.

### Collaborator primitive

Table: `public.horus_collaborators`

The entity persists identity, ownership, organization scope, role, specialization, objectives, instructions, memory scope, knowledge sources, tool/connector policy, execution policy, economic policy version, autonomy, provider/model preference, fallback policy, lifecycle and version metadata.

### Capability binding

`public.horus_collaborator_capabilities` references the canonical `public.capabilities` registry. The E2E creation/execution path does not permit the client to select an arbitrary provider/model implementation.

### Versioning

`public.horus_collaborator_versions` stores the immutable collaborator snapshot created by the normal Collaborator API.

### Execution

`public.horus_collaborator_executions` correlates collaborator, owner, intent, capability, provider/model, policy decision, bounded memory context, budget, attempt, execution log, idempotency key/request hash, result and terminal state.

## 3. Nexus / capability / autonomy

`lib/collaborators/nexus.ts` remains the resolution boundary. The authenticated execution resolves collaborator/capability/provider/model through the product path rather than requiring the client to select an internal provider implementation.

The E2E fixture uses `EXECUTE` autonomy and crosses the normal policy/economic/provider boundary. Existing `SUGGEST`/`PREPARE` rejection behavior remains implemented and was not bypassed by the harness.

## 4. Memory

The collaborator execution uses the existing bounded Memory Graph context path. The execution record persisted a bounded memory context rather than indiscriminately loading tenant memory.

## 5. Economics

The E2E reused the canonical economic primitives:

- `execution_budgets`
- `execution_attempts`
- `execution_usage`
- `economic_policy`
- `economic_policy_versions`
- `authorize_horus_execution_attempt`
- `reconcile_horus_execution_attempt`
- `horus_execution_logs`

The persisted evidence shows:

`AUTHORIZED → provider execution → usage → reconciliation → SETTLED budget → terminal execution/log`.

Actual cost was persisted as `0.00008314 BRL`; provider and total cost agree. No clamp or artificial cost was introduced by the E2E harness.

## 6. Idempotency

The same idempotency key was replayed after the original terminal success. The API returned the original execution with `replay: true`.

Database audit found exactly one execution for the E2E idempotency key and one usage row for its attempt. No second attempt or second economic charge was created.

## 7. Security / tenancy

RLS remains enabled on:

- `horus_collaborators`
- `horus_collaborator_capabilities`
- `horus_collaborator_versions`
- `horus_collaborator_executions`

The negative tests proved:

1. no JWT → `401 AUTHENTICATION_REQUIRED`;
2. authenticated user with a forged organization id → `400 ORGANIZATION_ACCESS_DENIED`.

The application Authorization header contained the real Supabase access token, not the Supabase service-role key. The service-role credential was confined to test-side fixture/audit operations.

No RLS bypass, temporary endpoint, provider mock or manual execution/usage/attempt insertion was used.

## 8. Provider

The final run crossed Vercel Deployment Protection through the configured GitHub Actions Trusted Source and reached the Production Next.js application.

The provider execution was real OpenRouter execution using `google/gemini-2.5-flash-lite`. The terminal persisted provider/model and a real provider request id at the attempt boundary.

## 9. Production / Vercel

Production deployment verified during the closure audit:

- deployment: `dpl_BAWDtYo8trWL7Yndm93hH4dc4cpy`
- target: `production`
- state: `READY`
- production SHA: `3e3e21e4850398f9bf23170a2b6c5d0cca391add`
- canonical production alias: `velor-api-gustavo-borba-s-projects.vercel.app`

The E2E used that Production alias and did not substitute `velor-api.vercel.app`.

## 10. CI

Final code correction commit:

`6fc046ea94f16e76c842e163732ddc395488fc11`

Canonical `horus-ci` run:

- Run: `31628461226`
- `npm ci` — SUCCESS
- `npm test` — SUCCESS
- TypeScript — SUCCESS
- ESLint — SUCCESS
- Build — SUCCESS

The only defect found during the final E2E was a harness query ordering by nonexistent `execution_usage.created_at`. The live schema uses `recorded_at`. The test harness was corrected to query `recorded_at` and assert `actual_total_cost_brl` / `actual_provider_cost_brl`.

## 11. Database migrations

No migration was required for closure. Existing E2E 10 migrations remain authoritative:

- `20260812120000_horus_agents_collaborators_e2e10.sql`
- `20260812123000_horus_agents_collaborators_e2e10_hardening.sql`

The final correction was test-only and did not modify the product schema.

## 12. Cleanup

The temporary password and JWT were process-local and were not persisted to source control, artifacts or logs.

The authenticated E2E evidence records were preserved because they are the closure evidence. No historical execution records were deleted to fabricate cleanup. The test identity remains represented by the preserved evidence and must not be interpreted as an administrative account.

## 13. Closure decision

**10 — 🟢 COMPLETE.**

The final terminal evidence proves the required authenticated chain:

`GitHub OIDC → Vercel Trusted Source → Production Next.js → Supabase Auth → real JWT → Collaborator API → Nexus → canonical capability → policy/autonomy → OpenRouter → execution_attempt → execution_usage → economic reconciliation → budget settlement → horus_execution_logs → terminal SUCCESS → idempotency replay → negative authorization controls`.

Module 11 was not started by this closure execution.
