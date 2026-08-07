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

**Estado:** 🟡 PARTIAL — implementação ampliada e integrada; fechamento operacional ainda depende de evidência externa que não está disponível neste ambiente.

### Implementado / validado estruturalmente

- Project Engine persistente sobre `studio_projects`, com identity, objective, context, requirements, architecture, capabilities, connectors, execution graph, environment state, delivery e intelligence snapshot.
- Revision Engine persistente sobre `studio_project_revisions`, com parent revision, versionamento e classificação MICRO / LOW / MEDIUM / MAJOR / REBUILD.
- Nexus OptimizedExecutionSpec contextual, incluindo prompt otimizado, estado do projeto, capabilities, estratégia de recomputação e exigência de Economic Authorization.
- Capability inference reutilizando a registry canônica existente; composição preserva capabilities já associadas ao projeto.
- Connector Engine com permissões granulares e credenciais armazenadas via Vault.
- Boundary de connector endurecido: permissão é verificada antes do acesso ao secret, credenciais expiradas/revogadas são bloqueadas e provider não é devolvido como parte do contrato de execução.
- Approval boundary explícito para revisions.
- Lifecycle gates para PREVIEW → STAGING → PRODUCTION APPROVAL → DELIVERY e solicitação de rollback, sem permitir promoção sem validação dos gates anteriores.
- Production mutation bloqueada no PATCH genérico.
- Studio UI centrado em Nexus + Project + Revision, não em ferramentas independentes.
- Testes contratuais ampliados para execution spec, approval, lifecycle e connector security boundary.
- Migration `horus_studio_runtime_closure` aplicada no Supabase.

### Não comprovado / blockers objetivos

- [ ] execução real de provider através de Economic Authorization → Provider Adapter → Usage → Reconciliation → Delivery;
- [ ] live connector E2E com credencial autorizada;
- [ ] preview deployment real e dedicado criado pelo Studio;
- [ ] staging deployment/promotion real;
- [ ] production deployment + approval + rollback correlation executados em ambiente real;
- [ ] execução local de `npm test`, TypeScript, ESLint e production build neste ambiente (o ambiente de execução local não possui checkout do repositório);
- [ ] CI formal associado ao SHA de validação atual — validação CI está sendo executada em branch isolada antes de qualquer nova decisão de fechamento;

### Vercel

O projeto Vercel conectado é `velor-api`, e sua metadata identifica explicitamente o repositório `gusborba9-star/gusborba9-star-Horus-`, branch `main` e os SHAs correspondentes. Portanto, `velor-api` é o projeto Vercel efetivamente conectado ao repositório, não um deployment atribuído por inferência.

### Supabase

Projeto `ljqmiuxztqseyglhvgmi` está `ACTIVE_HEALTHY`. A migration `horus_studio_runtime_closure` está aplicada. As tabelas Studio e suas relações existem no banco real. Security Advisor não apresenta CRITICAL; permanecem INFOs de RLS sem policy em superfícies sistêmicas e o WARN conhecido de `reserve_horus_credits`, já estabelecido no domínio econômico.

### Boundary de bloco

03–08 não foram reabertos arquiteturalmente.
10 — AGENTS não iniciado.
12 — OBSERVABILITY permanece independente.
