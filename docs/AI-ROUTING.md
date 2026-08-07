# AI Routing

The product layer does not select a provider directly.

```text
Capability
  → Provider Registry
  → Model Registry
  → Economic Router
  → Provider Adapter
```

## Capability

Capabilities describe what must be done (`TEXT_GENERATION`, `VISION`, `IMAGE_GENERATION`, `SPEECH_TO_TEXT`, etc.). They are stable product contracts.

## Provider registry

Provider state, priority, capability support and health are operational data.

## Model registry

Model pricing, quality, latency and reliability are registry data. Model identifiers must not leak into Personal or Studio UX.

## Routing

The current text router considers capability, quality, reliability, latency, provider priority and price proxy. The scoring function is deliberately isolated so it can later incorporate real observed latency, failure rate, user entitlement and remaining credit budget without changing provider adapters.

## Adapters

OpenRouter and Google text generation are currently isolated behind `ProviderAdapter`. Route handlers must not call their APIs directly.
