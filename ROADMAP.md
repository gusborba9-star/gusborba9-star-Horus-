# Hórus — Roadmap de Execução

> Este arquivo é a visão de execução do Hórus. A arquitetura, governança, contratos, evidências e regras de integração vivem no Hórus Engineering Blueprint em `docs/blueprint/HORUS-ENGINEERING-BLUEPRINT.md`.
>
> Regra central: nenhuma estrutura nova pode ser criada sem demonstrar como ela se conecta à arquitetura existente.

## Fonte de verdade

- Blueprint arquitetural: `docs/blueprint/HORUS-ENGINEERING-BLUEPRINT.md`
- Roadmap: este arquivo
- Evidência de fechamento 06 + 07: `docs/blueprint/06-07-API-SECURITY-CLOSURE.md`
- Evidência de fechamento 08: `docs/blueprint/08-TESTING-CLOSURE.md`

---

# 01 — FOUNDATION

- [x] Next.js 15.5.22 definido.
- [x] React 19.2.2 definido.
- [x] TypeScript 5.9.3 definido.
- [x] ESLint 9.39.1 + Flat Config configurado.
- [x] `@typescript-eslint/parser` associado a TS/TSX.
- [x] `@next/eslint-plugin-next` registrado.
- [x] `next.config.ts` mantém `ignoreBuildErrors: false`.
- [x] CI canônico definido em `.github/workflows/horus-ci.yml` com `npm ci → TypeScript → ESLint → npm test → build`.
- [x] Vercel `velor-api` operacional.

**Estado:** 🟢 VALIDADO.

---

# 02 — ARCHITECTURE DISCOVERY

- [x] Blueprint operacional criado.
- [x] Governança e Definition of Done definidos.
- [x] Contratos críticos iniciais registrados.
- [ ] Fechar inventário recursivo de arquivos.
- [ ] Fechar import/export graph.
- [ ] Fechar route graph global fora do escopo dos blocos fechados.
- [ ] Fechar database/RPC graph global.

**Estado:** 🔍 DISCOVERY.

---

# 03 — CORE

- [x] Endpoint `/api/horus`.
- [x] LangGraph canônico.
- [x] Execution Log real.
- [x] Semantic Cache real e autorizado economicamente.
- [x] Confidence/HITL.
- [x] Economic Authorization.
- [x] Pricing, FX e Economic Policy.
- [x] TEXT_GENERATION real com Provider Adapter, Usage, Actual Cost e Reconciliation.
- [x] Economic Safety tests.
- [x] CI final do Core: `horus-ci` #182, TypeScript PASS, ESLint PASS, `npm test` 22/22 PASS, build PASS.
- [x] Vercel final do Core: `velor-api`, deployment `dpl_4vEYndFzaQynQCwjBJY7Ne9z9Eo`, READY.

**Estado:** 🟢 COMPLETE.

---

# 04 — MEMORY

- [x] `lib/memoryGraph.ts` preservado como contrato canônico.
- [x] `public.memory_graph_nodes` com vector, lifecycle, ownership, telemetry e content hash.
- [x] `match_memory_nodes` com threshold, bound e hot/cold fallback.
- [x] Ownership SYSTEM/USER/ORGANIZATION e RLS.
- [x] Retrieval boundaries.
- [x] `ACTIVE → STALE → EXPIRED → PRUNED`.
- [x] Semantic pruning, deduplicação e degradação controlada.
- [x] Hot/cold context.
- [x] Compression determinística sem modelo adicional no caminho crítico.
- [x] Índices e bounds de performance.
- [x] RPCs e migrations aplicadas no Supabase.
- [x] CI `horus-ci` #200, TypeScript PASS, ESLint PASS, `npm test` 24/24 PASS, build PASS.
- [x] Vercel `velor-api`, deployment `dpl_9EGXvXbfSa5htXMdpVFhcZSM8rUR`, READY.
- [x] Runtime sem erros relevantes.

**Estado:** 🟢 COMPLETE.

---

# 05 — ECONOMIC CORE

- [x] Model/Provider Registry.
- [x] Pricing contract ampliado.
- [x] Cost Engine.
- [x] Credit Hold.
- [x] Overage/Reconciliation contracts.
- [x] Bounded routing candidates.
- [x] Pricing freshness.
- [x] Maximum-cost gate.
- [x] Margin Guard.
- [x] Kill Switch.
- [x] Execution Tree bound.
- [x] Atomic Execution Budget.
- [x] Pricing Snapshot.
- [x] Provider endpoint pricing.
- [x] Actual Cost reconciliation.
- [x] Economic Safety tests.

