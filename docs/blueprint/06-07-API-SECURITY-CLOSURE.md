# 06 + 07 — API / ROUTING + SECURITY CLOSURE

This addendum records the final execution evidence for the API/Routing and Security blocks without replacing the canonical Hórus Blueprint.

## Final source

- Branch: `chore/horus-foundation-rebuild`
- Final code/evidence SHA: `6955d21e61b18669263692081bbc4f95a22e8f5c`
- Previous implementation SHA: `befdabf72750b3424098320ba90cdb6462c6881f`

## API / Routing corrections

- Canonical `/api/horus` remains protected by `ai.execute` and routes through the canonical Core/Economic path.
- `/api/horus/review` is authenticated and owner-scoped.
- `/api/auth/session` remains the session boundary.
- `/api/webhook-pix` is secret-authenticated and replay/idempotency protected.
- Legacy `/api/chat` provider bypass was replaced by HTTP 410 `ROUTE_DEPRECATED_USE_HORUS_CORE`.
- Legacy `/api/horus-router` direct OpenRouter/Gemini execution was replaced by HTTP 410 `ROUTE_DEPRECATED_USE_HORUS_CORE`.
- Legacy `/api/charge` mock-financial execution was replaced by HTTP 410 `ROUTE_DEPRECATED_BILLING_CONTRACT_REQUIRED`.

## Security validation

- Supabase project: `ljqmiuxztqseyglhvgmi`.
- RLS enabled across public tables relevant to the inspected security surface.
- `horus_webhook_events` has unique `(provider,event_id)` and client roles have no table grants.
- `horus_execution_logs` and `horus_semantic_cache_entries` have effective table access restricted to system/service-role paths.
- Privileged SECURITY DEFINER economic functions are restricted to `service_role`/`postgres`; `reserve_horus_credits` remains intentionally authenticated/user-scoped and validates `auth.uid()` internally.
- Security migrations applied: `horus_api_security_surface_hardening`, `horus_webhook_idempotency_boundary`, `webhook_event_idempotency`, `remove_unused_webhook_event_extension`.
- Supabase security advisor has no CRITICAL finding; the remaining WARN is the intentional user-scoped `reserve_horus_credits` SECURITY DEFINER boundary.

## Runtime/deployment evidence

- Vercel project: `velor-api`.
- Final deployment for the implementation SHA before documentation: `dpl_9VFLitmjDUmT447z3khFJ6iHGXKb`, SHA `befdabf72750b3424098320ba90cdb6462c6881f`, `READY`.
- Runtime error clusters for the inspected API surface: none in the selected validation window.
- Vercel build produced the complete API route graph and completed without build errors.

## Tests

- `tests/api-security.test.mjs` covers authentication/error contracts, human-review ownership, webhook replay/idempotency, and the three legacy bypass tombstones.
- The canonical GitHub workflow is `.github/workflows/horus-ci.yml` and executes `npm ci → TypeScript → ESLint → npm test → build`.
- The available GitHub Actions connector did not expose an independent `horus-ci` run for the final SHA. No CI PASS is fabricated.

## Status

- 06 — API / ROUTING: IMPLEMENTED / VALIDATED TECHNICALLY.
- 07 — SECURITY: IMPLEMENTED / VALIDATED TECHNICALLY.
- Formal CI evidence remains an evidence-gate limitation of the available GitHub Actions connector, not an identified code, database, deployment, or runtime defect.
