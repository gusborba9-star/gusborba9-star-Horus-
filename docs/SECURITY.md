# Security — Foundation

## Authentication

- Supabase Auth is the identity authority.
- Protected application routes require a valid Hórus HTTP-only session cookie.
- The browser must never receive the Supabase Service Role key.

## Authorization

Authentication answers `who are you?`; authorization answers `what may you do?`.

User-scoped operations must resolve authorization before data access. Privileged operations must be explicit, server-only and auditable.

## RLS

RLS is mandatory for user-scoped tables. Client mutation policies are intentionally absent for credit-account and ledger state; financial mutations will be exposed through transactional database functions with ownership checks.

## Secrets

Only non-sensitive Supabase URL/anon configuration may be public. Service Role, provider credentials and payment credentials remain server-side environment secrets.

## Webhooks

Payment and external-provider webhooks are not authenticated merely because a route exists. Signature verification and replay/idempotency protection are required before production readiness.

## Transitional risks

The repository still contains legacy APIs with direct provider access. They are not production-safe for paid execution until they are migrated to the economic boundary.
