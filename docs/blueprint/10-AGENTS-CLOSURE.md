# Hórus E2E 10 — Agents / Digital Collaborators Evidence

**Status:** 🟢 VERIFIED — implementation and deployment gates verified; live authenticated provider E2E remains open.  
**Date:** 2026-08-12  
**Scope:** Digital Collaborator platform primitive, Nexus resolution, policy boundary, shared economics integration, tenant isolation and production deployment.

## 1. Purpose

E2E 10 establishes the first reusable Digital Collaborator primitive for Hórus. It is not a generic `agent = prompt + model` implementation and it does not create a second execution/economic/capability registry.

The implemented path is:

`User Intent → Nexus Resolution → Collaborator → Capability → Policy → Economic Authorization → Provider Boundary → Result Persistence → Usage/Reconciliation → Audit`

The current evidence proves the code/schema/deployment contracts. A live provider execution using an authenticated application-user session is not marked as verified because the available Vercel integration does not expose such a session for this audit.

## 2. Implemented architecture

### Collaborator primitive

Table: `public.horus_collaborators`

The entity persists:

- identity/name/slug;
- owner and optional organization scope;
- role and specialization;
- description/objectives/instructions;
- memory scope;
- knowledge source contract;
- tool/connector policy;
- execution policy;
- economic policy version;
- autonomy level;
- preferred provider/model;
- fallback policy;
- lifecycle status;
- version and metadata.

### Capability binding

Table: `public.horus_collaborator_capabilities`

Bindings reference the existing canonical `public.capabilities` registry. No collaborator-specific capability registry was created.

### Versioning

Table: `public.horus_collaborator_versions`

Version 1 is snapshotted at collaborator creation. Future updates can add immutable version snapshots without replacing the collaborator identity.

### Execution

Table: `public.horus_collaborator_executions`

Execution records preserve:

- collaborator;
- owner/organization;
- parent execution relationship;
- intent;
- capability/provider/model;
- policy decision;
- bounded memory context;
- shared budget/attempt/log references;
- idempotency key/request hash;
- result/error;
- terminal timestamps.

## 3. Nexus integration

`lib/collaborators/nexus.ts` implements the collaborator resolution boundary.

The resolver:

1. selects active collaborators available to the authenticated user/organization;
2. discovers enabled capability bindings;
3. infers the capability from intent against available capabilities;
4. selects an enabled model for that capability;
5. prefers the collaborator's configured model when compatible;
6. verifies the provider is active;
7. reads bounded Memory Graph context;
8. returns a provider-neutral resolution object.

The user does not need to choose the provider/model/capability when executing a collaborator intent.

## 4. Execution / Economics integration

The implementation reuses the existing economic primitives:

- `execution_budgets`;
- `execution_attempts`;
- `execution_usage` through reconciliation;
- `economic_policy`;
- pricing snapshots;
- FX snapshots;
- `authorize_horus_execution_attempt`;
- `reconcile_horus_execution_attempt`;
- `horus_execution_logs`.

No parallel collaborator budget/attempt/usage/reconciliation system was created.

The collaborator execution boundary applies bounded input/output token and cost limits before provider execution.

## 5. Autonomy / HITL

Supported autonomy states:

- `READ`;
- `SUGGEST`;
- `PREPARE`;
- `EXECUTE`;
- `AUTONOMOUS`.

`SUGGEST` and `PREPARE` are explicitly rejected before economic authorization/provider execution. Only `EXECUTE` and `AUTONOMOUS` cross the current provider execution boundary.

This prevents metadata from silently becoming execution authority.

## 6. Security / tenancy

RLS is enabled on:

- `horus_collaborators`;
- `horus_collaborator_capabilities`;
- `horus_collaborator_versions`;
- `horus_collaborator_executions`.

The privileged service path independently validates organization membership before collaborator resolution or creation when an organization scope is supplied.

The hardening migration also replaced the broad collaborator capability `FOR ALL` policy with explicit INSERT/UPDATE/DELETE policies and statement-level `auth.uid()` evaluation.

## 7. Connector boundary

Collaborators do not store credentials. Connector policy is persisted as collaborator configuration and remains subject to the canonical Connector Fabric/Vault architecture.

Concrete connector invocation/binding is intentionally not claimed as complete by E2E 10.

## 8. Memory boundary

The resolver reads bounded active Memory Graph entries for the authenticated user and, when authorized, the organization. Entries are truncated before being incorporated into the collaborator prompt context.

Automatic long-term learning, memory mutation and optimization loops remain outside this closure.

## 9. Provider boundary

Current implementation provides a production OpenRouter text-generation execution path using the canonical model/provider registry.

The route preserves provider request correlation when returned by the provider and records model/provider, latency, usage and calculated cost in the execution result/audit path.

A live authenticated user execution was not falsely promoted to evidence because the available Vercel integration did not expose the application's authenticated session required to invoke the route as a real user.

Classification: **EVIDENCE UNAVAILABLE — not a product failure.**

## 10. Database migrations

### `20260812120000_horus_agents_collaborators_e2e10.sql`

Creates the collaborator, capability-binding, version and collaborator-execution persistence model with initial RLS, indexes and timestamp triggers.

### `20260812123000_horus_agents_collaborators_e2e10_hardening.sql`

Hardens collaborator RLS and adds covering indexes for new foreign keys after Supabase advisor review.

## 11. Validation evidence

### GitHub / CI

Final canonical workflow: `horus-ci`.

Validated run for the implementation commits completed successfully with:

- `npm ci` — SUCCESS;
- `npm test` — SUCCESS;
- `npm run typecheck` — SUCCESS;
- `npm run lint` — SUCCESS;
- `npm run build` — SUCCESS.

### Vercel

Production deployment for the final validated commit:

- project: `prj_xQDty1690tXrnIWH4IIHOOXWF7CG`;
- deployment: `dpl_EDJ4UprG4rohesj4QnqbdSExyypV`;
- target: `production`;
- readyState: `READY`;
- createdAt: `1786547195575`;
- deployment URL: `velor-2k1kr9thq-gustavo-borba-s-projects.vercel.app`;
- Git SHA reported by Vercel: `aca86042bdd84176beee16aebe8454e991c2db3c`.

Recent Vercel runtime aggregation reported no runtime errors in the selected audit window.

### Supabase

Direct validation confirmed:

- all four collaborator tables exist;
- RLS is enabled on all four;
- explicit policies exist;
- collaborator capability bindings reference the canonical capability registry;
- shared economic RPCs remain the execution authorization/reconciliation path;
- security/performance advisor review identified and the hardening migration corrected collaborator-specific policy/index findings.

Existing unrelated project-wide advisor findings were not modified by this E2E.

## 12. Failure-state coverage implemented

The execution boundary has deterministic handling for:

- missing intent;
- missing idempotency key;
- idempotency mismatch;
- collaborator unavailable;
- capability unavailable;
- model unavailable;
- provider unavailable;
- organization authorization failure;
- autonomy/approval rejection;
- provider HTTP failure;
- empty provider result;
- economic authorization failure;
- reconciliation failure.

Duplicate requests with the same idempotency key and request hash replay the existing execution rather than creating a second execution record.

## 13. Closure decision

**Module 10 status: 🟢 VERIFIED, not COMPLETE.**

The remaining closure gate is a real authenticated application-user provider execution proving the full runtime chain through terminal economic reconciliation and audit evidence.

No evidence has been fabricated to close that gate.
