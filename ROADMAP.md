# Hórus Cognitive OS: Roadmap de Desenvolvimento

Este roadmap detalha as fases de desenvolvimento do Hórus Cognitive OS, com um checklist para acompanhar o progresso. Ele reflete a visão de construir uma Agência de Empregos Digitais Universal, com foco em Integração Profunda para Funcionários de Execução e Agentes de Comando para profissionais solo.

## Princípios Arquiteturais Chave
Para garantir a robustez, escalabilidade e confiabilidade do Hórus, incorporamos os seguintes princípios arquiteturais desde o início:

1. **Consistência de Estado e Auditoria Imutável (Event Sourcing):** Priorizamos a integridade dos dados e a rastreabilidade de todas as ações dos Funcionários Digitais. O `executions_log` atua como uma trilha de auditoria imutável, permitindo a reconstrução de fluxos e a análise de decisões.
2. **Integração Flexível via Conectores Genéricos:** Evitamos integrações customizadas ponto a ponto. O Hórus consumirá dados de sistemas externos através de uma "Generic Connector Interface" (via webhooks normalizados).
3. **Orquestração com Camada de Confiança (Human-in-the-loop):** Para ações críticas, o Gerente IA avaliará um "Confidence Score". Se a confiança for baixa, o sistema pausará e solicitará aprovação humana.

## 2. Arquitetura de Memória Infinita: Memória Hierárquica, Poda Semântica e TTL Dinâmico
Objetivo: Garantir que o Memory Graph do Hórus possa escalar infinitamente sem explosão de custos ou degradação de performance.

- [x] Criação da estrutura de dados Base (`lib/memoryGraph.ts`)
- [ ] Implementar Memória de Curto Prazo (Operacional) e Longo Prazo (Core)
- [ ] Desenvolver função `semanticPruning` usando Gemini 1.5 Flash
- [ ] Implementar TTL (Time To Live) Dinâmico com pg_vector

## 3. Reforço de Aprendizado de Elite: Feedback Humano
- [ ] Implementar pesos proporcionais (`HUMAN_FEEDBACK_WEIGHT_MULTIPLIER = 10x`)
- [ ] Retroalimentação Prioritária nas rotas de contexto

## 4. Camada de Resiliência Autonômica
- [x] Implementar padrão Circuit Breaker (`utils/circuitBreaker.ts`)
- [ ] Desenvolver `performStateIntegrityCheck` (Auto-cura)
- [ ] Setup do `executions_log`

## 5. Fase 0: Fundação e MVP (Atendente "Maria")
- [x] Setup inicial (Next.js, Tailwind, Bibliotecas base)
- [x] Configuração e instalação de Supabase, LangGraph e Stripe
- [x] Criação do Hórus Core Engine base (`app/api/horus/route.ts`)
- [ ] Definição do Grafo LangGraph e Nodes do Gerente IA
- [ ] Integrar Supabase pg_vector e criar DB schemas
- [ ] MVP Maria (WhatsApp, Agendamento, Stripe)

---

## 09 — STUDIO

**Estado:** 🟡 PARTIAL — fechamento definitivo do estado atualmente comprovável.

### Comprovado / implementado

- Project Engine persistente sobre `studio_projects`.
- Project state com identity, objective, context, requirements, architecture, capabilities, connectors, execution graph, environment, delivery e intelligence snapshot.
- Revision Engine persistente sobre `studio_project_revisions`.
- Change classification: MICRO / LOW / MEDIUM / MAJOR / REBUILD.
- Nexus optimized execution specification.
- Capability inference usando a registry canônica existente.
- Connector Engine com permissões granulares.
- Vault-backed connector credential boundary.
- Authorized read adapters para GitHub, Vercel e Supabase.
- Production mutation bloqueada no PATCH genérico.
- Studio UI centrado em Nexus + Project + Revision, não em ferramentas independentes.
- Contract tests e workflow CI adicionados.
- Migration `horus_studio_runtime_closure` aplicada no Supabase.

### Ainda não comprovado / bloqueadores objetivos

- [ ] preview deployment real e dedicado;
- [ ] staging deployment/promotion real;
- [ ] production deployment + approval + rollback correlation;
- [ ] live connector E2E com credencial autorizada;
- [ ] execução real completa através de Economic Authorization → Provider Adapter → Usage → Reconciliation → Delivery;
- [ ] `npm test`, TypeScript, ESLint e production build executados no SHA final;
- [ ] deployment e runtime Vercel do repositório Hórus comprovados.

**Closure:** `docs/blueprint/09-STUDIO-CLOSURE.md`

## 10 — AGENTS

**Estado:** 🔒 NÃO INICIADO — não iniciar como parte do fechamento do 09.

## 11 — PERSONAL

**Estado:** 🔍 NÃO DETERMINADO / FUTURO.

## 12 — OBSERVABILITY

**Estado:** 🔍 NÃO DETERMINADO — bloco independente.

O fechamento de 09 não representa conclusão de Observability. Execution Log, eventos e estado operacional usados pelo Studio não equivalem a observabilidade end-to-end, tracing, métricas, dashboards, alerting ou reconstrução operacional completa.
