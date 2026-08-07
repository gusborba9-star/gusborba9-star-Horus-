# Hórus Cognitive OS: Roadmap de Desenvolvimento

Este roadmap detalha as fases de desenvolvimento do Hórus Cognitive OS, com um checklist para acompanhar o progresso. Ele reflete a visão de construir uma Agência de Empregos Digitais Universal, com foco em Integração Profunda para Funcionários de Execução e Agentes de Comando para profissionais solo.

## Princípios Arquiteturais Chave
Para garantir robustez, escalabilidade e confiabilidade, o Hórus prioriza consistência de estado, auditoria, conectores genéricos e Human-in-the-loop para ações críticas.

## 2. Arquitetura de Memória Infinita
- [x] Criação da estrutura de dados Base (`lib/memoryGraph.ts`)
- [ ] Implementar Memória de Curto Prazo e Longo Prazo
- [ ] Desenvolver `semanticPruning`
- [ ] Implementar TTL dinâmico

## 3. Reforço de Aprendizado de Elite
- [ ] Pesos proporcionais de feedback humano
- [ ] Retroalimentação prioritária nas rotas de contexto

## 4. Camada de Resiliência Autonômica
- [x] Circuit Breaker
- [ ] `performStateIntegrityCheck`
- [ ] Setup histórico adicional de `executions_log`

## 5. Fase 0: Fundação e MVP
- [x] Setup inicial
- [x] Supabase, LangGraph e Stripe
- [x] Hórus Core Engine base
- [ ] Grafo LangGraph completo
- [ ] Integração pg_vector adicional
- [ ] MVP Maria

---

## 09 — STUDIO

**Estado:** 🟡 PARTIAL — implementação e integração code-side concluídas até o limite verificável; COMPLETE ainda não é sustentado pela evidência disponível.

### Implementado / verificado estruturalmente

- Project Engine persistente em `studio_projects`, com ownership, objective, context, requirements, architecture, capabilities, connectors/integrations, execution graph, environment state, delivery e intelligence snapshot.
- Revision Engine em `studio_project_revisions`, com parent revision, versionamento, diff, optimized spec, approval e estados de teste/preview/deployment.
- Classificação canônica `MICRO / LOW / MEDIUM / MAJOR / REBUILD`, com estratégia de execução e recomputação proporcional.
- Nexus `OptimizedExecutionSpec` contextual e provider-invisible.
- Capability inference usando a registry canônica, preservando capabilities existentes e permitindo composição.
- Connector Engine com permissões granulares e Vault server-side.
- Permission-before-secret boundary, expiração/revogação de credencial e não divulgação de provider no contrato de execução.
- Approval boundary e lifecycle gates `PREVIEW → STAGING → PRODUCTION APPROVAL → DELIVERY`.
- Production mutation bloqueada no PATCH genérico.
- Rollback target validation no Revision Engine.
- Studio UI centrado em Nexus + Project + Revision.
- Suíte contratual do Studio ampliada para execution spec, lifecycle, approval e connector security.
- Migration `20260807230403_horus_studio_runtime_closure` aplicada.
- RLS live verificado nas quatro tabelas Studio principais.
- Vault functions live verificadas como service-role-only.
- Security Advisor live sem CRITICAL.

### Evidência de build/deployment

- Functional SHA: `fcff65e082d7e77bc7fdc80fe3e61193a3826953`
- Validation SHA: `d836fa73944a1ba0a6c8c93bf073c68a03e0eb13`
- Validation Vercel deployment: `dpl_2KubP6ijHMGFaFqvc2TGDYRkVNmT` — `READY`
- Current main SHA: `b433d3af981a4d64027dd39154cf6ccf8c9d39a9`
- Current main Vercel deployment at evidence capture: `dpl_8igbJ9HEt4Ux3WDiMbhmpNL7RUk5` — `BUILDING`
- Vercel build logs confirm cloning do SHA atual, instalação de dependências e execução de `npm run build`, sem erro reportado na captura.

### Não comprovado / blockers objetivos

- [ ] live connector E2E com credencial autorizada para GitHub/Vercel/Supabase;
- [ ] execução real de provider pela cadeia `Economic Authorization → Provider Adapter → Usage → Reconciliation → Delivery` originada pelo Studio;
- [ ] preview deployment dedicado criado pelo Studio;
- [ ] staging deployment/promotion real;
- [ ] production deployment/approval/rollback real através do Studio;
- [ ] deployment-to-revision correlation produzida por uma execução externa real;
- [ ] execução local de `npm test`, TypeScript e ESLint neste ambiente, pois não há checkout local acessível;
- [ ] GitHub Actions CI formal: o workflow canônico existe, mas não houve run recuperável para a validação SHA;

### Vercel

`velor-api` é comprovadamente o projeto Vercel conectado ao repositório `gusborba9-star/gusborba9-star-Horus-`, com branch `main` e correlação explícita de SHA/deployment.

### Supabase

Projeto `ljqmiuxztqseyglhvgmi` está ativo. As migrations Studio estão aplicadas e as políticas RLS foram inspecionadas diretamente.

### Boundary de bloco

03–08 permanecem fechados e não foram reabertos arquiteturalmente.

10 — AGENTS não iniciado.

12 — OBSERVABILITY permanece independente e não é antecipado por este fechamento.
