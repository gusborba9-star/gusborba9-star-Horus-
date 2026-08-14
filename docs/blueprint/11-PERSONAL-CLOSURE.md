# Hórus E2E 11 — Personal Evidence / Consolidation

**Status:** 🟢 VERIFIED — authenticated Personal core E2E and production checkpoint verified; full Personal product closure remains open.

**Final validated SHA:** `f2606ad25ca8dbca9240a9eb2673e0ec9afe8a2a`

## 1. Evidence scope

The authenticated E2E11 fixture validates the currently implemented Personal core path without changing production semantics:

`Supabase Auth → real JWT → Personal plans/subscription → Personal identity → device → capability grant → Personal execution → provider/model → execution attempt → usage → budget settlement → execution log → terminal SUCCESS`

The fixture also validates idempotency replay, permission revocation, unauthenticated denial, cross-user device denial and deterministic cleanup.

## 2. Auth / identity

- Dedicated temporary Supabase Auth users are created through Auth Admin only for fixture setup.
- The application request uses the real Supabase access token issued by `signInWithPassword`.
- The service-role credential is not used as the application bearer token.
- Personal identity activation is performed through `POST /api/personal`.
- The validated primary E2E identity is `clara`.
- The cross-user fixture activates `aline` before testing access to the first user's device.
- The six fixed identities exposed by the product are: Aline, Luiza, Íris, Clara, Bel and Lúcia.

## 3. Subscription / device

Validated in E2E11:

- Personal plans endpoint returns `PERSONAL`, `PERSONAL_PRO`, `PERSONAL_PRIME`.
- Subscription creation through the normal API returns `PENDING`.
- Test fixture activation establishes `ACTIVE` state for the E2E subscription.
- Personal profile persists the selected persona.
- Device creation succeeds for the authenticated user.
- A second authenticated user cannot use the first user's device and receives `403 PERSONAL_DEVICE_NOT_ACTIVE` after activating its own Personal profile.

Billing-backed subscription lifecycle, cancellation/change lifecycle and production device-platform verification are not claimed complete by this document.

## 4. Permission / capability evidence

The E2E validates:

`GRANT → ACTION → AUDIT → REVOKE → ACTION DENIED`

Specifically:

- capability grant succeeds with `GRANTED` state;
- scope is bound to the E2E device;
- an authorized reminder action executes successfully;
- revocation changes the grant to `REVOKED`;
- the same class of action after revocation is denied with `PERSONAL_PERMISSION_REQUIRED`;
- permission state is persisted and audited through the execution path.

The canonical `capabilities` registry is reused; no parallel Personal capability registry is introduced.

## 5. Execution / economics / idempotency

The authenticated Personal execution persisted:

- `personal_executions` terminal `SUCCEEDED`;
- canonical `execution_attempts` terminal `SUCCEEDED`;
- canonical `execution_usage` present;
- canonical `execution_budgets` state `SETTLED`;
- canonical `horus_execution_logs` state `COMPLETED` with `completed_at`;
- provider/model identifiers present;
- execution, attempt, budget and log IDs correlated.

The same idempotency key was replayed and returned the original execution with `replay: true`. The fixture asserts the same execution ID, proving the replay did not create a second execution boundary.

This is reuse of the existing execution/economic architecture, not a Personal-specific economic registry.

## 6. Provider / routing boundary

The E2E crosses the existing provider boundary and persists provider/model identity for the terminal execution. The Personal product does not expose provider/model selection to the user.

The current Voice implementation also exposes a dynamic runtime contract sourced from the OpenRouter catalog, with primary/fallback STT/TTS model identities surfaced from the runtime rather than from UI constants.

## 7. Security / RLS

Validated negative controls:

- no JWT → `401`;
- authenticated second user using another user's device → `403 PERSONAL_DEVICE_NOT_ACTIVE`;
- capability revocation → action denied server-side.

The production endpoint's Personal-before-device validation order was preserved. No RLS weakening, temporary bypass, manual execution fabrication or service-role bearer authentication was introduced.

