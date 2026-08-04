# HÓRUS ENGINEERING BLUEPRINT

> **Source of truth operacional de engenharia.**
>
> Este documento governa descoberta, implementação, integração, validação, limpeza e evolução do Hórus. Não é documentação estética e não substitui evidência operacional.

**Branch de trabalho:** `chore/horus-foundation-rebuild`  
**Última atualização:** 2026-08-03  
**Estado da auditoria:** `DISCOVERY`  
**Regra central:** nenhuma estrutura nova pode ser criada sem demonstrar sua posição no grafo existente de imports, exports, contratos, consumidores, runtime, configuração, dependências, CI e deployment.

---

## 00 — GOVERNANCE

### 00.1 Princípios obrigatórios

1. Reutilizar antes de criar.
2. A implementação canônica existente é a fonte de verdade até prova documentada em contrário.
3. Nenhum módulo novo pode existir sem consumidor, contrato, dependências e estratégia de validação identificáveis.
4. Código, tabela, RPC, API ou componente não é considerado integrado apenas por existir.
5. TypeScript compilando não prova integração funcional.
6. Build passando não prova segurança econômica, RLS, idempotência ou runtime correto.
7. Não usar casts, `any`, `eslint-disable`, ignores ou `ignoreBuildErrors` para mascarar incompatibilidades.
8. Migrations e estado financeiro não podem ser duplicados por lógica paralela sem decisão arquitetural explícita.
9. Não remover artefatos sem evidência de ausência de consumidores estáticos, dinâmicos, de build, CI, deploy e banco.
10. Cada mudança deve ser rastreável a um contrato e a um consumidor real.

### 00.2 Estados oficiais

Somente estes estados podem ser usados:

- `NOT_STARTED`
- `DISCOVERY`
- `IN_PROGRESS`
- `BLOCKED`
- `IMPLEMENTED`
- `VERIFIED`
- `COMPLETE`
- `DEPRECATED`

### 00.3 Estados de auditoria retrospectiva

- `✅ CONCLUÍDO — implementado e validado operacionalmente.`
- `🟢 IMPLEMENTADO — existe e está integrado, mas falta validação completa.`
- `🟡 PARCIAL — existe parcialmente ou possui lacunas de integração.`
- `🔴 PENDENTE — precisa ser construído.`
- `⚠️ LEGADO/ÓRFÃO — não pertence à arquitetura atual ou não possui consumidor válido.`
- `🔍 NÃO DETERMINADO — evidência insuficiente.`

### 00.4 Definition of Done

Um item só pode ser `COMPLETE` quando todos os itens aplicáveis estiverem evidenciados:

- [ ] arquitetura definida;
- [ ] implementação existente auditada;
- [ ] dependências mapeadas;
- [ ] contrato definido;
- [ ] consumidores identificados;
- [ ] código implementado;
- [ ] imports/exports validados;
- [ ] TypeScript validado;
- [ ] ESLint validado;
- [ ] testes executados;
- [ ] integração validada;
- [ ] banco/API/serviço real validado quando aplicável;
- [ ] build validado;
- [ ] deployment validado quando aplicável;
- [ ] evidência registrada;
- [ ] Blueprint atualizado.

### 00.5 Evidence-based development

Cada milestone relevante deve registrar:

```text
Status:
Commit:
Branch:
Deployment:
Tests:
Build:
Evidence:
Date:
```

`COMPLETE` sem evidência operacional é inválido.

---

# HÓRUS ENGINEERING STATUS