**Estado:** 🟢 INTEGRADO AO CORE 03.

---

# 06 — API / ROUTING

- [x] `/api/horus` canônica, protegida por `ai.execute` e conectada ao Core → Economic Authorization → Router → Adapter → Provider.
- [x] `/api/horus/review` autenticada e ownership-bound ao `owner_scope`.
- [x] `/api/auth/session` preservada como boundary de sessão.
- [x] `/api/webhook-pix` protegida por segredo server-side, event id obrigatório e replay/idempotency.
- [x] `/api/chat` tombstone HTTP 410 `ROUTE_DEPRECATED_USE_HORUS_CORE`.
- [x] `/api/horus-router` tombstone HTTP 410 `ROUTE_DEPRECATED_USE_HORUS_CORE`.
- [x] `/api/charge` tombstone HTTP 410 `ROUTE_DEPRECATED_BILLING_CONTRACT_REQUIRED`.
- [x] Bypasses diretos de provider e mock financeiro removidos das rotas legadas identificadas.
- [x] Erros internos não são expostos como mensagens arbitrárias.
- [x] `tests/api-security.test.mjs` cobre autenticação, contratos de erro, ownership, webhook replay/idempotency e tombstones.
- [x] TypeScript/type validation PASS no production build.
- [x] ESLint PASS no production build.
- [x] `npm test`: 29/29 PASS.
- [x] Production build PASS.
- [x] Vercel `velor-api`: deployment `dpl_8ADkpE5t2hSBE6Pc5sWMpup89yBz`, SHA `92ef5c728aa59cd9729886d7118574d096267542`, READY.
- [x] Runtime sem erro/fatal na janela de validação.

**Evidência formal:** implementação `befdabf72750b3424098320ba90cdb6462c6881f`; SHA canônico de validação/deployment `92ef5c728aa59cd9729886d7118574d096267542`.

**Nota de CI:** a integração GitHub disponível não recupera uma execução independente `horus-ci` para o SHA de validação. Isso não é convertido em CI PASS por inferência; os gates técnicos independentes estão evidenciados por type validation, lint, 29/29 testes, build, Vercel e runtime.

**Estado:** 🟢 COMPLETE.

---

# 07 — SECURITY

- [x] `ai.execute` verificado antes da reserva econômica.
- [x] Human Review limitado ao `owner_scope` autenticado.
- [x] Webhook protegido por segredo server-side, comparação constant-time, event id obrigatório, replay/idempotency e GET bloqueado.
- [x] `horus_webhook_events` possui unique `(provider,event_id)` e acesso direto de cliente bloqueado.
- [x] `horus_execution_logs` protegido e reservado ao caminho privilegiado.
- [x] `horus_semantic_cache_entries` protegido e reservado ao caminho privilegiado.
- [x] Funções econômicas privilegiadas limitadas a `service_role`/`postgres`.
- [x] `reserve_horus_credits` permanece `authenticated + SECURITY DEFINER` por contrato user-scoped e valida `auth.uid()` internamente.
- [x] RLS habilitado na superfície pública relevante; tabelas sistêmicas sem policies não concedem acesso direto a `anon`/`authenticated`.
- [x] Secrets de provider/service-role/payment permanecem server-only.
- [x] Provider bypasses legados removidos.
- [x] Mock financeiro removido.
- [x] Migrations aplicadas e confirmadas no Supabase real.
- [x] Security Advisor: CRITICAL = 0; WARN = 1, intencional em `reserve_horus_credits`; INFOs classificados conforme exposição real.
- [x] Testes API/Security e economic safety executados dentro dos 29 testes aprovados.
- [x] TypeScript/type validation PASS.
- [x] ESLint PASS.
- [x] Production build PASS.
- [x] Vercel `velor-api` deployment `dpl_8ADkpE5t2hSBE6Pc5sWMpup89yBz` READY.
- [x] Runtime sem erro/fatal na janela auditada.

**Migrations confirmadas:** `horus_api_security_surface_hardening`, `horus_webhook_idempotency_boundary`, `webhook_event_idempotency`, `remove_unused_webhook_event_extension`.

**Evidência formal:** Supabase `ljqmiuxztqseyglhvgmi`; validação/deployment SHA `92ef5c728aa59cd9729886d7118574d096267542`.

**Nota de CI:** `horus-ci` independente não é recuperável pela integração GitHub disponível; não é marcado como PASS por inferência.

