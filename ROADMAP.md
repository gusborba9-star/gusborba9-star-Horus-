# Hórus — Roadmap de Execução

> Este arquivo é a **visão de execução** do Hórus. A arquitetura, governança, contratos, evidências e regras de integração vivem no **Hórus Engineering Blueprint** em `docs/blueprint/HORUS-ENGINEERING-BLUEPRINT.md`.
>
> Regra central: **nenhuma estrutura nova pode ser criada sem demonstrar como ela se conecta à arquitetura existente.**

## Fonte de verdade

- **Blueprint arquitetural:** `docs/blueprint/HORUS-ENGINEERING-BLUEPRINT.md`
- **Roadmap:** este arquivo

O Blueprint define o que significa existir, integrar e concluir uma estrutura. Este roadmap define a ordem de execução.

---

# 01 — FOUNDATION

## Build Infrastructure Gate

- [x] Next.js 15.5.22 definido.
- [x] React 19.2.2 definido.
- [x] TypeScript 5.9.3 definido.
- [x] ESLint 9.39.1 + Flat Config configurado.
- [x] `@typescript-eslint/parser` associado a TS/TSX.
- [x] `@next/eslint-plugin-next` registrado.
- [x] `next.config.ts` mantém `ignoreBuildErrors: false`.
- [x] Evidência de build no SHA `3167ef3482e0714a1a61585fa1c8387fb40613a7`: Vercel concluiu o build em 41s.
- [x] Evidência de deployment Vercel correspondente ao SHA `3167ef3482e0714a1a61585fa1c8387fb40613a7` em `READY`: `dpl_EiheEkniFqSTnKkdG3X4NtMXekEy`.
- [x] Evidência adicional de deployment Vercel do SHA `b1103c66fe2187d60e990628213fe8a3a7bd00a4` em `READY`: `dpl_7ufWvANoN2gqtmL6DMN3YZRD79Bi`.
- [x] Evidência adicional de deployment Vercel do SHA `fb024c6d01172a4fdf7ef9d5d02591c6392cb099` em `READY`: `dpl_FLrG6Kv55tPoJMJkW94kWrVS9Pek`.
- [x] Evidência adicional de deployment Vercel do SHA `9ffa4b96f057666f911f351fb33b6917fd68b6bd` em `READY`: `dpl_EoxqzT6LNuBtZ96QwJeYxSBsGgnk`.
- [x] Evidência CI no SHA final do Core: workflow `horus-ci` #182, job `quality`, com `npm ci`, TypeScript, ESLint, `npm test` e build concluídos com sucesso.

**Estado:** 🟢 VALIDADO.

---

# 02 — ARCHITECTURE DISCOVERY

- [x] Blueprint operacional criado.
- [x] Governança e Definition of Done definidos.
- [x] Contratos críticos iniciais registrados.
- [ ] Fechar inventário recursivo de arquivos.
- [ ] Fechar import/export graph.
- [ ] Fechar route graph.
- [ ] Fechar database/RPC graph.
- [~] Classificar scripts históricos: cleanup comprovado executado para os artefatos já identificados; inventário recursivo completo permanece limitado pela indisponibilidade do índice de código do repositório.
- [~] Classificar órfãos e duplicatas com evidência: snapshots e scripts comprovadamente históricos removidos; classificação recursiva completa ainda depende de inventário de filesystem.

**Estado:** 🔍 DISCOVERY.

---

# 03 — CORE

