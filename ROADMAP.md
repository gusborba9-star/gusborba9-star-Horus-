# Hórus — Roadmap de Execução

> Fonte de execução. A arquitetura e os contratos permanecem governados por `docs/blueprint/HORUS-ENGINEERING-BLUEPRINT.md`.

## Estados consolidados

### 01 — FOUNDATION
- [x] Next.js 15.5.22 / React 19.2.2 / TypeScript 5.9.3.
- [x] ESLint 9 Flat Config.
- [x] `next.config.ts` sem `ignoreBuildErrors`.
- [x] CI canônico definido em `.github/workflows/horus-ci.yml`.
- [x] Vercel `velor-api` operacional.

**Estado:** 🟢 VALIDADO.

### 02 — ARCHITECTURE DISCOVERY
- [x] Blueprint e governança existentes.
- [x] Contratos 03–08 consolidados.
- [x] Studio discovery consolidado no closure 09.

**Estado:** 🔍 DISCOVERY global continua independente dos blocos fechados.

### 03 — CORE
- [x] `/api/horus`, LangGraph/Core, Execution Log, Semantic Cache, HITL/Confidence e Economic Authorization.
- [x] Economic Safety e deployment final comprovados nos fechamentos anteriores.

**Estado:** 🟢 COMPLETE.

### 04 — MEMORY
- [x] Memory Graph, lifecycle, ownership, RLS, retrieval boundaries, pruning, hot/cold e compression conforme evidência anterior.

**Estado:** 🟢 COMPLETE.

### 05 — ECONOMIC CORE
- [x] Registry, pricing, Cost Engine, Credit Hold, Maximum Cost, Margin Guard, Kill Switch, bounded routing, actual cost e reconciliation.

**Estado:** 🟢 INTEGRADO AO CORE 03.

### 06 — API / ROUTING
- [x] `/api/horus` canônica.
- [x] `/api/horus/review` ownership-bound.
- [x] `/api/auth/session` boundary de sessão.
- [x] `/api/webhook-pix` secret + replay/idempotency.
- [x] `/api/chat`, `/api/horus-router` e `/api/charge` tombstones HTTP 410.
- [x] 29/29 testes, TypeScript, ESLint, build e Vercel READY conforme closure.

**Estado:** 🟢 COMPLETE.

### 07 — SECURITY
- [x] Auth/authorization antes de execução econômica.
- [x] RLS, grants, SECURITY DEFINER, webhook idempotency, privileged boundaries e secrets server-only.
- [x] Security Advisor: CRITICAL 0; WARN 1 intencional em `reserve_horus_credits`.

**Estado:** 🟢 COMPLETE.

### 08 — TESTING
- [x] 41/41 testes.
- [x] 12 cross-domain system contracts.
- [x] Regressões Core/Memory/Economic/API/Security.
- [x] Provider isolation, tombstones, webhook idempotency, ownership, Execution Log e Economic Authorization.
- [x] TypeScript, ESLint, build e Vercel evidenciados.
- [x] Observability classificada apenas como contract surface; não fecha 12.
- [x] CI formal independente permanece não recuperável pela integração disponível.

**Estado:** 🟢 COMPLETE.

### 09 — STUDIO
- [x] Studio unificado orientado a `NEXUS + PROJECT + CAPABILITIES`.
- [x] Project Engine persistente em Supabase.
- [x] Project context, architecture, requirements, capabilities, integrations, revisions e audit state.
- [x] Capability selection dinâmica para Apps, Audio, Campaigns, Code, Dashboards, Dev, Docs, Image, Music, Presentations, Video, Websites, APIs e Automations.
- [x] Execution Graph dinâmico, sem pipeline universal fixo.
- [x] Nexus → Project → Core/Economic Authorization → Execution Log integrado.
- [x] Connector Engine com GitHub/Vercel/Supabase/external API e permissões granulares.
- [x] Preview/Staging/Production boundary no Project Engine; produção e migrations destrutivas permanecem approval-gated por contrato de planejamento.
- [x] Revision Engine persistente.
- [x] `/api/studio/projects`, `/api/studio/projects/[id]` e `/api/studio/connectors`.
- [x] UI do Studio substituída por workspace universal de projetos; módulos antigos permanecem como superfícies legadas sem serem tratados como produtos independentes.
- [x] Testes unitários/contratuais do planner e permission boundary adicionados.
- [x] Migrations 09 aplicadas e confirmadas no Supabase real.
- [x] Vercel final READY com 47/47 testes e production build.
- [x] Runtime error aggregation sem erros no período auditado.

**Estado:** 🟢 COMPLETE.

**Limite explícito:** execução externa real depende de connector secret autorizado/configurado no ambiente; o código não expõe providers ao usuário nem cria bypass do Core/Economic/Security. Não há declaração de sucesso de uma operação externa de produção sem credencial/evidência real.

### 10 — AGENTS
- [ ] Discovery completo.
- [ ] Runtime, tools, permissions, memory, execution, lifecycle e billing.

**Estado:** 🔍 NÃO DETERMINADO.

### 11 — PERSONAL
- [ ] Discovery, user context, memory integration, permissions, persistence e tests.

**Estado:** 🔍 NÃO DETERMINADO.

### 12 — OBSERVABILITY
- [ ] Structured logs.
- [ ] Error tracking.
- [ ] Audit events.
- [ ] Execution tracking completo.
- [ ] Economic/API/Agent telemetry.
- [ ] Metrics/correlation IDs.

**Estado:** 🔍 NÃO DETERMINADO.

**Regra:** testes de Execution Log no 08 e audit state do Studio não antecipam o fechamento de 12.

## 09 — FINAL EVIDENCE

- Supabase project: `ljqmiuxztqseyglhvgmi`.
- Applied migrations: `horus_studio_project_engine`, `horus_studio_capability_registry`.
- Functional implementation / validation SHA: `90b9daa37290275f2d020032c9ce8f2995812005`.
- Vercel deployment: `dpl_EARQiwD5vmVUi6jSpkMKYduLJ4S3`.
- Vercel state: `READY`.
- Build: 47/47 PASS; Next.js production build completed; type/lint validation completed.
- Runtime: no runtime errors in selected recent window.
- Formal GitHub Actions `horus-ci`: no recoverable independent run through the available integration.
- Closure: `docs/blueprint/09-STUDIO-CLOSURE.md`.
- No new production architecture was created outside Core/Economic/Security contracts.

**Next:** 10 — AGENTS.
