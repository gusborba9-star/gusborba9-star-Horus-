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
- [ ] Evidência de `npm test` executado no mesmo SHA ainda não foi obtida por CI/ferramenta disponível.

**Estado:** 🟡 IMPLEMENTADO / build e deployment comprovados; gate de testes permanece aberto.

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
- [~] Implementar/integrar LangGraph real: grafo canônico `lib/core/horusGraph.ts` criado e integrado a `/api/horus`; validação e deployment no SHA `de59a1c14aa5c0d87a3baa55d7d297a056242bd4` comprovados.
- [x] Integrar execution log real: `public.horus_execution_logs`, migration canônica `supabase/migrations/20260805000000_create_horus_execution_logs.sql`, persistência de sucesso/revisão humana/erro em `lib/core/executionLog.ts` e integração no `/api/horus`; deployment READY no SHA `3167ef3482e0714a1a61585fa1c8387fb40613a7`.
- [ ] Integrar semantic cache real.
- [~] Implementar confidence/human-in-the-loop real: score determinístico com limiar de `0.70` e decisão `human_review`/`route_to_service` integrados ao grafo; execução de testes ainda sem evidência CI.
- [~] Integrar Economic Authorization canônico: `lib/core/economicAuthorization.ts` reutiliza `execution_budgets`, `execution_attempts` e `authorize_horus_execution_attempt`; o grafo agora seleciona provider/model pelo `EconomicRouter`, calcula o limite de custo via `Cost Engine` e autoriza o `execution_attempt` antes da execução. O SHA `b1103c66fe2187d60e990628213fe8a3a7bd00a4` move a autenticação/permissão `ai.execute` para antes da reserva econômica, evitando reservar budget antes de uma falha de autorização.
- [~] Integrar execução real de texto: `lib/core/textExecution.ts` reutiliza `ProviderAdapterRegistry`, adapters OpenRouter/Google, `execution_attempts`, `execution_usage` e `reconcile_horus_execution_attempt`; resultado, usage e actual cost retornam pelo `/api/horus`. Deployment READY do SHA final `b1103c66fe2187d60e990628213fe8a3a7bd00a4`: `dpl_7ufWvANoN2gqtmL6DMN3YZRD79Bi`.
- [~] Validar cadeia Route → Core → Service → Persistence/Provider: Route → Core → Memory → Decision → Economic Authorization → Router → Provider Adapter → Provider → Usage → Cost → Reconciliation → Execution Log está implementada para `TEXT_GENERATION`; semantic cache e demais capabilities ainda permanecem pendentes.

**Estado:** 🟡 PARCIAL — vertical slice de execução de texto implementada e deployment final READY; execução `npm test` no SHA final permanece sem evidência disponível, e semantic cache/hard economic gates/demais capabilities ainda não estão fechados.

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
- [ ] Pricing snapshot completo.
- [ ] Provider endpoint pricing.
- [ ] Pricing freshness.
- [ ] Hard maximum-cost filter.
- [ ] Margin Guard.
- [ ] Kill Switch enforcement.
- [ ] Execution Tree bound.
- [ ] Atomic Execution Budget.
- [ ] Actual Cost reconciliation completa.
- [ ] Economic Safety tests.

**Estado:** 🟡 PARCIAL. Economic Safety Gate permanece fechado.

---

# 06 — API / ROUTING

- [x] Rotas existentes parcialmente auditadas.
- [ ] Inventário completo de `app/api/**`.
- [ ] Route graph completo.
- [ ] Eliminar/identificar legacy bypasses.
- [ ] Unificar application → economic authorization → router → adapter → provider.
- [ ] Validar auth/error contracts.

**Estado:** 🟡 PARCIAL.

---

# 07 — SECURITY

- [x] Separação user-scoped/system client no Economic Core.
- [x] Operações financeiras privilegiadas encaminhadas a contratos sistêmicos.
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
- [ ] Executar `npm test` no SHA final e registrar evidência.
- [ ] Inventariar testes existentes.
- [ ] Mapear cobertura por domínio.
- [ ] Adicionar testes onde houver lacunas comprovadas.
- [ ] Integrar database/integration/E2E/smoke quando aplicável.

**Estado:** 🟡 PARCIAL.

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