- [x] Endpoint base `/api/horus` existe.
- [x] Circuit breaker existente.
- [x] LangGraph real: grafo canônico `lib/core/horusGraph.ts` integrado ao `/api/horus`.
- [x] Execution Log real: `public.horus_execution_logs`, persistência de sucesso/revisão humana/erro e integração no `/api/horus`.
- [x] Semantic Cache real: armazenamento canônico `public.horus_semantic_cache_entries`, serviço tenant-scoped e integração ao fluxo autorizado; cache hit não bypassa autorização econômica.
- [x] Confidence/HITL: score determinístico, limiar e rotas `human_review`/`route_to_service`; aprovação humana explícita retorna ao Core sem remover gates econômicos.
- [x] Economic Authorization canônico: `execution_budgets`, `execution_attempts` e `authorize_horus_execution_attempt` com permission, pricing freshness, maximum cost, margin, tree bound, token budget e atomic reservation.
- [x] Pricing: endpoint pricing, pricing snapshot, FX e economic policy operacionais no Supabase.
- [x] TEXT_GENERATION real: `ProviderAdapterRegistry`/adapters, provider/model registry, usage, actual cost e `reconcile_horus_execution_attempt` integrados.
- [x] Cadeia Route → Core → Memory → Decision → Economic Authorization → Router → Provider Adapter → Provider → Usage → Cost → Reconciliation → Execution Log integrada para `TEXT_GENERATION`.
- [x] Economic Safety tests: custo/FX/buffers, monetary guards, overage, idempotency, revenue/margin, maximum cost, tree bound, token budget, budget cap, fallback bounds e actual-cost security behavior cobertos.
- [x] CI final: `horus-ci` #182 / job `quality` = PASS no SHA `dcf4b338e2555c16b3bcb8021d6b8de34a09a39b`; `npm ci` PASS; TypeScript PASS; ESLint PASS; `npm test` = 22/22 PASS; build PASS.
- [x] Vercel final: projeto `velor-api`, deployment `dpl_4vEYndFzaQynQCwjBJY7Nez9c9Eo`, SHA `dcf4b338e2555c16b3bcb8021d6b8de34a09a39b`, estado `READY`.
- [x] Runtime deployment final sem erros registrados nos logs de runtime do deployment durante a validação; rotas protegidas continuam sujeitas aos contratos HTTP/auth canônicos.

**Evidência de fechamento:** SHA `dcf4b338e2555c16b3bcb8021d6b8de34a09a39b`; CI `horus-ci` #182; deployment `dpl_4vEYndFzaQynQCwjBJY7Nez9c9Eo`; Supabase `ljqmiuxztqseyglhvgmi` em `ACTIVE_HEALTHY`; Semantic Cache presente e integrado; 22/22 testes PASS.

**Estado:** 🟢 COMPLETE.

---

# 04 — MEMORY

- [x] `lib/memoryGraph.ts` existente.
- [x] Persistência em `memory_graph_nodes` existente.
- [x] Retrieval via `match_memory_nodes` existente.
- [~] Retrieval de memória integrado ao Core quando `payload.embedding` é fornecido.
- [ ] Implementar semantic pruning real.
- [ ] Implementar TTL/lifecycle real.
- [ ] Definir hot/cold context.
- [ ] Definir compression.
- [ ] Definir ownership e retrieval boundaries.
- [ ] Validar performance/custo.

**Estado:** 🟡 PARCIAL.

---

# 05 — ECONOMIC CORE

- [x] Model/Provider Registry existentes.
- [x] `ModelRecord` com contrato de pricing ampliado.
- [x] Supabase registry rejeita pricing ausente/inválido.
- [x] Cost Engine existente.
- [x] Credit Hold existente.
- [x] Overage system contract existente.
- [x] Reconciliation system contract existente.
- [x] Text Execution integrado às implementações sistêmicas canônicas.
- [x] Bounded routing candidates integrado ao Router para suportar fallback econômico limitado antes da autorização.
- [x] Pricing freshness aplicada no Core.
- [x] Hard maximum-cost gate aplicado contra `execution_budgets.remaining_cost_brl` e `maximum_total_cost_brl`.
- [x] Margin Guard aplicado contra `revenue_allocated_brl` e `minimum_margin_rate` do budget canônico.
- [x] Kill Switch enforcement existente em `getEconomicPolicy`.
- [x] Execution Tree bound aplicado contra `execution_budgets.maximum_tree_cost_brl`.
- [x] Atomic Execution Budget preservado pelo RPC canônico `authorize_horus_execution_attempt`.
- [x] Pricing snapshot completo.
- [x] Provider endpoint pricing.
- [x] Actual Cost reconciliation completa.
- [x] Economic Safety tests.

