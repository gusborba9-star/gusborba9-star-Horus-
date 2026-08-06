# Hórus — Roadmap de Execução

> Este arquivo é a **visão de execução** do Hórus. A arquitetura, governança, contratos, evidências e regras de integração vivem no **Hórus Engineering Blueprint** em `docs/blueprint/HORUS-ENGINEERING-BLUEPRINT.md`.
>
> Regra central: **nenhuma estrutura nova pode ser criada sem demonstrar como ela se conecta à arquitetura existente.**

## Fonte de verdade

- **Blueprint arquitetural:** `docs/blueprint/HORUS-ENGINEERING-BLUEPRINT.md`
- **Roadmap:** este arquivo

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
- [x] Vercel final do Core: `velor-api`, deployment `dpl_4vEYndFzaQynQCwjBJY7Nez9c9Eo`, READY.

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

- [x] Route graph operacional identificado: `/api/horus`, `/api/horus/review`, `/api/auth/session`, `/api/webhook-pix`, `/api/chat`, `/api/horus-router`, `/api/charge`.
- [x] `/api/horus` protegido por `ai.execute` e mantém Core → Economic Authorization → Router → Adapter → Provider.
- [x] `/api/horus/review` protegido por `ai.execute` e lookup limitado ao `owner_scope` autenticado.
- [x] `/api/auth/session` permanece como boundary de sessão Supabase.
- [x] `/api/webhook-pix` permanece fora da sessão e exige segredo server-side + `x-webhook-event-id`.
- [x] `/api/chat` desativada como legacy provider bypass com HTTP 410 `ROUTE_DEPRECATED_USE_HORUS_CORE`.
- [x] `/api/horus-router` desativada como legacy provider bypass com HTTP 410 `ROUTE_DEPRECATED_USE_HORUS_CORE`.
- [x] `/api/charge` desativada como legacy mock-financial endpoint com HTTP 410 `ROUTE_DEPRECATED_BILLING_CONTRACT_REQUIRED`.
- [x] Erros internos das rotas canônicas não são expostos como mensagens arbitrárias.
- [x] Bypass econômico/provider removido das rotas legadas identificadas.
- [x] `tests/api-security.test.mjs` cobre os três tombstones e ausência de provider bypass.

**Evidência operacional:** Vercel `velor-api`, SHA `befdabf72750b3424098320ba90cdb6462c6881f`, deployment `dpl_9VFLitmjDUmT447z3khFJ6iHGXKb`, `READY`; build sem erros; runtime error clusters inexistentes na janela validada.

**Estado técnico:** 🟢 IMPLEMENTADO/VALIDADO.

---

# 07 — SECURITY

- [x] Separação user-scoped/system client preservada.
- [x] `ai.execute` verificado antes da reserva econômica.
- [x] Human Review limitado ao `owner_scope` autenticado.
- [x] Webhook Efí: token somente em header, comparação constant-time, event id obrigatório, replay/idempotência e GET bloqueado.
- [x] `horus_webhook_events` possui unique `(provider,event_id)` e acesso efetivo restrito a `service_role`/`postgres`.
- [x] SECURITY DEFINER econômicos privilegiados limitados a `service_role`/`postgres`; `reserve_horus_credits` permanece user-scoped e valida `auth.uid()`.
- [x] RLS habilitado nas tabelas públicas relevantes; tabelas sistêmicas sem policies não concedem acesso a roles de cliente.
- [x] Secrets provider/service-role/payment permanecem server-only.
- [x] Provider bypasses legados removidos de `/api/chat` e `/api/horus-router`.
- [x] Mock financial output removido de `/api/charge`.
- [x] Testes API/Security ampliados para os bypasses identificados.
- [x] Security migrations aplicadas no Supabase: `horus_api_security_surface_hardening`, `horus_webhook_idempotency_boundary`, `webhook_event_idempotency`, `remove_unused_webhook_event_extension`.
- [x] Supabase advisors sem finding CRITICAL; o WARN existente é `reserve_horus_credits` SECURITY DEFINER user-scoped, cuja exposição a `authenticated` é intencional e protegida por `auth.uid()`.

**Evidência operacional:** Supabase `ljqmiuxztqseyglhvgmi`; RLS/grants verificados; Vercel `velor-api`, SHA `befdabf72750b3424098320ba90cdb6462c6881f`, deployment `dpl_9VFLitmjDUmT447z3khFJ6iHGXKb`, READY; runtime sem erros.

**Estado técnico:** 🟢 IMPLEMENTADO/VALIDADO.

---

# 08 — TESTING

- [x] Script de testes existe.
- [x] CI canônico definido com TypeScript, ESLint, testes e build.
- [x] Testes Core existentes.
- [x] Economic safety coverage preservada.
- [x] Memory compression coverage.
- [x] API/Security contract coverage.
- [x] Cobertura para tombstones de `/api/chat`, `/api/horus-router` e `/api/charge`.

**Evidência:** Vercel build do SHA final concluído sem erros e deployment READY.

**Nota:** o conector GitHub Actions disponível nesta execução não expôs uma execução `horus-ci` para o SHA final; o status combinado do SHA expõe Vercel, sem check CI independente. CI não é marcado como PASS sem essa evidência.

**Estado:** 🟡 VALIDATION EVIDENCE.

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

# 06 + 07 — EXECUTION EVIDENCE

- Branch final: `chore/horus-foundation-rebuild`.
- Código final: `befdabf72750b3424098320ba90cdb6462c6881f`.
- Correções principais: `cfc64b2d301b793a412f5cd90c8c2f06f31290f0`, `8865ba2e04946029d117a9f0ccb7ecf5c68cef35`, `9c2a5974bb339d266ffe8739eb6941f5cba684e3`, consolidadas pelo commit de testes `befdabf72750b3424098320ba90cdb6462c6881f`.
- Supabase: `ljqmiuxztqseyglhvgmi`, migrations de security boundary aplicadas e RLS/grants verificados.
- Vercel: `velor-api` / `dpl_9VFLitmjDUmT447z3khFJ6iHGXKb` / `READY`.
- Runtime: nenhum cluster de erro nas rotas API validadas na janela selecionada.
- GitHub combined status do SHA final: Vercel success; nenhum check `horus-ci` independente exposto pelo conector disponível.

**06 — API / ROUTING:** 🟢 IMPLEMENTADO/VALIDADO TECNICAMENTE.

**07 — SECURITY:** 🟢 IMPLEMENTADO/VALIDADO TECNICAMENTE.

**Formal CI gate:** não marcado como PASS sem evidência independente do workflow no SHA final.