| Domínio | Estado atual | Evidência / motivo |
|---|---|---|
| Foundation | 🟢 IMPLEMENTADO | Next 15.5.22, TypeScript 5.9.3, ESLint 9.39.1, Flat Config e parser TS/TSX presentes; build/deployment final precisa continuar sendo comprovado por SHA. |
| Core | 🟡 PARCIAL | Endpoint `/api/horus` existe, mas contém orchestration/LangGraph ainda em TODO e resposta demonstrativa. |
| Memory | 🟡 PARCIAL | `lib/memoryGraph.ts` possui insert/retrieval e RPC, mas pruning é TODO e lifecycle completo não está demonstrado. |
| Economic Core | 🟡 PARCIAL | Registries, Cost Engine, Credit Guard, adapters e Text Execution existem; Router atual ainda não demonstra todas as hard economic gates exigidas pelo Safety Gate. |
| API | 🟡 PARCIAL | Rotas existem, mas o mapa integral de consumidores e bypasses ainda está em auditoria. |
| Agents | 🔍 NÃO DETERMINADO | Estrutura integral e runtime ainda não foram comprovados neste ciclo. |
| Personal | 🔍 NÃO DETERMINADO | Estrutura integral e runtime ainda não foram comprovados neste ciclo. |
| Studio | 🟡 PARCIAL | Há estrutura de Studio conhecida, mas integração backend/serviços/billing por módulo ainda não está demonstrada integralmente. |
| Security | 🟡 PARCIAL | Há separação de client user-scoped/system no Economic Core e `SECURITY DEFINER`/RLS existentes no banco, mas auditoria global ainda está aberta. |
| Observability | 🔍 NÃO DETERMINADO | Há logs locais e estruturas econômicas, mas cobertura sistêmica não foi comprovada. |
| Testing | 🟡 PARCIAL | Script de testes existe; cobertura e execução completa ainda precisam de evidência atual. |
| Deployment | 🟢 IMPLEMENTADO | Vercel está conectado e deployments reais foram observados; estado `READY` deve ser registrado por deployment específico. |

### Gates

| Gate | Estado |
|---|---|
| Build Gate | CLOSED até evidência final do deployment atual com `READY` |
| Architecture Gate | OPEN — auditoria estrutural em andamento |
| Security Gate | CLOSED |
| Economic Safety Gate | CLOSED |
| Production Gate | CLOSED |

---

# 01 — FOUNDATION

## Contrato atual

```text
GitHub
  ↓
package.json + package-lock.json
  ↓
npm ci
  ↓
ESLint 9 Flat Config
  ↓
TypeScript 5.9.3
  ↓
Next.js 15.5.22 / SWC
  ↓
Vercel
```

### Evidência auditada

- `package.json` define Next `15.5.22`, React `19.2.2`, ESLint `9.39.1`, TypeScript `5.9.3`, `@typescript-eslint/parser 8.65.0`, `@next/eslint-plugin-next 15.5.22` e `eslint-config-next 15.5.22`.
- `eslint.config.mjs` usa Flat Config, `@typescript-eslint/parser` em `**/*.{ts,tsx}`, React, React Hooks e `@next/eslint-plugin-next`.
- `tsconfig.json` usa `strict: true`, `noEmit: true`, `moduleResolution: bundler`, `jsx: preserve` e inclui `**/*.ts`/`**/*.tsx`.
- `next.config.ts` mantém `ignoreBuildErrors: false`.
- CI executa `npm ci`, TypeScript, lint, tests e build.

**Estado:** `🟢 IMPLEMENTADO`, mas `COMPLETE` depende de evidência de execução final no mesmo SHA.

---

# 02 — CORE ARCHITECTURE

| Módulo | Responsabilidade | Inputs | Outputs | Dependências | Consumidores | Persistência | Estado |
|---|---|---|---|---|---|---|---|
| `/api/horus` | endpoint de entrada/orquestração | request JSON | NextResponse | circuit breaker | consumidores externos não mapeados integralmente | nenhuma demonstrada no código atual | 🟡 PARCIAL |
| Circuit Breaker | resiliência de provider | função async | resultado/erro | provider execution | `/api/horus` | não demonstrado | 🟢 IMPLEMENTADO |
| LangGraph orchestration | futura orquestração cognitiva | intenção/contexto | plano/ações | LangGraph | `/api/horus` | não demonstrado | 🔴 PENDENTE |

