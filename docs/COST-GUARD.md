# Cost Guard

Paid execution is bounded by an economic authorization before provider execution.

```text
Authentication
  → Authorization
  → Entitlement
  → Cost policy + FX
  → Credit hold
  → Routing
  → Provider adapter
  → Execution
  → Usage
  → Actual cost
  → Reconciliation
```

## Current implementation

The first functional path is text generation. `executePaidText()` resolves authorization, loads pricing/FX policy, routes through the provider/model registry, creates an idempotent credit hold, executes through an adapter and reconciles the actual usage.

Provider overage does not silently consume additional credits. It enters `OVERAGE_REVIEW` and keeps the reservation locked until an explicit system resolution exists.

## Economic data

Provider/model pricing, FX and policy are database data. They must not be hardcoded into product components or route handlers.

## Remaining production gate

The Supabase Hórus project is currently inactive and direct SQL execution timed out during this milestone. Migrations `0003`–`0005` therefore remain unapplied/unverified against a live database.