**Estado:** 🟢 INTEGRADO AO CORE 03; evolução econômica posterior permanece neste domínio.

---

# 06 — API / ROUTING

- [x] Rotas existentes parcialmente auditadas.
- [ ] Inventário completo de `app/api/**`.
- [ ] Route graph completo.
- [ ] Eliminar/identificar legacy bypasses.
- [x] Unificar application → economic authorization → router → adapter → provider para a vertical slice `TEXT_GENERATION`.
- [ ] Validar auth/error contracts integralmente.

**Estado:** 🟡 PARCIAL.

---

# 07 — SECURITY

- [x] Separação user-scoped/system client no Economic Core.
- [x] Operações financeiras privilegiadas encaminhadas a contratos sistêmicos.
- [x] `ai.execute` verificado antes da reserva econômica no fluxo Core.
- [ ] Auditoria global de RLS.
- [ ] Auditoria global de SECURITY DEFINER.
- [ ] Auditoria de service-role usage.
- [ ] Auditoria de secrets/env.
- [ ] Auditoria de webhooks e privileged operations.

**Estado:** 🟡 PARCIAL.

---

# 08 — TESTING

- [x] Script de testes existe.
- [x] CI possui TypeScript, lint, tests e build.
- [x] Testes unitários do Core adicionados em `tests/horus-core.test.mjs`.
- [x] Teste do Core atualizado para exigir Economic Authorization antes da execução automática.
- [x] `horus-ci` #182 no SHA `dcf4b338e2555c16b3bcb8021d6b8de34a09a39b`: TypeScript PASS, ESLint PASS, `npm test` 22/22 PASS, build PASS.
- [x] Economic safety coverage executada no mesmo CI: pricing/cost/margin/tree/token/budget/overage/idempotency/monetary guards.
- [ ] Inventariar testes existentes.
- [ ] Mapear cobertura por domínio.
- [ ] Integrar database/integration/E2E/smoke quando aplicável.

**Estado:** 🟢 CORE GATE VALIDADO; expansão de cobertura permanece no bloco de Testing.

---

# 09 — STUDIO

Auditar e integrar, sem criar módulos paralelos:

- [ ] Apps
- [ ] Audio
- [ ] Campaigns
- [ ] Code
- [ ] Dashboards
- [ ] Dev
- [ ] Docs
- [ ] Image
- [ ] Music
- [ ] Presentations
- [ ] Video
- [ ] Websites
- [ ] APIs
- [ ] Automations

Para cada módulo provar:

`UI → Route → Service → Database/Provider → Auth → Billing → Validation`

**Estado:** 🟡 PARCIAL.

---

# 10 — AGENTS

- [ ] Discovery completo.
- [ ] Agent creation.
- [ ] Configuration.
- [ ] Runtime.
- [ ] Tools.
- [ ] Permissions.
- [ ] Memory.
- [ ] Execution.
- [ ] Billing.
- [ ] Lifecycle.
- [ ] Persistence.
- [ ] Tests.

**Estado:** 🔍 NÃO DETERMINADO.

---

# 11 — PERSONAL

- [ ] Discovery completo.
- [ ] User context.
- [ ] Memory integration.
- [ ] Permissions.
- [ ] Voice/companion, se comprovados como parte da arquitetura final.
- [ ] Persistence.
- [ ] Tests.

**Estado:** 🔍 NÃO DETERMINADO.

---

# 12 — OBSERVABILITY

- [ ] Logs estruturados.
- [ ] Error tracking.
- [ ] Audit events.
- [ ] Execution tracking.
- [ ] Economic events.
- [ ] API events.
- [ ] Agent events.
- [ ] Metrics/correlation IDs.

**Estado:** 🔍 NÃO DETERMINADO.
