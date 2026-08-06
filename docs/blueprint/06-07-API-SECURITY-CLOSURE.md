# 06 + 07 — API / ROUTING + SECURITY CLOSURE

This document records the definitive operational closure evidence for 06 — API / ROUTING and 07 — SECURITY. It is evidence only and does not replace `docs/blueprint/HORUS-ENGINEERING-BLUEPRINT.md`.

## Decision

06 and 07 are marked **COMPLETE** on the basis of the operational Definition of Done and the independent evidence available in the repository, Vercel and Supabase.

**Explicit limitation:** formal independent `horus-ci` evidence for the final validation SHA is **NOT RECOVERABLE THROUGH THE AVAILABLE GITHUB INTEGRATION**. This is not represented as CI PASS and is not treated as a code, database, deployment or runtime failure.

## Source of truth and execution identity

- Repository: `gusborba9-star/gusborba9-star-Horus-`
- Branch: `chore/horus-foundation-rebuild`
- Implementation SHA: `befdabf72750b3424098320ba90cdb6462c6881f`
- Validation/deployment SHA: `92ef5c728aa59cd9729886d7118574d096267542`
- `6955d21e...` is documentation/ROADMAP only.
- `19944e4f...` is documentation/closure only.
- `92ef5c...` is the validation/deployment marker and contains no 06/07 code change relative to the implementation SHA.
- Vercel project: `velor-api`
- Supabase project: `ljqmiuxztqseyglhvgmi`
- Closure date: 2026-08-06

## 06 — API / ROUTING

### Canonical route boundaries

- `/api/horus` — canonical execution route; protected by `ai.execute` and preserved Core → Economic Authorization → Router → Adapter → Provider flow.
- `/api/horus/review` — authenticated and ownership-bound to the authenticated `owner_scope`.
- `/api/auth/session` — Supabase session boundary.
- `/api/webhook-pix` — server-secret authentication plus required event id and replay/idempotency protection.
- `/api/chat` — HTTP 410 `ROUTE_DEPRECATED_USE_HORUS_CORE`; no provider bypass.
- `/api/horus-router` — HTTP 410 `ROUTE_DEPRECATED_USE_HORUS_CORE`; no direct OpenRouter/Gemini execution.
- `/api/charge` — HTTP 410 `ROUTE_DEPRECATED_BILLING_CONTRACT_REQUIRED`; no mock financial execution.

### Routing/security contract

The inspected API surface does not introduce a parallel provider path. Canonical execution remains behind authentication, input/error contracts, Core authorization, Economic Authorization and the canonical provider adapter path. Legacy bypass endpoints are inert tombstones.

## 07 — SECURITY

### Authentication and authorization

- `ai.execute` is checked before economic reservation/execution.
- Human review lookup is owner-scoped.
- Webhook authentication is server-secret based and outside the normal user session boundary.
- Provider/service-role/payment secrets remain server-only.
- Client roles do not receive direct access to system execution logs, semantic cache entries or webhook event storage.

### Database boundaries

- RLS is enabled across the inspected public security surface.
- System tables with no client policies do not grant direct `anon`/`authenticated` table access.
- `horus_webhook_events` enforces unique `(provider,event_id)` for idempotency.
- `horus_execution_logs` and `horus_semantic_cache_entries` are restricted to privileged system/service-role access.
- Privileged economic `SECURITY DEFINER` functions are restricted to `service_role`/`postgres`.
- `reserve_horus_credits` remains intentionally `authenticated + SECURITY DEFINER` as a user-scoped boundary and validates `auth.uid()` internally.

## Supabase evidence

Project: `ljqmiuxztqseyglhvgmi`.

Applied and confirmed security migrations:

1. `horus_api_security_surface_hardening`
2. `horus_webhook_idempotency_boundary`
3. `webhook_event_idempotency`
4. `remove_unused_webhook_event_extension`

Confirmed function boundaries:

- `flag_horus_credit_overage_system`: `SECURITY DEFINER`, owner `postgres`, execution restricted to service-role/system access.
- `reserve_horus_credits`: `SECURITY DEFINER`, owner `postgres`, `authenticated` execution intentionally retained for user-scoped reservation and internally bound to `auth.uid()`; `anon` execution denied.

## Security Advisor

- CRITICAL: **0**
- WARN: **1** — `reserve_horus_credits` is executable by `authenticated` because it is intentionally user-scoped `SECURITY DEFINER`.
- INFO: RLS-enabled system tables without client policies are classified according to actual exposure; direct client table access is denied.

The WARN was not removed or suppressed because doing so would alter the established Economic Core contract rather than improve security.

## Tests

Production validation executed on the validation/deployment SHA:

- `npm test`: **29/29 PASS**
- fail: 0
- cancelled: 0
- skipped: 0
- todo: 0

The suite covers API authentication, public error contracts, Core authorization, human-review ownership, webhook replay/idempotency, legacy route tombstones, economic safety and existing Core/Memory contracts.

## TypeScript

**PASS — production build type validation.** Next.js completed its type-validation stage without compilation/type errors.

## ESLint

**PASS — production build lint validation.** Next.js completed lint validation without blocking errors.

## Build

**PASS.** Next.js 15.5.22 production build compiled successfully. Only non-blocking `MODULE_TYPELESS_PACKAGE_JSON` warnings were observed.

## CI

Canonical workflow: `.github/workflows/horus-ci.yml`.

Defined chain:

`npm ci → TypeScript → ESLint → npm test → build`

Final status:

**Formal independent CI evidence: NOT RECOVERABLE THROUGH THE AVAILABLE GITHUB INTEGRATION.**

No CI PASS is inferred from Vercel and no association is fabricated between an unavailable workflow run and the validation SHA. The independent technical gates remain evidenced by the production build, type validation, lint validation, 29/29 tests, Vercel deployment and runtime, while the CI observation limitation is explicitly retained.

## Vercel

- Project: `velor-api`
- Deployment: `dpl_8ADkpE5t2hSBE6Pc5sWMpup89yBz`
- SHA: `92ef5c728aa59cd9729886d7118574d096267542`
- Branch: `chore/horus-foundation-rebuild`
- State: **READY**
- Build errors: none

## Runtime

The validation deployment produced no error/fatal runtime logs in the inspected validation window, and no relevant error cluster was identified for the 06/07 surface.

## Definition of Done decision

The following are evidenced: architecture, implementation, dependencies, consumers, route contracts, authentication, ownership, provider boundaries, TypeScript validation, ESLint validation, tests, Supabase/RLS/RPC security boundaries, build, Vercel deployment, runtime, migrations, Security Advisor classification and execution evidence.

Formal CI observation remains the only unavailable evidence class. It is explicitly documented rather than fabricated.

## Final status

- **06 — API / ROUTING: 🟢 COMPLETE**
- **07 — SECURITY: 🟢 COMPLETE**
- **05 — ECONOMIC CORE: preserved as integrated into 03 — CORE; not reopened.**
- **Next block: 08 — TESTING.**
