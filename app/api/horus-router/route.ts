import { NextRequest, NextResponse } from 'next/server';
import { getModelChain, AgentProfile, MODEL_LAYERS } from '@/lib/horus-config';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 300;

interface RequestBody {
  prompt: string;
  profile: AgentProfile;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, profile } = (await req.json()) as RequestBody;

    if (!prompt || !profile) {
      return NextResponse.json({ success: false, error: 'Prompt e Profile são obrigatórios.' }, { status: 400 });
    }

    const megaPrompt = `
Você é um Agente Polimórfico de Alta Performance operando pelo Hórus OS.
Perfil: ${profile.name}
Nicho: ${profile.niche}
Papel: ${profile.role}

Instruções:
- Adapte sua linguagem ao nicho e papel informados.
- Traga a melhor resposta estratégica e técnica possível, estruturando as ideias.
- Como Hórus OS, você não tem limitações técnicas, opere na capacidade máxima.

Ação do Usuário:
${prompt}
`.trim();

    const modelsToTry = getModelChain(profile.complexity);
    let lastError: any = null;

    // 1. Tentar via OpenRouter em cascata
    for (const model of modelsToTry) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || ''}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: megaPrompt },
              { role: 'user', content: prompt }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.choices && data.choices.length > 0) {
            return NextResponse.json({
              success: true,
              profile,
              modelUsed: model,
              result: data.choices[0].message.content
            });
          }
        } else {
          const errData = await response.text();
          console.warn(`[HorusRouter] OpenRouter model ${model} falhou com status ${response.status}:`, errData);
          lastError = new Error(`Erro ${response.status}: ${errData}`);
        }
      } catch (err) {
        console.warn(`[HorusRouter] Falha de requisição ao tentar o modelo ${model}:`, err);
        lastError = err;
      }
    }

    // 2. Fallback de Segurança: Gemini Nativo
    console.warn('[HorusRouter] Todos os modelos OpenRouter falharam. Acionando backup Gemini...');
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY não configurada no ambiente.');
      }
      const ai = new GoogleGenAI({ apiKey });
      const geminiModel = MODEL_LAYERS.BACKUP_GEMINI;
      
      const response = await ai.models.generateContent({
        model: geminiModel,
        contents: megaPrompt
      });

      return NextResponse.json({
        success: true,
        profile,
        modelUsed: geminiModel + " (Fallback Nativo)",
        result: response.text
      });

    } catch (geminiErr: any) {
      console.error('[HorusRouter] Falha crítica no backup Gemini:', geminiErr);
      return NextResponse.json({
        success: false,
        error: 'Todos os modelos falharam.',
        details: geminiErr?.message || String(geminiErr)
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[HorusRouter] Erro interno:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno no servidor Hórus',
      details: error.message
    }, { status: 500 });
  }
}