**Estado:** 🟢 COMPLETE.

---

# 08 — TESTING

- [x] Script de testes existe e executa `tests/**/*.test.mjs`.
- [x] CI canônico definido com `npm ci → TypeScript → ESLint → npm test → build`.
- [x] Core regression coverage preservada.
- [x] Economic safety coverage preservada.
- [x] Memory compression coverage preservada.
- [x] API/Security contract coverage preservada.
- [x] Tombstone coverage para `/api/chat`, `/api/horus-router` e `/api/charge`.
- [x] Cross-domain system contract suite criada em `tests/system-contracts.test.mjs`.
- [x] Vertical-slice ordering test: API → Core → Memory → Economic Authorization → Provider.
- [x] Economic authorization hard-gate regression.
- [x] Memory/economic boundary regression.
- [x] Execution-log boundary regression.
- [x] Provider bypass regression.
- [x] Webhook replay/idempotency contract regression.
- [x] Error leakage regression.
- [x] Human-review ownership regression.
- [x] Privileged execution-data boundary regression.
- [x] `npm test`: **41/41 PASS**, 0 fail, 0 cancelled, 0 skipped, 0 todo.
- [x] Production build executed the full test suite before `next build`.
- [x] Vercel build for validation SHA executed the expanded suite.
- [x] Runtime error aggregation: no runtime errors in selected 7-day window.
- [x] Testing closure documented in `docs/blueprint/08-TESTING-CLOSURE.md`.

**Evidência:** validation SHA `51fdf199f04c8effe086401cbfcc5954f22f66d9`; Vercel deployment `dpl_67iJphNPqfDVzVeWkeP7kb6FyVhB`; 41/41 tests executed. Formal GitHub Actions run remains não recuperável pela integração disponível.

**Limitação explícita:** a suíte 08 é de regressão/contrato sistêmico e não reivindica E2E de todos os produtos Studio/Agents/Personal nem execução real de provider com custo externo. Live provider execution é deliberadamente excluída do caminho de teste para evitar efeitos econômicos externos.

**Estado:** 🟢 COMPLETE.

---

# 09 — STUDIO

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

# 06 + 07 — FINAL EXECUTION EVIDENCE

- Branch: `chore/horus-foundation-rebuild`.
- Implementation SHA: `befdabf72750b3424098320ba90cdb6462c6881f`.
- Validation/deployment SHA: `92ef5c728aa59cd9729886d7118574d096267542`.
- `6955d21e...` and `19944e4f...` are documentation commits and are not reinterpreted as implementation SHAs.
- Supabase: `ljqmiuxztqseyglhvgmi`; security migrations applied; RLS, grants and function boundaries verified.
- Vercel: `velor-api`; deployment `dpl_8ADkpE5t2hSBE6Pc5sWMpup89yBz`; READY; validation SHA `92ef5c...`.
- Tests: 29/29 PASS.
- TypeScript: PASS in production build.
- ESLint: PASS in production build.
- Build: PASS.
- Runtime: no relevant error/fatal cluster in validation window.
- Security Advisor: 0 CRITICAL, 1 intentional WARN, INFOs classified.
- Formal independent CI: **NOT RECOVERABLE THROUGH THE AVAILABLE GITHUB INTEGRATION**; no CI PASS inferred or fabricated.

**06 — API / ROUTING:** 🟢 COMPLETE.

**07 — SECURITY:** 🟢 COMPLETE.

**Next:** 08 — TESTING.

---

# 08 — TESTING — FINAL EVIDENCE

- Validation SHA: `51fdf199f04c8effe086401cbfcc5954f22f66d9`.
- Test suite: `41/41 PASS`.
- Added suite: `tests/system-contracts.test.mjs` (12 cross-domain contract tests).
- Vercel deployment: `dpl_67iJphNPqfDVzVeWkeP7kb6FyVhB`.
- Vercel project: `velor-api`.
- Vercel build executed `npm test` before production build.
- Runtime error aggregation: no runtime errors in selected 7-day window.
- Supabase: no 08 migration required; 06/07 security state rechecked.
- Security Advisor: 0 CRITICAL, 1 intentional WARN, INFOs classified.
- Formal GitHub Actions CI: **NOT RECOVERABLE THROUGH THE AVAILABLE GITHUB INTEGRATION**.
- Local shell execution: attempted but GitHub network/DNS was unavailable in the execution container; no local PASS inferred.

**08 — TESTING:** 🟢 COMPLETE.

**Next:** 09 — STUDIO.