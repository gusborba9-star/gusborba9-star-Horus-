# Hórus Master Blueprint — Foundation v1

## Status

Foundation reconstruction in progress on `chore/horus-foundation-rebuild`.

## Architectural source of truth

Hórus is a personal intelligence platform with three future product surfaces: Personal, Studio and Digital Collaborators. The current milestone establishes identity, authorization, database governance, test gates and build quality before multimodal expansion.

## Core dependency chain

Identity → Authorization → Database/RLS → Ledger → Idempotency → Cost Engine → Holds → Provider Registry → Model Registry → Adapters → Router → Execution → Usage → Reconciliation → Observability → Application Services → APIs → Context → Memory → Nexus → Personal → Studio → Agents.

## Non-negotiables

- User-scoped operations must never require Service Role merely for convenience.
- Provider calls must ultimately pass through economic authorization before execution.
- Financial mutations must be atomic and idempotent.
- RLS is a database enforcement layer, not a replacement for application authorization.
- Provider identity is infrastructure and must not leak into product UX.
- Long-running workloads belong in asynchronous job execution, not synchronous request handlers.

## Current milestone scope

1. Supabase Auth-backed login/session.
2. Explicit user-scoped authorization contracts.
3. Migration-first database foundation.
4. RLS baseline for identity/credit foundation.
5. Test command and contract tests.
6. ESLint configuration consolidation and real build lint gate.

## Known transitional state

The repository still contains legacy domain schemas and direct provider APIs. They are not considered migrated until their consumers are moved to the new application/core boundaries.
