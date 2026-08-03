# Hórus Economic Safety

## Architectural invariant

Hórus never executes an operation merely because the user has credits. An operation is executable only when the system can prove that its worst-case authorized execution fits inside the economic budget and preserves the minimum gross margin defined by the active policy.

## Hard invariants

For every authorized execution:

`maximum_total_cost_brl <= revenue_allocated_brl * (1 - minimum_margin_rate)`

and after execution:

`actual_total_cost_brl <= maximum_total_cost_brl`

If either condition cannot be proven, execution is rejected, reduced, or stopped. Overage is never silently charged and never converted into tolerated loss.

## Maximum-cost model

The estimate is not the authorization boundary.

The authorization boundary uses the maximum allowed:

- input tokens;
- output tokens;
- reasoning tokens;
- request fees;
- modality-specific units;
- authorized attempts;
- retry reserve;
- failure reserve;
- provider fee;
- infrastructure cost;
- FX buffer;
- pricing-drift buffer;
- usage-uncertainty buffer.

For a gross margin floor `M` and worst-case total cost `C`:

`minimum_revenue = C / (1 - M)`

The execution is authorized only when allocated revenue is at least that amount.

## Pricing source

OpenRouter's Models API is treated as a dynamic external pricing/metadata source, not as permanent configuration. The synchronized snapshot is stored with its observation time and payload hash. Historical pricing is retained rather than overwritten.

The `/api/v1/models` data is suitable for model discovery and normalized market pricing, but it is not by itself sufficient to prove a worst-case provider-endpoint cost when multiple provider endpoints can serve the same model. Endpoint-level data therefore remains a required input for the final fallback-tree bound.

## Execution budget

Every future multi-step execution receives a budget containing:

- total maximum cost;
- maximum provider cost;
- remaining cost;
- maximum attempts;
- maximum input/output/reasoning tokens;
- maximum steps;
- maximum tool calls;
- deadline.

An attempt consumes budget. A retry does not reset it. An agent step does not receive an independent unlimited budget.

## Economic tiers

`ECONOMIC`, `BALANCED` and `PREMIUM` are server-side routing policies, not UI labels. Each tier defines quality floor, maximum output/reasoning, attempts, steps, tool calls and fallback permissions.

## Conservative caching rule

Prompt caching is an optimization, never an authorization assumption. Maximum-cost calculations use cache-miss pricing unless a later policy explicitly proves a cache-bound path. OpenRouter currently exposes cache usage details in response usage, allowing actual-cost reconciliation.

## Kill switch

`economic_policy.global_execution_enabled` is a system-owned emergency control. Provider/model/capability enablement remains server-side. Frontend input cannot activate or bypass these controls.