### Observação crítica

`app/api/horus/route.ts` contém comentários/TODOs para execution log, semantic cache, LangGraph e human-in-the-loop. O retorno atual é demonstrativo. Portanto o endpoint **não pode ser marcado como Core concluído** apenas por existir.

---

# 03 — MEMORY ARCHITECTURE

## Estrutura comprovada

`lib/memoryGraph.ts` contém:

- `MemoryNode`;
- inserção em `memory_graph_nodes`;
- `match_memory_nodes` via RPC;
- multiplicador de feedback humano;
- ponto de entrada `semanticPruning()`.

## Lacunas comprovadas

- `semanticPruning()` é TODO;
- TTL/lifecycle completo não está implementado;
- ownership e boundaries de retrieval não estão formalizados;
- compressão/hot/cold context não estão comprovados neste código.

**Estado:** `🟡 PARCIAL`.

Não criar outro Memory Graph até determinar se os componentes faltantes devem estender esta implementação.

---

# 04 — ECONOMIC CORE

## Mapa canônico conhecido

```text
Economic Policy
   ↓
Model / Provider Registry
   ↓
Cost Engine
   ↓
Economic Router
   ↓
Credit Hold
   ↓
Provider Adapter
   ↓
Actual Usage / Actual Cost
   ↓
Overage Detection
   ↓
System Overage RPC
   ↓
System Reconciliation RPC
   ↓
Ledger / Hold State
```

## Contratos críticos

### ModelRecord

`lib/economic/types.ts` define pricing e metadata como parte do contrato econômico, incluindo:

- input/output;
- request;
- image;
- reasoning;
- cached input;
- cache write;
- context;
- max completion;
- supported parameters;
- modalities;
- canonical slug;
- verification/expiration.

### Supabase registry

`lib/economic/supabase-registry.ts` rejeita preço ausente/inválido em vez de transformar desconhecimento em custo zero. Isso é comportamento compatível com a política de segurança econômica.

### Cost Engine

`lib/economic/cost-engine.ts` calcula custo estimado, máximo, buffers, margem mínima e créditos necessários. O modelo de custo máximo já considera output/reasoning/attempts e buffers econômicos.

### Credit Guard

`lib/economic/credit-guard.ts` separa explicitamente operações user-scoped das operações privilegiadas:

- `reserveCredits` — user-scoped RPC;
- `reconcileCreditsSystem` — operação privilegiada;
- `flagCreditOverageSystem` — operação privilegiada.

A integração recente de `text-execution.ts` utiliza as implementações sistêmicas existentes em vez de duplicar o contrato.

### Economic Router

O Router atual ainda calcula ranking por qualidade/confiabilidade/latência/preço e seleciona o primeiro candidato. Não está demonstrado que todas as hard gates exigidas pelo Economic Safety Gate estejam implementadas antes do ranking.

**Estado:** `🟡 PARCIAL`.

### Próximo gate econômico

Antes de qualquer expansão do domínio:

- pricing freshness;
- endpoint pricing;
- hard maximum-cost filter;
- margin guard;
- kill switch enforcement;
- bounded fallback tree;
- atomic execution budget;
- actual-cost reconciliation;
- economic tests.

---

# 05 — API / ROUTING

A auditoria atual confirma pelo menos o endpoint:

`POST /api/horus`

O inventário integral de `app/api/**` e o grafo completo Route → Component/Service → Core → Database → Provider ainda precisam ser fechados com evidência sistemática.

### Regra

Nenhuma rota pode ser marcada como `COMPLETE` apenas por existir. Deve haver:

```text
Route
 ↓
Auth
 ↓
Input Contract
 ↓
Service/Core
 ↓
Database / External Provider
 ↓
Error Handling
 ↓
Consumer
 ↓
Test
```

**Estado:** `🟡 PARCIAL`.

