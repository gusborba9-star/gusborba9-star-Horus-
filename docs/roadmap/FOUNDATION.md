# Foundation Roadmap

## Completed in this branch

- [x] Dedicated reconstruction branch created.
- [x] Supabase Auth login wired to real authentication.
- [x] HTTP-only server session established after Supabase login.
- [x] Protected dashboard/Nexus/API middleware.
- [x] Explicit authorization contracts.
- [x] RLS-scoped entitlement resolution.
- [x] Migration directory established.
- [x] Additive identity/credit/idempotency schema groundwork.
- [x] Transactional credit reservation/reconciliation functions with row locks.
- [x] Explicit credit overage rejection.
- [x] Node test gate established.
- [x] Duplicate ESLint config removed.
- [x] `ignoreDuringBuilds` removed from Next configuration.
- [x] Initial architecture/security/data/testing documentation.

## Blocked verification

The GitHub connector can read/write repository files and commits but does not expose a shell/build executor. No claim is made that `npm run lint`, `npm test`, `npx tsc --noEmit` or `npm run build` passed on the branch until CI or an equivalent execution environment reports them.

## Next milestone

Before provider integration:

1. reconcile the migration stream against the deployed Supabase database;
2. add RLS integration tests;
3. implement the complete credit ledger service;
4. implement idempotency service;
5. implement cost estimation and reservation service;
6. migrate every paid AI route behind that boundary;
7. establish CI gates for lint, typecheck, tests and build.
