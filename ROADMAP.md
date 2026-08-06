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

- [x] `lib/memoryGraph.ts` preservado como contrato canônico.
- [x] Persistência real em `public.memory_graph_nodes` com `vector`, lifecycle, ownership, access telemetry e content hash.
- [x] Retrieval real via `public.match_memory_nodes` com threshold, limite, hot/cold fallback, recência, importância e retrieval count.
- [x] Ownership definido por `SYSTEM`, `USER` e `ORGANIZATION`, com `user_id`/`organization_id`, constraints e RLS.
- [x] Retrieval boundaries implementados: apenas memória SYSTEM, do usuário autenticado ou da organização solicitada pode ser retornada; RPC de retrieval exposto somente a `service_role`.
- [x] TTL/lifecycle real: `ACTIVE → STALE → EXPIRED → PRUNED`, expiração determinística e pruning idempotente via `prune_memory_graph`.
- [x] Semantic pruning real: expiração, stale por baixa utilização, deduplicação por `content_hash` dentro do ownership e pruning de memória degradada por idade/importance.
- [x] Hot/cold context implementado: HOT por acesso recente/retrieval recorrente; COLD recuperável por fallback controlado.
- [x] Compression implementada como compressão determinística de contexto: deduplicação semântica textual normalizada e bound de resultados, sem adicionar chamada de modelo ao caminho crítico.
- [x] Performance/custo validados: retrieval bounded em 20, índices por ownership/lifecycle/hash, vector extension movida para `extensions`, RLS otimizado com `select auth.*()`.
- [x] RLS validado com policies explícitas para SELECT/INSERT/UPDATE/DELETE.
- [x] RPCs `match_memory_nodes` e `prune_memory_graph` aplicadas e executadas em teste transacional real.
- [x] Testes de compressão adicionados em `tests/memory-graph.test.mjs`.
- [x] CI final do ciclo: `horus-ci` #200 / job `quality` PASS; TypeScript PASS; ESLint PASS; `npm test` 24/24 PASS; build PASS.
- [x] Vercel final do ciclo: `velor-api`, deployment `dpl_9EGXvXbfSa5htXMdpVFhcZSM8rUR`, SHA `8a0661546557fe5f9f9f8163afae394600fac363`, estado `READY`.
- [x] Runtime final: `/api/horus` e `/api/horus/review` sem clusters de erro nas últimas 24h; deployment final sem logs error/fatal.
- [x] Supabase final: projeto `ljqmiuxztqseyglhvgmi` `ACTIVE_HEALTHY`; migrations `memory_graph_lifecycle_and_boundaries`, `memory_graph_match_rpc_fix`, `memory_graph_match_rpc_ambiguity_fix`, `memory_graph_security_hardening` e `memory_graph_rls_performance` aplicadas.

**Evidência de fechamento:** SHA `8a0661546557fe5f9f9f8163afae394600fac363`; CI `horus-ci` #200 / job `quality`; deployment `dpl_9EGXvXbfSa5htXMdpVFhcZSM8rUR`; Supabase `ljqmiuxztqseyglhvgmi` `ACTIVE_HEALTHY`; 24/24 testes PASS; RLS e RPCs validados; runtime sem erros relevantes.

**Estado:** 🟢 COMPLETE.

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

- [x] Rotas relevantes do branch identificadas: `/api/horus`, `/api/horus/review`, `/api/auth/session`, `/api/webhook-pix`.
- [x] `/api/horus` protegido por `ai.execute` e erro de autenticação retorna JSON 401/403 em vez de redirect.
- [x] `/api/horus` mantém o caminho canônico Core → Economic Authorization → Router → Adapter → Provider.
- [x] `/api/horus/review` protegido por `ai.execute` e lookup de review limitado ao `owner_scope` autenticado.
- [x] Erros internos das rotas não são devolvidos como mensagem arbitrária ao cliente.
- [x] Webhook de pagamento permanece fora da sessão de usuário e possui autenticação por segredo em comparação constant-time.
- [x] Bypass econômico não foi introduzido pelas rotas validadas; execução de provider continua subordinada ao Core/Economic Authorization.
- [ ] Evidência independente de `horus-ci` para o SHA final do ciclo.

**Estado:** 🟡 IN_PROGRESS — implementação e deployment operacional corrigidos; fechamento formal aguarda evidência CI final no SHA final.

---

# 07 — SECURITY