---

# 06 — AGENTS

### Auditoria requerida

- creation;
- configuration;
- runtime;
- tools;
- permissions;
- memory;
- execution;
- billing;
- lifecycle;
- persistence;
- consumers.

Nenhum componente atual deve ser considerado definitivo antes de essa cadeia ser comprovada.

**Estado:** `🔍 NÃO DETERMINADO`.

---

# 07 — PERSONAL

Auditar somente após a arquitetura existente ser mapeada. Não criar companion/memory paralelo.

**Estado:** `🔍 NÃO DETERMINADO`.

---

# 08 — STUDIO

Inventário obrigatório por módulo:

```text
UI
 ↓
Route
 ↓
Service
 ↓
Database
 ↓
External Provider
 ↓
Authentication
 ↓
Billing
 ↓
Validation
```

Módulos sem backend real devem ser marcados `🟡 PARCIAL`, nunca `COMPLETE`.

**Estado:** `🟡 PARCIAL`.

---

# 09 — SECURITY

## Controles já identificados

- `next.config.ts` não permite ignorar TypeScript build errors;
- Economic Core separa client user-scoped e system client;
- operações financeiras privilegiadas usam funções sistêmicas;
- banco possui controles transacionais/constraints conhecidos no Economic Core.

## Auditoria ainda aberta

- env/secrets global;
- service-role usage;
- RLS por tabela;
- SECURITY DEFINER global;
- webhooks;
- API authentication;
- logging de secrets/tokens;
- privileged operations fora do Economic Core.

**Estado:** `🟡 PARCIAL`.

---

# 10 — OBSERVABILITY

Itens a mapear:

- application logs;
- error tracking;
- audit events;
- execution events;
- economic events;
- agent events;
- API events;
- metrics;
- correlation/operation IDs.

Não assumir cobertura porque existem `console.*`.

**Estado:** `🔍 NÃO DETERMINADO`.

---

# 11 — TESTING

O `package.json` possui script:

```text
node --experimental-strip-types --test tests/**/*.test.mjs
```

CI possui etapas explícitas de TypeScript, lint, test e build.

A existência do script não prova cobertura. A matriz real de testes por domínio ainda precisa ser inventariada.

**Estado:** `🟡 PARCIAL`.

---

# 12 — DEPLOYMENT / BUILD GATE

## Gate obrigatório

```text
npm ci
 ↓
npm run lint
 ↓
npx tsc --noEmit
 ↓
npm test
 ↓
npm run build
 ↓
Vercel deployment
 ↓
READY
```

A ordem atual do CI é TypeScript → lint → tests → build. Isso não é considerado falha arquitetural neste momento; o contrato importante é que todas as etapas sejam executadas sem bypass.

**Estado:** `🟢 IMPLEMENTADO`; `COMPLETE` somente com evidência do deployment final.

---

# 13 — DATABASE GRAPH

## Padrão obrigatório

```text
Table
 ↓
RLS
 ↓
RPC / Function
 ↓
Service
 ↓
API
 ↓
UI
```

### Contratos econômicos conhecidos

O Economic Core já utiliza RPCs para reserva, overage e reconciliação. Essas RPCs são fonte de verdade do estado financeiro quando chamadas pelo fluxo sistêmico.

Não criar funções TypeScript paralelas para reproduzir semântica financeira já existente no PostgreSQL.

### Lacuna

O inventário integral de todas as migrations, tabelas e RPCs do repositório ainda está em `DISCOVERY`; nenhuma migration será removida neste ciclo.

---

# 14 — CONTRACT REGISTRY

