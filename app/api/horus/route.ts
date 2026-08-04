import { NextResponse } from 'next/server';
import { runHorusCore } from '@/lib/core/horusGraph';
import { geminiCircuitBreaker } from '@/utils/circuitBreaker';

/**
 * Hórus OS — Core Execution Endpoint.
 * Entrada canônica: request → LangGraph → memory/confidence → decision.
 * Provider execution permanece deliberadamente fora deste endpoint até que o
 * economic authorization contract esteja integrado ao graph.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event_type, payload, source } = body ?? {};

    const result = await geminiCircuitBreaker.execute(() =>
      runHorusCore({
        event_type,
        payload: payload && typeof payload === 'object' ? payload : {},
        source: typeof source === 'string' ? source : '',
      }),
    );

    const status = result.error ? 400 : result.requiresHuman ? 202 : 200;

    return NextResponse.json(
      {
        success: !result.error,
        data: {
          action: result.action,
          confidence_score: result.confidence,
          requires_human_review: result.requiresHuman,
          memory_matches: result.memoryContext.length,
        },
        error: result.error,
      },
      { status },
    );
  } catch (error) {
    console.error('[Hórus Core] Erro de orquestração:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno de orquestração',
      },
      { status: 500 },
    );
  }
}
