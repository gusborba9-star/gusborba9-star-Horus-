# Testing — Foundation

## Current gate

`npm test` uses Node's built-in test runner for dependency-free foundation contract tests. This avoids adding a testing framework before the project has a stable domain boundary.

## Required expansion

The next financial milestone must add tests for:

- atomic credit reservation
- duplicate idempotency keys
- concurrent reservations
- insufficient balance
- reconciliation below reservation
- overage rejection
- release/refund
- RLS isolation
- authorization failures
- provider adapter contracts
- API authentication

## Quality gates

The intended CI gates are:

```text
npm run lint
npm test
npx tsc --noEmit
npm run build
```

A passing build is necessary but not sufficient for production readiness.