| Contrato | Owner | Implementação conhecida | Consumidores conhecidos | Estado |
|---|---|---|---|---|
| ModelRecord | Economic Core | `lib/economic/types.ts` | registry/cost/router | 🟢 IMPLEMENTADO |
| ProviderTextResponse | Economic Core | `lib/economic/types.ts` | adapters/text execution | 🟢 IMPLEMENTADO |
| CreditHold | Economic Core | `lib/economic/credit-guard.ts` + RPCs | text execution | 🟢 IMPLEMENTADO |
| Credit reconciliation | PostgreSQL | system RPC | `reconcileCreditsSystem` | 🟢 IMPLEMENTADO |
| Credit overage | PostgreSQL | system RPC | `flagCreditOverageSystem` | 🟢 IMPLEMENTADO |
| MemoryNode | Memory | `lib/memoryGraph.ts` | MemoryGraph | 🟢 IMPLEMENTADO |
| `/api/horus` request/response | Core/API | route implementation | external/unknown | 🟡 PARCIAL |
| RoutingRequest | Economic Core | `lib/economic/types.ts` | EconomicRouter | 🟢 IMPLEMENTADO |

---

# 15 — IMPORT / EXPORT GOVERNANCE

Toda nova estrutura precisa de um registro explícito:

```text
Module
 ↓
Exports
 ↓
Consumers
 ↓
Dependencies
 ↓
Runtime
 ↓
Persistence
```

### Regras de descoberta

Antes de criar qualquer módulo, pesquisar:

- função equivalente;
- tipo/interface equivalente;
- tabela/RPC equivalente;
- service equivalente;
- adapter equivalente;
- route equivalente;
- component equivalente;
- consumidor existente.

O caso `flagCreditOverage` versus `flagCreditOverageSystem` é o padrão de referência para evitar duplicação de contrato.

---

# 16 — NO ORPHAN CODE

Todo módulo deve responder:

- responsabilidade;
- domínio;
- dependências;
- consumidores;
- outputs;
- persistência;
- auth/RLS;
- concurrency;
- idempotência;
- failure/retry;
- testes.

Sem essas respostas, o módulo não pode ser `COMPLETE`.

---

# 17 — REPOSITORY CLEANUP / LEGACY INVENTORY

## Regra

**Nenhum arquivo foi deletado neste ciclo.**

Os grupos de scripts históricos citados no processo (`fix_*`, `patch_*`, `rewrite_*`, `update_*`, `generate_*`, `format.js`, `add_break_words.js` etc.) devem ser classificados antes de qualquer remoção.

### Matriz obrigatória

| File | Category | package.json | CI | Docs | Imports | Dynamic refs | Runtime | Classification | Decision | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| scripts históricos não enumerados pelo índice atual | SCRIPT | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | 🔍 NÃO DETERMINADO | INVESTIGATE | auditoria de árvore ainda não fechada |

### Critério de DELETE

Só remover quando todos forem demonstrados como ausentes:

- imports;
- exports consumidos;
- route references;
- package scripts;
- CI;
- documentação;
- dynamic references conhecidas;
- runtime dependency;
- migration dependency;
- deployment dependency.

Se qualquer dimensão for desconhecida: **não deletar**.

---

# 18 — REPOSITORY AUDIT STATUS

### Evidências diretamente inspecionadas nesta retrospectiva

- `ROADMAP.md`;
- `package.json`;
- `eslint.config.mjs`;
- `tsconfig.json`;
- `next.config.ts`;
- `.github/workflows/ci.yml`;
- `lib/economic/types.ts`;
- `lib/economic/text-execution.ts`;
- `lib/economic/credit-guard.ts`;
- `lib/economic/router.ts`;
- `lib/economic/cost-engine.ts`;
- `lib/economic/supabase-registry.ts`;
- `lib/memoryGraph.ts`;
- `app/api/horus/route.ts`.

### Configurações procuradas

- `eslint.config.*`;
- `.eslintrc.*`;
- `.eslintignore`;
- `@rushstack/eslint-patch`;
- `eslint-config-next`;
- `@next/eslint-plugin-next`;
- TypeScript parser/configuration.

### Resultado importante

