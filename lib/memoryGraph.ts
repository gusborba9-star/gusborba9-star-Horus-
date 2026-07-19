import { getServiceSupabase } from './supabase';

export interface MemoryNode {
  id?: string;
  node_type: 'operational_event' | 'core_knowledge' | 'human_feedback';
  content: string;
  embedding?: number[];
  importance: number;
  metadata: Record<string, any>;
  expires_at?: string;
  created_at?: string;
}

const HUMAN_FEEDBACK_WEIGHT_MULTIPLIER = 10;

/**
 * Hórus OS: Memory Graph Engine
 * Responsável por gerenciar a memória semântica, vetorização (pg_vector) e poda (Semantic Pruning).
 */
export class MemoryGraph {
  
  static async addNode(node: MemoryNode) {
    const supabase = getServiceSupabase();
    
    // Aplicar multiplicador de peso se for feedback humano
    if (node.node_type === 'human_feedback') {
      node.importance = (node.importance || 1) * HUMAN_FEEDBACK_WEIGHT_MULTIPLIER;
    }

    const { data, error } = await supabase
      .from('memory_graph_nodes')
      .insert([node])
      .select()
      .single();

    if (error) {
      console.error('Falha ao adicionar nó de memória:', error);
      throw error;
    }

    return data;
  }

  static async searchSimilarContext(queryEmbedding: number[], threshold: number = 0.8, limit: number = 5) {
    const supabase = getServiceSupabase();
    
    // Chamada para a função RPC do pg_vector no Supabase
    const { data, error } = await supabase.rpc('match_memory_nodes', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit
    });

    if (error) throw error;
    return data;
  }

  static async semanticPruning() {
    // TODO: Implementar lógica de TTL e sumarização com Gemini 1.5 Flash
    // 1. Buscar nós 'operational_event' expirados
    // 2. Sumarizar contexto
    // 3. Criar novo nó 'core_knowledge'
    // 4. Deletar nós antigos
    console.log('[MemoryGraph] Iniciando poda semântica...');
  }
}
