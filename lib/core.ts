import { GoogleGenAI, Content, FunctionDeclaration, Type, Tool } from '@google/genai';

/**
 * Validates and retrieves the Gemini API key.
 */
const getGeminiClient = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing.');
  }
  return new GoogleGenAI({ apiKey });
};

// Tool Declarations for Hórus Agents (Function Calling)
const generateBillingTool: FunctionDeclaration = {
  name: 'generateBilling',
  description: 'Gera uma cobrança via motor financeiro do Hórus OS para o cliente atual.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      amount: {
        type: Type.NUMBER,
        description: 'O valor da cobrança em Reais (BRL). Ex: 150.50',
      },
      description: {
        type: Type.STRING,
        description: 'Descrição breve do produto ou serviço sendo cobrado.',
      },
      customerName: {
        type: Type.STRING,
        description: 'Nome completo do cliente.',
      },
    },
    required: ['amount', 'description', 'customerName'],
  },
};

const escalateToHumanTool: FunctionDeclaration = {
  name: 'escalateToHuman',
  description: 'Transfere o atendimento para um atendente humano imediatamente. Use se o cliente estiver irritado, solicitar falar com humano, ou se o nível de complexidade exceder sua capacidade.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      reason: {
        type: Type.STRING,
        description: 'Motivo da transferência (ex: Cliente insatisfeito, Dúvida técnica complexa).',
      },
      sentiment: {
        type: Type.STRING,
        description: 'Análise de sentimento do cliente (positive, neutral, negative).',
      },
    },
    required: ['reason', 'sentiment'],
  },
};

export class CoreEngine {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = getGeminiClient();
  }

  /**
   * Generates the Dynamic Meta-Prompt (System Instruction) based on polymorphic Agent config.
   * This translates the UI config into a high-performance system prompt.
   */
  generateMetaPrompt(config: {
    name: string;
    niche: string;
    businessType: string;
    goal: string;
    tone: string;
    rules: string;
  }): string {
    return `
      Você é um Agente Polimórfico de Alta Performance operando pelo Hórus OS (desenvolvido pela Nexus Corp). Você é o Sistema Operacional Cognitivo Definitivo. 
      Sua Identidade/Nome atual: ${config.name}
      Setor/Nicho de Atuação atual: ${config.niche}
      Modelo de Negócio da Organização atual: ${config.businessType}
      
      Diretrizes de Personalidade e Tom de Voz (${config.tone}):
      Mantenha a postura e o vocabulário estritamente alinhados a um perfil ${config.tone}.
      
      Objetivo Principal desta Interação:
      ${config.goal}

      REGRAS INEGOCIÁVEIS DE NEGÓCIO E CONTORNO DE OBJEÇÕES:
      ${config.rules}

      DIRETRIZES GERAIS E ARQUITETURA COGNITIVA (NÍVEL PALANTIR):
      1. Polimorfismo Absoluto: Você é capaz de se adaptar instantaneamente a QUALQUER nicho ou necessidade. Você NUNCA recusa atuar em um setor, NUNCA diz "não fui programado para isso" e NUNCA fala de restrições técnicas.
      2. Superioridade Tecnológica: Nunca cite sistemas internos de terceiros (como Efí, Supabase, Gemini, Vercel). Todo o processamento, memória vetorial e motor financeiro pertencem exclusivamente ao ecossistema Hórus OS e Nexus Corp.
      3. Eficiência Comercial Absoluta: Seja direto, persuasivo e conduza a negociação. Se a intenção de compra for confirmada, utilize a ferramenta 'generateBilling' imediatamente para fechar a venda com o Motor Financeiro Hórus.
      4. Prevenção de Churn & Sentimento: Monitore ativamente a frustração. Se o cliente demonstrar irritação severa ou exigir um humano imperativamente, use a ferramenta 'escalateToHuman'.
      5. Otimização de Prompts Multimodais (Auto-Refinamento): Se o usuário solicitar a criação de imagens, vídeos, código ou campanhas de marketing complexas de forma genérica ou pobre, VOCÊ DEVE atuar como um Engenheiro de Prompt. Refine e otimize o pedido internamente antes de gerar a resposta final, entregando resultados ultra-sofisticados que extraem o máximo das APIs subjacentes do Hórus OS.
      
      Você é a vanguarda da inteligência artificial aplicada. Aja de acordo.
    `;
  }

  /**
   * Prompt Refiner Middleware (Otimização Cognitiva)
   * Intercepta solicitações genéricas de criação multimodal e as enriquece com engenharia de prompt avançada.
   */
  async refinePrompt(rawPrompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Você é o "Prompt Refiner" (Middleware de Otimização Cognitiva do Hórus OS).
Sua função é pegar um pedido de criação de conteúdo (imagem, vídeo, código, campanha de marketing) muitas vezes genérico ou pobre, e transformá-lo em um mega-prompt estruturado, rico em detalhes, personas, contexto e diretrizes técnicas.

Pedido original do usuário: "${rawPrompt}"

Se o pedido NÃO for de criação complexa (ex: apenas uma dúvida, saudação ou pedido de suporte), retorne EXATAMENTE o texto original, sem adicionar nada.
Se FOR um pedido de criação complexa (ex: "cria uma logo pra mim", "faz um site", "escreve uma campanha pra Black Friday"), reescreva o prompt de forma técnica, otimizada para extrair o máximo de uma IA geradora, incluindo contexto, tom de voz, detalhes visuais/estruturais e constraints de alta performance. Retorne APENAS o novo prompt otimizado.`,
        config: {
          temperature: 0.3,
        }
      });
      return response.text || rawPrompt;
    } catch (error) {
      console.error('[CoreEngine] Error during refinePrompt:', error);
      return rawPrompt; // Fallback to original
    }
  }

  /**
   * Initializes a chat session and streams the response with Function Calling support.
   */
  async streamChat(history: Content[], systemInstruction?: string) {
    try {
      const tools: Tool[] = [{ functionDeclarations: [generateBillingTool, escalateToHumanTool] }];
      
      const config: any = {
        temperature: 0.4, // Keep it focused, persuasive and precise
        tools,
      };

      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      // Using gemini-2.0-flash as a fallback for quota limits
      const responseStream = await this.ai.models.generateContentStream({
        model: 'gemini-2.0-flash',
        contents: history,
        config,
      });

      return responseStream;
    } catch (error) {
      console.error('[CoreEngine] Error during streamChat:', error);
      throw error;
    }
  }
}

export const coreEngine = new CoreEngine();