- [x] Separação user-scoped/system client no Economic Core.
- [x] Operações financeiras privilegiadas encaminhadas a contratos sistêmicos.
- [x] `ai.execute` verificado antes da reserva econômica no fluxo Core.
- [x] API `/api/horus` protegida por autenticação + autorização e contrato de erro seguro.
- [x] Human Review limitado ao `owner_scope` autenticado; logs novos carregam ownership no metadata.
- [x] Webhook Efí endurecido: token apenas em header, comparação constant-time, `x-webhook-event-id` obrigatório, detecção de reuso de event id e método GET bloqueado.
- [x] `horus_webhook_events` existente validado como boundary de replay/idempotência.
- [x] SECURITY DEFINER relevantes auditados: funções econômicas privilegiadas são `EXECUTE` apenas para `service_role`/`postgres`; `reserve_horus_credits` permanece `authenticated` por ser user-scoped e valida `auth.uid()` internamente.
- [x] RLS relevante auditado: tabelas user-scoped possuem policies; tabelas sistêmicas sem policies permanecem acessíveis apenas pelos fluxos server/service-role correspondentes.
- [x] Service-role usage revisado nos módulos Core/Memory/Economic: uso permanece restrito a operações sistêmicas/privilegiadas.
- [x] Secrets não são expostos via `NEXT_PUBLIC_*`; provider/service-role/payment credentials permanecem server-only.
- [x] Runtime Vercel do ciclo sem erros registrados nas rotas `/api/horus`, `/api/horus/review` e `/api/webhook-pix` na janela validada.
- [ ] Evidência independente de `horus-ci` para o SHA final do ciclo.

**Estado:** 🟡 IN_PROGRESS — controles técnicos principais implementados e validados; fechamento formal aguarda CI final no SHA final.

**Evidência operacional do ciclo:** Supabase `ljqmiuxztqseyglhvgmi` `ACTIVE_HEALTHY`; advisors de segurança sem falha crítica, com `reserve_horus_credits` identificado como SECURITY DEFINER user-scoped e autenticado por `auth.uid()`; Vercel `velor-api` deployment `dpl_AMmH7q9fjaVLUpcwryeyqFJvkVG2` para SHA `6b9b0024062f5ce8bfb957d5f5709d4984e4eb4b` = `READY`; runtime sem erros.

---

# 08 — TESTING

- [x] Script de testes existe.
- [x] CI possui TypeScript, lint, tests e build.
- [x] Testes unitários do Core adicionados em `tests/horus-core.test.mjs`.
- [x] Teste do Core atualizado para exigir Economic Authorization antes da execução automática.
- [x] `horus-ci` #200 no estado final `8a0661546557fe5f9f9f8163afae394600fac363`: TypeScript PASS, ESLint PASS, `npm test` 24/24 PASS, build PASS.
- [x] Economic safety coverage preservada.
- [x] Memory compression coverage adicionada em `tests/memory-graph.test.mjs`.
- [x] Testes de contrato de API/Security adicionados em `tests/api-security.test.mjs`.
- [ ] Evidência CI do ciclo 06+07 no SHA final.
- [ ] Inventariar testes existentes.
- [ ] Mapear cobertura por domínio.
- [ ] Integrar database/integration/E2E/smoke quando aplicável.

**Estado:** 🟡 IN_PROGRESS — cobertura específica de API/Security adicionada; CI final do ciclo não está disponível para o SHA final.

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
- [Websites]
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

# 06 + 07 — EXECUTION EVIDENCE

- Final source state: branch `chore/horus-foundation-rebuild`.
- Latest documented source SHA: `f7505dfa68123408d962a7827a330714cf2f47ad`.
- Vercel deployment for the immediately preceding validated source SHA `6b9b0024062f5ce8bfb957d5f5709d4984e4eb4b`: `dpl_AMmH7q9fjaVLUpcwryeyqFJvkVG2`, project `velor-api`, `READY`.
- Runtime errors for `/api/horus`, `/api/horus/review` and `/api/webhook-pix`: none in the validation window.
- Supabase project `ljqmiuxztqseyglhvgmi`: `ACTIVE_HEALTHY`.
- Security boundary migration history includes `horus_api_security_surface_hardening`, `horus_webhook_idempotency_boundary`, `horus_webhook_event_idempotency` and compensating cleanup `remove_unused_webhook_event_extension`.
- `horus-ci` workflow exists and defines `npm ci → TypeScript → ESLint → npm test → build`, but no workflow run is exposed by the available GitHub Actions run query for the current/final SHAs; combined GitHub status currently exposes Vercel only.

**06 + 07 status:** `IN_PROGRESS` pending independent CI evidence on the final SHA. No code, database, Vercel or runtime blocker remains identified in this execution.
