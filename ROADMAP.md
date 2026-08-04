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
- [ ] Evidenciar `npm ci` + lint + TypeScript + tests + build no mesmo SHA.
- [ ] Evidenciar deployment Vercel correspondente em `READY`.

**Estado:** 🟢 IMPLEMENTADO / gate ainda aberto até evidência final.

---

# 02 — ARCHITECTURE DISCOVERY

- [x] Blueprint operacional criado.
- [x] Governança e Definition of Done definidos.
- [x] Contratos críticos iniciais registrados.
- [ ] Fechar inventário recursivo de arquivos.
- [ ] Fechar import/export graph.
- [ ] Fechar route graph.
- [ ] Fechar database/RPC graph.
- [ ] Classificar scripts históricos.
- [ ] Classificar órfãos e duplicatas com evidência.

**Estado:** 🔍 DISCOVERY.

---

# 03 — CORE

- [x] Endpoint base `/api/horus` existe.
- [x] Circuit breaker existente.
- [ ] Implementar/integrar LangGraph real.
- [ ] Integrar execution log real.
- [ ] Integrar semantic cache real.
- [ ] Implementar confidence/human-in-the-loop real.
- [ ] Validar cadeia completa Route → Core → Service → Persistence/Provider.

**Estado:** 🟡 PARCIAL.

---

# 04 — MEMORY

- [x] `lib/memoryGraph.ts` existente.
- [x] Persistência em `memory_graph_nodes` existente.
- [x] Retrieval via `match_memory_nodes` existente.
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

---

# 13 — CLEANUP

## Fase 1 — Audit

- [ ] Inventariar `fix_*`.
- [ ] Inventariar `patch_*`.
- [ ] Inventariar `rewrite_*`.
- [ ] Inventariar `update_*`.
- [ ] Inventariar `generate_*`.
- [ ] Inventariar scripts JS auxiliares.
- [ ] Classificar ACTIVE / LEGACY / ORPHAN / DUPLICATE / TEMPORARY / UNKNOWN.

## Fase 2 — Cleanup

Somente após prova de ausência de:

- imports;
- exports consumidos;
- routes;
- package scripts;
- CI;
- docs;
- dynamic references;
- runtime dependency;
- migration dependency;
- deployment dependency.

**Nenhum arquivo é deletado durante a auditoria.**

---

# 14 — GATE ORDER

```text
FOUNDATION
   ↓
ARCHITECTURE DISCOVERY
   ↓
BUILD GATE
   ↓
ARCHITECTURE GATE
   ↓
SECURITY GATE
   ↓
ECONOMIC SAFETY INTEGRATION
   ↓
API MIGRATION
   ↓
AGENTS / PERSONAL / STUDIO / MEMORY EXPANSION
   ↓
PRODUCTION GATE
```

Uma camada superior não deve ser marcada como concluída enquanto uma dependência inferior estiver `BLOCKED` ou sem evidência.

---

# 15 — HISTORICAL FOUNDATION

O roadmap original descrevia uma visão de "Agência de Empregos Digitais Universal", event sourcing, Generic Connector Interface, human-in-the-loop, Memory Graph e MVP Maria. Esses objetivos estratégicos permanecem históricos; sua implementação atual deve ser determinada pelo Blueprint e pela evidência do repositório, não pelo checklist antigo.

Nenhum item histórico é considerado `COMPLETE` apenas porque estava marcado `[x]` no roadmap anterior.
