# Hórus Economic Safety Layer

The Economic Safety Layer treats every provider execution as an economically bounded execution tree.

Core invariants:

- estimated cost is a routing signal, never an authorization limit;
- maximum execution-tree cost is computed before the first provider call;
- maximum authorized cost must fit within net revenue after the configured minimum margin;
- every attempt consumes an atomic execution budget before execution;
- fallback and retry nodes consume the same pre-authorized tree budget;
- actual cost above authorization is an economic security incident;
- pricing and FX decisions are versioned through immutable snapshots;
- provider/model/endpoint kill switches are server-side controls.