O repositório atual apresenta uma base TypeScript/Next real e um Economic Core já estruturado, mas várias áreas ainda possuem implementação parcial/TODO. A existência de arquivos relacionados não foi usada como prova de conclusão.

### Limitação de evidência

A interface de auditoria disponível nesta execução não forneceu uma listagem recursiva confiável da árvore Git inteira nem um índice de code search completo para todos os arquivos. Por isso, a classificação integral de scripts e órfãos permanece `🔍 NÃO DETERMINADO` até uma coleta de árvore/import graph verificável. Nenhuma remoção será feita com base em inferência.

---

# 19 — PROGRESS DASHBOARD

Os números abaixo representam **itens de domínio**, não quantidade de arquivos.

| Métrica | Valor atual | Evidência |
|---|---:|---|
| Domínios `🟢 IMPLEMENTADO` | 2 | Foundation, Deployment |
| Domínios `🟡 PARCIAL` | 6 | Core, Memory, Economic, API, Studio, Security, Testing* |
| Domínios `🔴 PENDENTE` | 1 | LangGraph orchestration dentro do Core |
| Domínios `🔍 NÃO DETERMINADO` | 3+ | Agents, Personal, Observability e subáreas não auditadas integralmente |
| Arquivos deletados | 0 | política de cleanup |
| Migrations deletadas | 0 | política de segurança |
| Implementações paralelas criadas nesta auditoria | 0 | Blueprint-only cycle |

`Testing` permanece `🟡 PARCIAL`, embora a tabela acima agrupe o domínio por estado operacional geral; os itens devem ser refinados quando a matriz de testes for inventariada.

---

# 20 — FEATURE INTAKE CHECKLIST

### Antes de implementar

- [ ] Existe implementação equivalente?
- [ ] Existe tabela equivalente?
- [ ] Existe RPC equivalente?
- [ ] Existe função equivalente?
- [ ] Existe tipo equivalente?
- [ ] Existe serviço equivalente?
- [ ] Existe rota equivalente?
- [ ] Existe componente equivalente?
- [ ] Existe contrato existente?
- [ ] Quem será consumidor?
- [ ] Quais módulos serão afetados?
- [ ] Há impacto econômico?
- [ ] Há impacto de segurança?
- [ ] Há impacto de memória?
- [ ] Há impacto de banco?
- [ ] Há impacto de deployment?

### Depois de implementar

- [ ] Implementado
- [ ] Integrado
- [ ] Imports/exports validados
- [ ] TypeScript validado
- [ ] ESLint validado
- [ ] Testado
- [ ] Build validado
- [ ] Deployment validado
- [ ] Evidência registrada
- [ ] Blueprint atualizado

---

# 21 — ORDEM DE TRABALHO APÓS ESTA AUDITORIA

1. Fechar inventário recursivo do repositório e import graph.
2. Fechar route graph.
3. Fechar database/RPC graph.
4. Classificar todos os scripts históricos sem deletar.
5. Resolver blockers de Build Gate ainda existentes.
6. Fechar Architecture Gate.
7. Somente depois executar cleanup de órfãos comprovados.
8. Depois fechar Economic Safety Integration Gate.
9. Só então iniciar API Migration e camadas superiores.

Nenhuma nova feature deve furar essa ordem sem uma decisão arquitetural registrada.

---

# 22 — CHANGE LOG DO BLUEPRINT

## 2026-08-03

- Blueprint operacional criado.
- `ROADMAP.md` preservado como visão de execução estratégica.
- Foundation/ESLint/TypeScript/Next auditados.
- Economic Core auditado em nível de contratos centrais.
- Memory Graph auditado em nível de implementação existente.
- `/api/horus` auditado e marcado parcial por TODOs reais.
- Nenhum arquivo de produção, migration ou script foi removido.
- Scripts históricos ainda não possuem classificação integral comprovada.
- Economic Safety Gate permanece fechado.
- Architecture Gate permanece aberto.
