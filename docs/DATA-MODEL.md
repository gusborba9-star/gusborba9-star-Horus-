# Data Model — Foundation

## Existing legacy domain

The repository contains `organizations`, `users`, `agents`, `leads`, `conversations`, `messages` and `transactions` in both `db/schema.sql` and `supabase_schema.sql`. These two files are byte-identical in the current inspected state and are not yet a migration history.

## Foundation domain

The first migration introduces:

- `user_entitlements`
- `credit_accounts`
- `credit_ledger`
- `credit_holds`
- `idempotency_keys`

All are keyed to Supabase Auth users. Credit and idempotency mutation paths are transactional database functions with authenticated-user ownership checks.

## Migration policy

`supabase/migrations` is the authoritative forward migration stream. Legacy schema files are retained until all code references and deployment procedures have been migrated and verified.

## Financial invariants

1. Available credits = balance − held.
2. A hold is created atomically under a row lock.
3. The same user/idempotency key cannot create a second hold.
4. Client roles have no direct ledger mutation policy.
5. Reconciliation must never silently exceed the reserved authorization.