## 8. Production / CI evidence

Final source SHA:

`f2606ad25ca8dbca9240a9eb2673e0ec9afe8a2a`

Canonical CI:

- workflow: `horus-ci`
- run: `31824462432`
- conclusion: `SUCCESS`
- TypeScript: `SUCCESS`
- ESLint: `SUCCESS`
- tests: `SUCCESS`
- production build: `SUCCESS`

Authenticated E2E:

- workflow: `horus-e2e10-authenticated`
- run: `31824462431`
- E2E 10: `SUCCESS`
- E2E 11: `SUCCESS`

Production deployment:

- Vercel project: `velor-api`
- deployment: `dpl_HH5mSSsjLSkwML4atJBotQ9mw87g`
- target: `production`
- state: `READY`
- deployment SHA: `f2606ad25ca8dbca9240a9eb2673e0ec9afe8a2a`
- Production `/dashboard/personal`: HTTP `200`

## 9. UI / runtime reconciliation — 2026-08-14

The dashboard surface was reconciled with the already-validated Personal runtime on the same final SHA:

- `app/dashboard/layout.tsx`: **Minha Operação Pessoal** is now a real `Link` to `/dashboard/personal`, with active-state behavior for the Personal subtree.
- `app/dashboard/personal/page.tsx`: subscription, persona, device, permissions and execution state are read from the real Personal APIs; non-`ACTIVE` subscriptions are not presented as operationally active.
- Non-`ACTIVE` Personal users receive the real Efí checkout through `POST /api/personal/billing/checkout`; the UI does not mutate subscription status to `ACTIVE`.
- Persona activation continues through `POST /api/personal` and therefore remains subject to backend subscription authority.
- Device binding continues through the canonical `/api/personal/devices` endpoint and the returned device ID is used for execution.
- Text execution continues through `/api/personal/execute` with the real JWT, device binding and idempotency boundary.
- Permission Center uses the existing grant/revoke APIs; no UI-only permission state was introduced.
- `app/dashboard/personal/voice/page.tsx` now invokes the real `/api/personal/voice` endpoint for microphone/file audio and displays the effective persona, STT model, TTS model and execution correlation returned by the runtime.
- `app/dashboard/personal/setup/page.tsx` was converted from a simulated timer/curation flow to a runtime-state view; it does not fabricate activation or billing.
- Existing Personal subroutes remain reachable: `/dashboard/personal`, `/dashboard/personal/setup`, `/dashboard/personal/voice`, `/dashboard/personal/companion`.

No parallel Personal runtime, mock billing path, frontend-only activation, or replacement Nexus implementation was introduced.

## 10. Cleanup

The authenticated E2E11 fixture cleanup removes Personal-domain records for both temporary users from:

- `personal_capability_grants`
- `personal_devices`
- `personal_profiles`
- `personal_subscriptions`

Preserved execution evidence is not deleted to fabricate cleanup. Temporary Auth identities are disabled after the run.

## 11. Evidence boundary — not claimed complete

The following remain open because the available evidence does not prove their complete production contracts:

- billing-backed subscription lifecycle and real payment confirmation;
- subscription change/cancellation lifecycle;
- full supported-device verification lifecycle;
- proactive behavior as a production event-driven lifecycle;
- external App Action side-effect evidence beyond the validated Personal action/concurrency boundary;
- expected/heavy/worst-reasonable economic simulations and final commercial pricing validation;
- broader platform-wide inference/routing closure outside the validated Personal runtime;
- complete Personal-specific closure across all Roadmap gates.

These items remain unchecked in the canonical Roadmap and are not reclassified by this UI reconciliation.

## 12. Closure decision

**Módulo 11 remains VERIFIED at the Personal core/runtime checkpoint, not COMPLETE.**

The UI/runtime reconciliation is complete and production-validated, but the module is not promoted to `COMPLETE` while its remaining closure gates are still open.

Module 12 is not started by this consolidation.
